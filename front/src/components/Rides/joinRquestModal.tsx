import { User } from 'lucide-react';
import React from 'react';
import { ACCEPT_REQUEST, DELETE_REQUEST, GET_JOIN_REQUESTS_BY_RIDE, GET_RIDES_BY_DRIVER } from '../../graphQl/queries/rides';
import { useMutation } from '@apollo/client';
import { CREATE_CHAT } from '../../graphQl/queries/chat';

interface User {
  id: number;
  name: string;
  lastName: string;
  imageUrl: string;
}
  
export interface JoinRequest {
  id: number;
  user: User;
}
  
interface JoinRequestsModalProps {
  isOpen: boolean;
  onClose: () => void;
  joinRequests: JoinRequest[];
  rideId: number;
}

const JoinRequestsModal: React.FC<JoinRequestsModalProps> = ({ 
  isOpen, 
  rideId, 
  onClose, 
  joinRequests = [] 
}) => {
  // Return null early if modal is not open
  if (!isOpen) return null;

  const [deleteJoinRequest] = useMutation(DELETE_REQUEST, {
    refetchQueries: [{ 
      query: GET_JOIN_REQUESTS_BY_RIDE, 
      variables: { rideId: Number(rideId) } 
    }],
    onCompleted: () => {
      console.log('Delete request completed');
    },
    onError: (error) => {
      console.error('Error deleting request:', error);
    },
  });

  const [acceptJoinRequest] = useMutation(ACCEPT_REQUEST, {
    refetchQueries: [
      { 
        query: GET_JOIN_REQUESTS_BY_RIDE, 
        variables: { rideId: Number(rideId) } 
      },
      { 
        query: GET_RIDES_BY_DRIVER, 
      }
    ],
    
    onCompleted: () => {
      console.log('Accept request completed');
    },
    onError: (error) => {
      console.error('Error accepting request:', error);
    },
  });
  
  const [createChat] = useMutation(CREATE_CHAT);

  const handleDeleteRequest = (joinRequestId: number) => {
    deleteJoinRequest({
      variables: { id: Number(joinRequestId) },
      onCompleted: (data) => {
        console.log("Delete successful", data);
      },
      onError: (error) => {
        console.error("Error deleting:", error);
      }
    });
  };
  
  const handleAcceptRequest = (requestId: number, userId: number) => {

    acceptJoinRequest({
      variables: { 
        requestId:Number(requestId),
        rideId: Number(rideId),
        userId: Number(userId) 
      },
      onCompleted: (data) => {
        console.log("Accept successful", data);
      },
      onError: (error) => {
        console.error("Error accepting:", error);
      }
    });
    createChat({
      variables:{
        createChatInput:{
        rideId:Number(rideId),
        riderId:Number(userId)
      }}
    });
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center">
      {/* Backdrop - dark and blurred */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>
      
      {/* Modal content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4 z-10 overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-b border-gray-200 dark:border-gray-600 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">Join Requests</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {!joinRequests || joinRequests.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">No join requests at this time.</p>
          ) : (
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {joinRequests.map((request) => (
                <li key={request.id} className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                        {request.user?.imageUrl ? (
                          <img 
                           src={`http://localhost:3000${request.user.imageUrl}`}
                            alt={`${request.user.name}'s profile`} 
                            className="h-full w-full object-cover" 
                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-3">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          {request.user
                            ? `${request.user.name} ${request.user.lastName}`
                            : 'Unknown user'}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleAcceptRequest(request.id, request.user.id)}
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors">
                          Accept
                      </button>
                      <button 
                        onClick={() => handleDeleteRequest(request.id)}
                        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors">
                          Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        
        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-3 border-t border-gray-200 dark:border-gray-600 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRequestsModal;