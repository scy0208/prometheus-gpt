import { Plus, Message, Trash } from 'tabler-icons-react'
import { Logo } from '../components/logo'
import { Conversation } from "@/types";
import { FC, useEffect } from 'react';
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

  useEffect(() => {
    const conversationHistory = localStorage.getItem("conversationHistory");

    if (conversationHistory) {
      setConversations(JSON.parse(conversationHistory));
    }

    const selectedConversation = localStorage.getItem("selectedConversation");
    if (selectedConversation) {
      setSelectedConversation(JSON.parse(selectedConversation));
    } else {
      setSelectedConversation({
        id: uuidv4(),
        name: "",
        messages: []
      });
    }
  }, []);

const handleNewConversation = () => {
    const newConversation: Conversation = {
        id: uuidv4(),
        name: "",
        messages: []
    };

    const updatedConversations = [...conversations, newConversation];
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
    setSelectedConversation(undefined);
    localStorage.removeItem("selectedConversation");
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