import React, { useEffect, useState, useRef } from 'react';
import ChatMessages from './chatMessages';
import ChatInput from './chatInput';
import { useMessagesByChat } from '../../hooks/useMessagesByChat';
import { Chat, Message } from '../../types/chat';
import { useSocket } from '../../hooks/useSocket';

interface ChatBoxProps {
  chatId: number;
}

const ChatBox: React.FC<ChatBoxProps> = ({ chatId }) => {
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [messages, setMessages] = useState<Message[]>([]);
  const { socket, isConnected } = useSocket();
  const processedIdsRef = useRef(new Set<number>());

  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token;
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user?.id;
  console.log("user", user);

  // Get messages for the chat
  const { loading: messagesLoading, error: messagesError, data: messagesData, refetch } = 
    useMessagesByChat(chatId, page, limit);
    
  useEffect(() => {
    if (messagesData?.getChatMessages) {
      setMessages(messagesData.getChatMessages);
    }
  }, [messagesData]);

  // Join the chat room when component mounts
  useEffect(() => {
    if (socket && isConnected && chatId) {
      console.log(`Joining chat room: ${chatId}`);
      socket.emit('joinRoom', chatId);
      
      const handleMessageReceived = (newMessage: Message) => {
        // Check if we've already processed this message ID
        if (processedIdsRef.current.has(newMessage.id)) {
          console.log('Skipping duplicate message ID:', newMessage.id);
          return;
        }

        console.log("🔔 Socket received message:", newMessage);
        processedIdsRef.current.add(newMessage.id);

        setMessages(prev => {
          // Double-check to avoid duplicates (in case multiple components process the same event)
          const isDuplicate = prev.some(m => m.id === newMessage.id);
          
          if (isDuplicate) {
            console.log('Duplicate message detected, skipping');
            return prev;
          }

          return [...prev, newMessage];
        });
      };
    
      socket.on('messageReceived', handleMessageReceived);
    
      return () => {
        console.log(`Leaving chat room: ${chatId}`);
        socket.emit('leaveRoom', chatId);
        socket.off('messageReceived', handleMessageReceived);
      };
    }
  }, [socket, isConnected, chatId]);

  const handleMessageSent = () => {
    refetch();
  };

  if (messagesLoading) return <p className="p-4 text-center">Loading...</p>;
  
  if (messagesError) return <p className="p-4 text-center text-red-500">Error loading messages</p>;

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:w-3/4">
      {/* Chat Header */}
      <div className="sticky flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800 xl:px-6">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-full max-w-[48px] rounded-full">
            <img 
              src={user.imageUrl} 
              alt={`${user.name}'s profile`}
              className="h-full w-full overflow-hidden rounded-full object-cover object-center" 
            />
            
            <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
          </div>
          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
            Conversation            
          </h4>
          <h5 className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {user.name} {user.lastName}
          </h5>
        </div>

        <div className="flex items-center gap-3">
          <button className="text-gray-700 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90">
            <svg className="stroke-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5.54488 11.7254L8.80112 10.056C8.94007 9.98476 9.071 9.89524 9.16639 9.77162C9.57731 9.23912 9.66722 8.51628 9.38366 7.89244L7.76239 4.32564C7.23243 3.15974 5.7011 2.88206 4.79552 3.78764L3.72733 4.85577C3.36125 5.22182 3.18191 5.73847 3.27376 6.24794C3.9012 9.72846 5.56003 13.0595 8.25026 15.7497C10.9405 18.44 14.2716 20.0988 17.7521 20.7262C18.2615 20.8181 18.7782 20.6388 19.1442 20.2727L20.2124 19.2045C21.118 18.2989 20.8403 16.7676 19.6744 16.2377L16.1076 14.6164C15.4838 14.3328 14.7609 14.4227 14.2284 14.8336C14.1048 14.929 14.0153 15.06 13.944 15.1989L12.2747 18.4552" stroke="" strokeWidth="1.5"></path>
            </svg>
          </button>

          <button className="text-gray-700 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white/90">
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M4.25 5.25C3.00736 5.25 2 6.25736 2 7.5V16.5C2 17.7426 3.00736 18.75 4.25 18.75H15.25C16.4926 18.75 17.5 17.7426 17.5 16.5V15.3957L20.1118 16.9465C20.9451 17.4412 22 16.8407 22 15.8716V8.12838C22 7.15933 20.9451 6.55882 20.1118 7.05356L17.5 8.60433V7.5C17.5 6.25736 16.4926 5.25 15.25 5.25H4.25ZM17.5 10.3488V13.6512L20.5 15.4325V8.56756L17.5 10.3488ZM3.5 7.5C3.5 7.08579 3.83579 6.75 4.25 6.75H15.25C15.6642 6.75 16 7.08579 16 7.5V16.5C16 16.9142 15.6642 17.25 15.25 17.25H4.25C3.83579 17.25 3.5 16.9142 3.5 16.5V7.5Z" fill=""></path>
            </svg>
          </button>
        </div>
      </div>
      
      <ChatMessages 
        messages={messages} 
        setMessages={setMessages}
        chatId={chatId} 
        currentUserId={user.id} 
      />
      
      <ChatInput 
        chatId={chatId} 
        senderId={user.id} 
        onMessageSent={handleMessageSent} 
      />
    </div>
  );
};

export default ChatBox;