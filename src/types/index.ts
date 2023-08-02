export type Role = "assistant" | "user";

export interface Message {
    role: Role;
    content: string;
}

export interface MessageWithId extends Message {
    id: string
}

export interface Conversation {
    id: string;
    name: string;
    messages: MessageWithId[];
 }