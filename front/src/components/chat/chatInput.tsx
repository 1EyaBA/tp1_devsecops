import React, { useState } from 'react';
import { useCreateMessage } from '../../hooks/useCreateMessage';
import { useSocket } from '../../hooks/useSocket';
import { useMutation } from '@apollo/client';

import { SEND_MESSAGE } from '../../graphQl/queries/chat';


interface ChatInputProps {
  chatId: number;
  senderId: number;
  onMessageSent?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({ chatId, senderId, onMessageSent }) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const { sendMessage, loading } = useCreateMessage();
  const { socket, isConnected } = useSocket();

  const [createMessage] = useMutation(SEND_MESSAGE);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending) return;
    
    const messageData = {
      text: message.trim(),
      chatId,
      senderId,
    };
    
    try {
      setIsSending(true);
      
      if (socket && isConnected) {
        // Use socket to send message
        socket.emit('sendMessage', messageData);
        setMessage('');
        if (onMessageSent) onMessageSent();
      } else {
        // Fallback to GraphQL if socket is not available
        await createMessage({
          variables: {
            createMessageInput: messageData,
          },
        });
        setMessage('');
        if (onMessageSent) onMessageSent();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="border-t border-gray-200 p-4 dark:border-gray-800">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-full border border-gray-300 bg-gray-100 px-4 py-2 focus:border-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          disabled={loading || isSending}
        />
        <button
          type="submit"
          disabled={loading || isSending || !message.trim()}
          className="rounded-full bg-blue-500 p-2 text-white transition hover:bg-blue-600 disabled:opacity-50"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20.33 3.66996C20.1408 3.48213 19.9035 3.35008 19.6442 3.28833C19.3849 3.22659 19.1135 3.23753 18.86 3.31996L4.23 8.19996C3.95867 8.28593 3.71891 8.45039 3.54099 8.67255C3.36307 8.89471 3.25498 9.16462 3.23037 9.44818C3.20576 9.73174 3.26573 10.0162 3.40271 10.2657C3.5397 10.5152 3.74754 10.7185 4 10.85L10.07 13.85L13.07 19.94C13.1906 20.1783 13.3751 20.3785 13.6029 20.518C13.8307 20.6575 14.0929 20.7309 14.36 20.73H14.46C14.7461 20.7089 15.0192 20.6023 15.2439 20.4239C15.4686 20.2456 15.6345 20.0038 15.72 19.73L20.67 5.13996C20.7584 4.88789 20.7734 4.6159 20.7132 4.35565C20.653 4.09541 20.5201 3.85762 20.33 3.66996ZM4.85 9.57996L17.62 5.31996L10.53 12.41L4.85 9.57996ZM14.43 19.15L11.59 13.47L18.68 6.37996L14.43 19.15Z" fill="currentColor"/>
          </svg>
        </button>
      </form>
    </div>
  );
};

export default ChatInput;