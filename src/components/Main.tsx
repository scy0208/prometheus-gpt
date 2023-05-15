import { Sidebar } from '@/components/Sidebar'
import Chat from '@/components/chat'
import { useState, useEffect, FC } from "react";
import { Conversation } from "@/types";
import {v4 as uuidv4} from "uuid";

interface Props {
  user: string
}

export const Main: FC<Props> = ({
  user
}) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation>();   
    
    useEffect(() => {
        const conversationHistory = JSON.parse(localStorage.getItem("conversationHistory") ?? "[]");
        const selectedConversation = JSON.parse(localStorage.getItem("selectedConversation") ?? "null");

        if (selectedConversation) {
          if (conversationHistory.length > 0) {
            setConversations(conversationHistory);
          } else {
            setConversations([selectedConversation]);
          }
          setSelectedConversation(selectedConversation);
        } else {
          if (conversationHistory.length > 0) {
            setConversations(conversationHistory);
            setSelectedConversation(conversationHistory[0]);
          } else {
            const newSelectedConversation = {
              id: uuidv4(),
              name: "",
              messages: [],
            };
            const newConversations = [newSelectedConversation];
            setConversations(newConversations);
            setSelectedConversation(newSelectedConversation);
          }
        }
      }, []);


    return (
        <div className='flex'>
          <Sidebar
            conversations={conversations}
            selectedConversation={selectedConversation}
            setConversations={setConversations}
            setSelectedConversation={setSelectedConversation}
          />
          <Chat
            user={user}
            conversations={conversations}
            selectedConversation={selectedConversation}
            setConversations={setConversations}
            setSelectedConversation={setSelectedConversation}
          />
        </div>
    )
}
