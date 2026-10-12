export interface ChatSidebarProps {
  isMobile: boolean;
  setIsMobile: (val: boolean) => void;
  onChatClick: (chat: Chat) => void;
}
 
export type Chat = {
  id: number;
  messages: Message[]; 
  driver: User;
  rider: User;
  ride: Ride;
};

export type User = {
  id: number;
  name: string;
  lastName: string;
  
};

export type Ride = {
  id: number;
  
};

export interface Message {
  id: number;
  text: string;
  sender: {
    id: number;
    name: string;
    lastName: string;
  };
  chat: {
    id: number;
  };
  createdAt: string;
}