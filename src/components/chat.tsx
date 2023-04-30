'use client'
import { useRef, useState, useEffect } from 'react'
import { Auth } from 'aws-amplify';
import Router from 'next/router';
import { Trash, Logout } from 'tabler-icons-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import rehypeMathjax from 'rehype-mathjax';
import remarkMath from 'remark-math';

const Chat = () => {
    const messageInput = useRef<HTMLTextAreaElement | null>(null)
    const [dialogues, setDialogues] = useState<Array<{ role: string; content: string }>>([])
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const handleEnter = (
        e: React.KeyboardEvent<HTMLTextAreaElement> &
          React.FormEvent<HTMLFormElement>
    ) => {
        if (e.key === 'Enter' && isLoading === false) {
          e.preventDefault()
          setIsLoading(true)
          handleSubmit(e)
        }
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const message = messageInput.current?.value

        if (!message || message === undefined) {
          return
        }

        const updateDialogies = [...dialogues, { role: "user", content: message }]
        setDialogues(updateDialogies)
        messageInput.current!.value = ''
    
        const httpResponse = await fetch('/api/gpt-stream-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dialogues: updateDialogies
          }),
        })
    
        console.log(httpResponse)
    
        if (!httpResponse.ok) {
          throw new Error(httpResponse.statusText)
        }
    
        const data = httpResponse.body
        if (!data) {
          return
        }
    
        const reader = data.getReader()
        const decoder = new TextDecoder()
        let done = false
    
        setDialogues((prev) => [...prev, { role: "user", content: message }])    
        let currentResponse: string[] = []
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = decoder.decode(value)
          currentResponse = [...currentResponse, chunkValue]
          const message = currentResponse.join('')
          setDialogues((prev) => [...prev.slice(0, -1), { role: "assistant", content: message }])
        }
        // breaks text indent on refresh due to streaming
        // localStorage.setItem('dialogues', JSON.stringify(currentResponse));
        setIsLoading(false)
    }

    const handleReset = () => {
        localStorage.removeItem('dialogues')
        setDialogues([])
    }

    const handleSignout = async () =>  {
      try {
        await Auth.signOut();
        Router.reload()
      } catch (error) {
        console.log('error signing out: ', error);
      }
    }

    const renderMessaged = (item: any) => {
      if (item.role === "user" ) {
        return (
          <div className="chat-message">
            <div className="flex items-end justify-end">
                <div className="flex flex-col space-y-4 text-lg max-w-screen-lg mx-2 order-1 items-end px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white">
                  <ReactMarkdown>{item.content}</ReactMarkdown>
                </div>
                <img src="https://p6.itc.cn/images01/20220324/cfb33083dbec4b888b612aff575b6adc.jpeg" alt="My profile" className="w-6 h-6 rounded-full order-2"/>
            </div>
          </div>
        )
      } else {
        return (
          <div className="chat-message">
            <div className="flex items-end">
              <div className="flex flex-col space-y-4 text-lg max-w-screen-lg mx-2 order-2 items-start p-4 rounded-lg inline-block rounded-bl-none bg-gray-300">
              <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeRaw, rehypeMathjax]}
              components={{
                table({ children }) {
                  return <table className="border-collapse border border-black dark:border-white py-1 px-3">{children}</table>;
                },
                th({ children }) {
                  return <th className="border border-black dark:border-white break-words py-1 px-3 bg-gray-500 text-white">{children}</th>;
                },
                td({ children }) {
                  return <td className="border border-black dark:border-white break-words py-1 px-3">{children}</td>;
                }
              }}
            >
              {item.content}
            </ReactMarkdown>
              </div>
              <img src="https://ph-files.imgix.net/b739ac93-2899-4cc1-a893-40ea8afde77e.png" alt="My profile" className="w-6 h-6 rounded-full order-1"/>
            </div>
          </div>
        )
      }
    };

    const itemsToRender = isLoading ? dialogues : dialogues || null;



    return (
  <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen bg-gray-100">
   <div className="flex justify-end border-b-2 pb-2">
      <div className="flex space-x-2">
         <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-lg border h-10 w-10 hover:bg-gray-300">
         <Trash size={30} strokeWidth={2} color={'#6b7280'}/>
         </button>
         <button type="button" onClick={handleSignout} className="inline-flex items-center justify-center rounded-lg border h-10 w-10 hover:bg-gray-300">
         <Logout size={30} strokeWidth={2} color={'#6b7280'}/>
         </button>
      </div>
   </div>
   <div id="messages" className="flex flex-col space-y-4 p-3 overflow-y-auto">
      {itemsToRender && itemsToRender.map(renderMessaged)}
   </div>
   <div className="border-t-2 border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <form
        onSubmit={handleSubmit}
      >
      <div className="relative flex">
         <textarea 
          name="Message" 
          placeholder="Write your message!" 
          ref={messageInput}
          onKeyDown={handleEnter}
          className="w-full h-12 focus:outline-none focus:placeholder-gray-400 text-gray-600 placeholder-gray-600 pl-5 bg-gray-200 rounded-md py-3"/>
         <div className="absolute right-0 items-center inset-y-0 hidden sm:flex">
            <button 
             type="submit" disabled={isLoading}
             className="inline-flex items-center justify-center rounded-lg px-4 py-3 transition duration-500 ease-in-out text-white bg-blue-500 hover:bg-blue-400 focus:outline-none">
               <span className="font-bold">Send</span>
               
            </button>
         </div>
      </div>
      </form>
   </div>
</div>
    )
}

export default Chat;