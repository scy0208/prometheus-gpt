import { Sidebar } from '@/components/Sidebar'
import Chat from '@/components/chat'
import { useState } from "react";
import { Conversation } from "@/types";

export const Main = () => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<Conversation>();   
    
    return (
        <div className='flex'>
          <Sidebar
            conversations={conversations}
            selectedConversation={selectedConversation}
            setConversations={setConversations}
            setSelectedConversation={setSelectedConversation}
          />
          <Chat
            conversations={conversations}
            selectedConversation={selectedConversation}
            setConversations={setConversations}
            setSelectedConversation={setSelectedConversation}
          />
        </div>
    )
}
