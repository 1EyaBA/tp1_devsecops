import React, { useEffect, useRef } from 'react';

interface Message {
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

interface ChatMessagesProps {
  messages: Message[];
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;

  chatId: number;
  currentUserId: number;
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages,setMessages, chatId, currentUserId }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

/*  useSubscription(MESSAGE_SUBSCRIPTION, {
    variables: { chatId },
    onData: ({ data }) => {
      // The messages will be updated in the parent component through Apollo cache
      scrollToBottom();
    },
  });*/

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format the date to a readable time
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4">
      {messages.map((message) => (
        <div 
          key={message.id}
          className={`mb-4 flex ${message.sender.id === currentUserId ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`max-w-[70%] rounded-lg px-4 py-2 ${
              message.sender.id === currentUserId 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-200 dark:bg-gray-700 dark:text-white'
            }`}
          >
            <div className="text-sm">{message.text}</div>
            <div className="mt-1 text-xs text-right opacity-70">
              {formatTime(message.createdAt)}
            </div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatMessages;