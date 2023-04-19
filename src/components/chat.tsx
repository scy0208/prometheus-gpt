'use client'
import { useRef, useState } from 'react'
import { Auth } from 'aws-amplify';
import Router from 'next/router';

const Chat = () => {
    const messageInput = useRef<HTMLTextAreaElement | null>(null)
    const [response, setResponse] = useState<string[]>([])
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
        if (message !== undefined) {
          setResponse((prev) => [...prev, message])
          messageInput.current!.value = ''
        }
    
        if (!message) {
          return
        }
    
        const response = await fetch('/api/gpt-stream-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message,
          }),
        })
    
        console.log(response)
    
        if (!response.ok) {
          throw new Error(response.statusText)
        }
    
        const data = response.body
        if (!data) {
          return
        }
    
        const reader = data.getReader()
        const decoder = new TextDecoder()
        let done = false
    
        setResponse((prev) => [...prev, message])
    
        let currentResponse: string[] = []
        while (!done) {
          const { value, done: doneReading } = await reader.read()
          done = doneReading
          const chunkValue = decoder.decode(value)
          // currentResponse = [...currentResponse, message, chunkValue];
          currentResponse = [...currentResponse, chunkValue]
          setResponse((prev) => [...prev.slice(0, -1), currentResponse.join('')])
        }
        // breaks text indent on refresh due to streaming
        // localStorage.setItem('response', JSON.stringify(currentResponse));
        setIsLoading(false)
    }

    const handleReset = () => {
        localStorage.removeItem('response')
        setResponse([])
    }

    const handleSignout = async () =>  {
      try {
        await Auth.signOut();
        Router.reload()
      } catch (error) {
        console.log('error signing out: ', error);
      }
    }

    const renderMessaged = (item: any, index: number) => {
      if (index % 2 === 0 ) {
        return (
          <div className="chat-message">
            <div className="flex items-end justify-end">
                <div className="flex flex-col space-y-2 text-lg max-w-xs mx-2 order-1 items-end">
                  <div><span className="px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white">{item}</span></div>
                </div>
                <img src="https://images.unsplash.com/photo-1590031905470-a1a1feacbb0b?ixlib=rb-1.2.1&amp;ixid=eyJhcHBfaWQiOjEyMDd9&amp;auto=format&amp;fit=facearea&amp;facepad=3&amp;w=144&amp;h=144" alt="My profile" className="w-6 h-6 rounded-full order-2"/>
            </div>
          </div>
        )
      } else {
        return (
          <div className="chat-message">
            <div className="flex items-end">
              <div className="flex flex-col space-y-2 text-lg max-w-xs mx-2 order-2 items-start">
                  <div><span className="px-4 py-2 rounded-lg inline-block rounded-bl-none bg-gray-300 text-gray-600">{item}</span></div>
              </div>
              <img src="https://ph-files.imgix.net/b739ac93-2899-4cc1-a893-40ea8afde77e.png" alt="My profile" className="w-6 h-6 rounded-full order-1"/>
            </div>
          </div>
        )
      }
    };

    const itemsToRender = isLoading ? response : response || null;



    return (
  <div className="flex-1 p:2 sm:p-6 justify-between flex flex-col h-screen">
   <div className="flex sm:items-center justify-between py-3 border-b-2 border-gray-200">
      <div className="relative flex items-center space-x-4">
         <img src="https://ph-files.imgix.net/b739ac93-2899-4cc1-a893-40ea8afde77e.png" alt="" className="w-10 sm:w-16 h-10 sm:h-16 rounded-full"/>
         <div className="flex flex-col leading-tight">
            <div className="text-2xl mt-1 flex items-center">
               <span className="text-gray-700 mr-3">OpenAI</span>
            </div>
            <span className="text-md text-gray-600">GPT-3.5</span>
         </div>
      </div>
      <div className="flex items-center space-x-2">
         <button type="button" onClick={handleReset} className="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-archive-fill" viewBox="0 0 16 16"> 
            <path d="M12.643 15C13.979 15 15 13.845 15 12.5V5H1v7.5C1 13.845 2.021 15 3.357 15h9.286zM5.5 7h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1 0-1zM.8 1a.8.8 0 0 0-.8.8V3a.8.8 0 0 0 .8.8h14.4A.8.8 0 0 0 16 3V1.8a.8.8 0 0 0-.8-.8H.8z"/> 
            </svg>
         </button>
         <button type="button" onClick={handleSignout} className="inline-flex items-center justify-center rounded-lg border h-10 w-10 transition duration-500 ease-in-out text-gray-500 hover:bg-gray-300 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
               <line x1="21" y1="12" x2="9" y2="12"></line>
               <polyline points="16 17 21 12 16 7"></polyline>
            </svg>
         </button>
      </div>
   </div>
   <div id="messages" className="flex flex-col space-y-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
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
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6 ml-2 transform rotate-90">
                  <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
               </svg>
            </button>
         </div>
      </div>
      </form>
   </div>
</div>
    )
}

export default Chat;