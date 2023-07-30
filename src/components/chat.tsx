'use client'
import { useRef, useState, FC, useEffect } from 'react'
import { Auth } from 'aws-amplify';
import Router from 'next/router';
import { Trash, Logout, PlayerStop } from 'tabler-icons-react';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from 'rehype-raw';
import rehypeMathjax from 'rehype-mathjax';
import remarkMath from 'remark-math';
import {v4 as uuidv4} from "uuid";

import { Conversation, Message } from "@/types";

interface Props {
  user: string;
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversation: (selectedConversation: Conversation | undefined) => void;
}


const Chat : FC<Props> = ({
  user,
  conversations,
  selectedConversation,
  setConversations,
  setSelectedConversation
}) => {

    const messageInput = useRef<HTMLTextAreaElement | null>(null)

    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [limit, setLimit] = useState<boolean>(false)

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const stopConversationRef = useRef<boolean>(false);

    const scrollToBottom = () => {
      console.log("scrollToBottom called")
      messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
    };
  
    useEffect(() => {
      if (process.env.NEXT_PUBLIC_TRIAL_PERIOD_LIMITATION 
        && selectedConversation 
        && selectedConversation.messages.length >= parseInt(process.env.NEXT_PUBLIC_TRIAL_PERIOD_LIMITATION)) {
        setLimit(true);
      } else {
        setLimit(false);
      }
      scrollToBottom();
    }, [selectedConversation?.messages]);

    const handleEnter = (
        e: React.KeyboardEvent<HTMLTextAreaElement> &
          React.FormEvent<HTMLFormElement>
    ) => {
        if (e.key === "Enter" && !e.shiftKey) {
          if (isLoading===true) {
            return
          }

          e.preventDefault()
          handleSubmit(e)
        }
    }

    const storePrompt = async(conversation: string, role: string, message: string) => {
      try {
        const response = await fetch('/api/store-prompt', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            conversation,
            username: role,
            message
          }),
        });
    
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }     
        // Now you can process the response or just check if it's ok
      } catch (error) {
        console.error('Error occurred while calling /api/store-prompt:', error);
      }  
    }

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {

        e.preventDefault()  
        if (!selectedConversation) {
          return
        }

        if (limit) {
          return
        }

        const message = messageInput.current?.value

        if (!message || message === undefined) {
          return
        }
        // selectedConversation is the current dialogue

        setIsLoading(true)

        let updatedConversation: Conversation = {
          ...selectedConversation,
          messages: [...selectedConversation.messages, { role: "user", content: message }]
        };
        setSelectedConversation(updatedConversation)
        messageInput.current!.value = ''
        const controller = new AbortController();
    
        const httpResponse = await fetch('/api/gpt-stream-api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          body: JSON.stringify({
            conversation:selectedConversation.id,
            username: user,
            message,
            dialogues: updatedConversation.messages
          }),
        })
    
        console.log(httpResponse)
    
        if (!httpResponse.ok) {
          throw new Error(httpResponse.statusText)
        }

        if (!httpResponse.body) {
          return new Error("No body of the response")
        }
    
        updatedConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages, {role: "assistant", content: ""}]
        }
        setSelectedConversation(updatedConversation)
        updatedConversation = await handleOpenAIResponse(controller, httpResponse, updatedConversation)
        
        // breaks text indent on refresh due to streaming
        // localStorage.setItem('dialogues', JSON.stringify(currentResponse));
        setIsLoading(false)
        localStorage.setItem("selectedConversation", JSON.stringify(updatedConversation));

        const updatedConversations: Conversation[] = conversations.map((conversation) => {
          if (conversation.id === selectedConversation.id) {
            return updatedConversation;
          }
  
          return conversation;
        });
  
        if (updatedConversations.length === 0) {
          updatedConversations.push(updatedConversation);
        }
  
        setConversations(updatedConversations);
  
        localStorage.setItem("conversationHistory", JSON.stringify(updatedConversations));
        
        storePrompt(selectedConversation.id, user, message)
        storePrompt(selectedConversation.id, "assistant", updatedConversation.messages[updatedConversation.messages.length - 1].content)
    }

    const handleOpenAIResponse = async (controller: AbortController, httpResponse: Response, updatedConversation: Conversation) => {
      const data = httpResponse.body
        if (!data) {
          return updatedConversation
        }
    
      const reader = data.getReader()
      const decoder = new TextDecoder()
      let done = false

      let currentResponse: string[] = []
      while (!done) {
        if (stopConversationRef.current === true) {
          controller.abort();
          done = true;
          break;
        }

        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        currentResponse = [...currentResponse, chunkValue]
        const message = currentResponse.join('')
        updatedConversation = {
          ...updatedConversation,
          messages: [...updatedConversation.messages.slice(0, -1), { role: "assistant", content: message }]
        }
        setSelectedConversation(updatedConversation)
      }
      return updatedConversation;
    }

    const handleClaudeResponse = async (controller: AbortController, httpResponse: Response, updatedConversation: Conversation) => {
      const data = httpResponse.body
        if (!data) {
          return updatedConversation
        }
    
      const reader = data.getReader()
      const decoder = new TextDecoder()
      let done = false
      while (!done) {
        if (stopConversationRef.current === true) {
          controller.abort();
          done = true;
          break;
        }

        const { value, done: doneReading } = await reader.read()
        done = doneReading
        const chunkValue = decoder.decode(value)
        if (chunkValue != '') {
          updatedConversation = {
            ...updatedConversation,
            messages: [...updatedConversation.messages.slice(0, -1), { role: "assistant", content: chunkValue }]
          }
          setSelectedConversation(updatedConversation)
        } 
      }
      return updatedConversation;
    }


    const handleReset = () => {
      if (!selectedConversation) {
        return
      }
      const updatedConversations: Conversation[] = conversations.map((conversation) => {
        if (conversation.id === selectedConversation.id) {
          return {
            ...conversation,
            messages: []
          };
        }
        return conversation;
      });

      if (updatedConversations.length === 0) {
        const newConversation = {
          id: uuidv4(),
          name: "",
          messages: []
        }
        updatedConversations.push(newConversation);
        localStorage.setItem("selectConversation", JSON.stringify(newConversation));
        setSelectedConversation(newConversation);
      } else {
        const updatedConversations: Conversation[] = conversations.map((conversation) => {
          if (conversation.id === selectedConversation.id) {
            return {
              ...conversation,
              messages: []
            };
          }
          return conversation;
        });
        const newConversation = updatedConversations.find(c => c.id === selectedConversation.id)
        localStorage.setItem("selectConversation", JSON.stringify(newConversation));
        setSelectedConversation(newConversation)
      }
      localStorage.setItem("conversationHistory", JSON.stringify(updatedConversations));
      setConversations(updatedConversations);
    }

    const handleSignout = async () =>  {
      try {
        await Auth.signOut();
        Router.reload()
      } catch (error) {
        console.log('error signing out: ', error);
      }
    }

    const renderMessages = (item: Message) => {
      if (item.role === "user" ) {
        return (
          <div className="chat-message">
            <div className="flex items-end justify-end">
                <div className="flex flex-col space-y-4 text-lg max-w-screen-lg mx-2 order-1 items-start px-4 py-2 rounded-lg inline-block rounded-br-none bg-blue-600 text-white">
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

    const itemsToRender = isLoading ? selectedConversation?.messages : selectedConversation?.messages || null;

    const handleStopConversation = () => {
      stopConversationRef.current = true;
      setTimeout(() => {
        stopConversationRef.current = false;
      }, 1000);
    };


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
   <div id="messages" className="flex flex-col space-y-4 p-3 overflow-auto">
      {itemsToRender && itemsToRender.map(renderMessages)}
      <div ref={messagesEndRef} />
   </div>
   <div className="px-4 pt-4 mb-2 sm:mb-0">
   {isLoading && (
          <button
            className="mx-auto mb-3 flex w-fit items-center gap-3 rounded border border-neutral-200 bg-white py-2 px-4 text-black hover:opacity-50 dark:border-neutral-600 dark:bg-[#343541] dark:text-white md:mb-0 md:mt-2"
            onClick={handleStopConversation}
          >
            <PlayerStop size={16} /> {('Stop Generating')}
          </button>
        )}
    {limit && process.env.NEXT_PUBLIC_TRIAL_PERIOD_LIMITATION &&
        (<div className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3" role="alert">
          <p className="text-sm"> 试用期不支持{parseInt(process.env.NEXT_PUBLIC_TRIAL_PERIOD_LIMITATION)/2}轮以上长对话，请联系管理员。您可以清空聊天记录继续使用。 </p>
        </div>)
    }
      <form
        onSubmit={handleSubmit}
      >
      <div className="relative flex">
         <textarea 
          ref={messageInput}
          name="Message" 
          placeholder="Write your message!" 
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