import { Plus, Message, Trash } from 'tabler-icons-react'
import { Logo } from '../components/logo'
import { Conversation } from "@/types";
import { FC, useEffect, useState } from 'react';
import {v4 as uuidv4} from "uuid";

interface Props {
  conversations: Conversation[];
  selectedConversation: Conversation | undefined;
  setConversations: (conversations: Conversation[]) => void;
  setSelectedConversation: (selectedConversation: Conversation | undefined) => void;
}
export const Sidebar: FC<Props> = ({
  conversations,
  selectedConversation,
  setConversations,
  setSelectedConversation
}) => {

const [limit, setLimit] = useState<boolean>(false)

useEffect(() => {
  if (process.env.NEXT_PUBLIC_TRIAL_PERIOD_LIMITATION 
    && conversations 
    && conversations.length >= parseInt(process.env.NEXT_PUBLIC_TRIAL_PERIOD_LIMITATION)) {
    setLimit(true);
  } else {
    setLimit(false);
  }
}, [conversations]);

const handleNewConversation = () => {
    if (limit) {
      return
    }

    const newConversation: Conversation = {
        id: uuidv4(),
        name: "",
        messages: []
    };

    const updatedConversations = [newConversation, ...conversations];
    setConversations(updatedConversations);
    localStorage.setItem("conversationHistory", JSON.stringify(updatedConversations));

    setSelectedConversation(newConversation);
    localStorage.setItem("selectedConversation", JSON.stringify(newConversation));
};

const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    localStorage.setItem("selectedConversation", JSON.stringify(conversation));
};

const handleDeleteConversation = (conversation: Conversation) => { 
  const updatedConversations = conversations.filter((c) => c.id !== conversation.id);
  setConversations(updatedConversations);
  localStorage.setItem("conversationHistory", JSON.stringify(updatedConversations));

  if (selectedConversation && selectedConversation.id === conversation.id) {
    if (updatedConversations.length > 0) {
      setSelectedConversation(updatedConversations[0])
      localStorage.setItem("selectedConversation", JSON.stringify(updatedConversations[0]));
    } else {
      const newSelectedConversation = {
        id: uuidv4(),
        name: "",
        messages: []
      }
      const newConversations = [newSelectedConversation]
      setConversations(newConversations)
      setSelectedConversation(newSelectedConversation)
      localStorage.setItem("conversationHistory", JSON.stringify(newConversations));
      localStorage.setItem("selectedConversation", JSON.stringify(newSelectedConversation));
    }
  }
};

  return (
    <div className="flex flex-col space-y-3 p-3 bg-slate-300 w-[300px] hidden md:flex">
      <Logo/>
      <div className="flex items-center justify-center h-[60px]">
        <button 
          className="flex items-center w-full h-[40px] rounded-lg text-sm hover:bg-slate-400 border border-white"
          onClick={handleNewConversation}
        >
          <Plus
            className="ml-4 mr-3"
            size={16}
          />
          New chat
        </button>
      </div>

      {limit &&
        (<div className="bg-blue-100 border-t border-b border-blue-500 text-blue-700 px-4 py-3" role="alert">
          <p className="text-sm"> 试用期不支持保存{process.env.NEXT_PUBLIC_TRIAL_PERIOD_LIMITATION}个以上历史记录，请联系管理员 </p>
        </div>)
      }

      <div className="flex-1 mx-auto pb-2 overflow-auto w-full">
        {conversations.map((conversation, index) => (
            <div
              key={index}
              className={`flex items-center justify-start w-full h-[40px] px-2 text-sm rounded-lg hover:bg-slate-400 cursor-pointer ${selectedConversation && selectedConversation.id === conversation.id ? "bg-slate-500 text-white" : ""}`}
              onClick={() => handleSelectConversation(conversation)}
            >
              <Message
                className="mr-2 min-w-[20px]"
                size={18}
              />
              <div className="overflow-hidden whitespace-nowrap overflow-ellipsis pr-1">{conversation.messages[0] ? conversation.messages[0].content : "Empty conversation"}</div>
    
              <Trash
                className="ml-auto min-w-[20px] text-neutral-400 hover:text-neutral-100"
                size={18}
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteConversation(conversation);
                }}
              />
            </div>
          ))}
      </div>
    </div>
  );
};