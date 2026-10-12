import React, { useState } from 'react';

import { useQuery } from '@apollo/client';
import { GET_APPUSER_INFO } from '../../graphQl/queries/userProfile';
import { GET_CHATS } from '../../graphQl/queries/chat';
import { Chat, ChatSidebarProps,User ,Ride,Message} from '../../types/chat.ts';


const ChatSidebar: React.FC<ChatSidebarProps> = ({ isMobile, setIsMobile,onChatClick }) => {
   const [page, setPage] = useState(1);
   const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
   const [isViewModalOpen, setIsViewModalOpen] = useState(false);
   const [limit] = useState(20);

  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token;
  console.log("isLoggedIn", isLoggedIn);
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const userId = user?.id;
  console.log("userId", userId);
  console.log("accessToken", token);

  
const { loading: loadingChats, error: errorChats, data: chatsData, refetch } = useQuery(GET_CHATS, {
  variables: { userId: Number(userId) },
  skip: !isLoggedIn, // Wait until userId is available
  fetchPolicy: "network-only",
});
  console.log("chatsData", chatsData);
  console.log("loadingChats", loadingChats);
  console.log("errorChats", errorChats);
  
const chats: Chat[] = chatsData?.getChats?.map((chat: any) => ({
  id: chat.id,
  messages: chat.messages ?? [],
  driver: chat.driver ?? { id: 0, name: '', lastName: '' },
  rider: chat.rider ?? { id: 0, name: '', lastName: '' },
  ride: chat.ride   ?? { id: 0, startLocation: '', endLocation: '' },
  createdAt: chat.createdAt ?? '',
})) ?? [];
  

  if (loadingChats) return <div>Loading chats...</div>;
if ( errorChats) return <div>Error loading chats.</div>;

 const handleChatClick = (chat : Chat) => {
      setSelectedChat(chat);
      // Call the parent component's onChatClick function to pass the selected chat up
      if (onChatClick) {
        onChatClick(chat);
      }
    };
  return (
    <div 
      onClick={(e) => {
        if (e.target !== e.currentTarget) return;
        setIsMobile(!isMobile);
      }} 
      className="flex-col rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] xl:flex xl:w-1/4"
    >
      {/* Chat List Header */}
      <div className="sticky px-4 pb-4 pt-4 sm:px-5 sm:pt-5 xl:pb-0">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-theme-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
              Chats
            </h3>
          </div>

          <div className="relative">
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white">
              <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M10.2441 6C10.2441 5.0335 11.0276 4.25 11.9941 4.25H12.0041C12.9706 4.25 13.7541 5.0335 13.7541 6C13.7541 6.9665 12.9706 7.75 12.0041 7.75H11.9941C11.0276 7.75 10.2441 6.9665 10.2441 6ZM10.2441 18C10.2441 17.0335 11.0276 16.25 11.9941 16.25H12.0041C12.9706 16.25 13.7541 17.0335 13.7541 18C13.7541 18.9665 12.9706 19.75 12.0041 19.75H11.9941C11.0276 19.75 10.2441 18.9665 10.2441 18ZM11.9941 10.25C11.0276 10.25 10.2441 11.0335 10.2441 12C10.2441 12.9665 11.0276 13.75 11.9941 13.75H12.0041C12.9706 13.75 13.7541 12.9665 13.7541 12C13.7541 11.0335 12.9706 10.25 12.0041 10.25H11.9941Z" fill=""></path>
              </svg>
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <button 
            onClick={() => setIsMobile(!isMobile)} 
            className="flex h-11 w-full max-w-11 items-center justify-center rounded-lg border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400 xl:hidden"
          >
            <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M3.25 6C3.25 5.58579 3.58579 5.25 4 5.25H20C20.4142 5.25 20.75 5.58579 20.75 6C20.75 6.41421 20.4142 6.75 20 6.75L4 6.75C3.58579 6.75 3.25 6.41422 3.25 6ZM3.25 18C3.25 17.5858 3.58579 17.25 4 17.25L20 17.25C20.4142 17.25 20.75 17.5858 20.75 18C20.75 18.4142 20.4142 18.75 20 18.75L4 18.75C3.58579 18.75 3.25 18.4142 3.25 18ZM4 11.25C3.58579 11.25 3.25 11.5858 3.25 12C3.25 12.4142 3.58579 12.75 4 12.75L20 12.75C20.4142 12.75 20.75 12.4142 20.75 12C20.75 11.5858 20.4142 11.25 20 11.25L4 11.25Z" fill=""></path>
            </svg>
          </button>

          <div className="relative my-2 w-full">
            <form>
              <button className="absolute left-4 top-1/2 -translate-y-1/2">
                <svg className="fill-gray-500 dark:fill-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" clipRule="evenodd" d="M3.04199 9.37381C3.04199 5.87712 5.87735 3.04218 9.37533 3.04218C12.8733 3.04218 15.7087 5.87712 15.7087 9.37381C15.7087 12.8705 12.8733 15.7055 9.37533 15.7055C5.87735 15.7055 3.04199 12.8705 3.04199 9.37381ZM9.37533 1.54218C5.04926 1.54218 1.54199 5.04835 1.54199 9.37381C1.54199 13.6993 5.04926 17.2055 9.37533 17.2055C11.2676 17.2055 13.0032 16.5346 14.3572 15.4178L17.1773 18.2381C17.4702 18.531 17.945 18.5311 18.2379 18.2382C18.5308 17.9453 18.5309 17.4704 18.238 17.1775L15.4182 14.3575C16.5367 13.0035 17.2087 11.2671 17.2087 9.37381C17.2087 5.04835 13.7014 1.54218 9.37533 1.54218Z" fill=""></path>
                </svg>
              </button>

              <input 
                type="text" 
                placeholder="Search..." 
                className="h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-[42px] pr-3.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800" 
              />
            </form>
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div 
        className={`no-scrollbar flex-col overflow-auto ${isMobile ? 'flex fixed xl:static top-0 left-0 z-999999 h-screen bg-white dark:bg-gray-900' : 'hidden xl:flex'}`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-800 xl:hidden">
          <div>
            <h3 className="text-theme-xl font-semibold text-gray-800 dark:text-white/90 sm:text-2xl">
              Chat
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button 
              onClick={() => setIsMobile(!isMobile)} 
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-gray-700 dark:border-gray-700 dark:text-gray-400"
            >
              <svg className="fill-current" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill=""></path>
              </svg>
            </button>
          </div>
        </div>

        {/* Chat List Items */}
        <div className="flex max-h-full flex-col overflow-auto px-4 sm:px-5">
          <div className="custom-scrollbar max-h-full space-y-1 overflow-auto">
            {chats.map((chat) => {
  const otherUser = userId === chat.driver.id ? chat.rider : chat.driver;
  const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : "No messages yet";
  console.log("messages", chat.messages);
  console.log("lastMessage", lastMessage);
  console.log("otherUser", otherUser);

  return (
    <div 
      key={chat.id} 
      onClick={() => handleChatClick(chat)} 
      className="flex cursor-pointer items-center gap-3 rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-white/[0.03]"
    >
      <div className="relative h-12 w-full max-w-[48px] rounded-full">
        <img src="/images/user/user-18.jpg" alt="profile" className="h-full w-full overflow-hidden rounded-full object-cover object-center" />
        <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full border-[1.5px] border-white bg-success-500 dark:border-gray-900"></span>
      </div>
      <div className="w-full">
        <div className="flex items-start justify-between">
          <div>
            <h5 className="text-sm font-medium text-gray-800 dark:text-white/90">
              {otherUser.name} {otherUser.lastName}
            </h5>
            <p className="mt-0.5 text-theme-xs text-gray-500 dark:text-gray-400">
              {lastMessage}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
})}

            
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatSidebar;