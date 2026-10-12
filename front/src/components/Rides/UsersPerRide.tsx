import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUserId } from "../../services/authService";
import { RideUser } from "../../services/ridesService";

interface ReviewPopupProps {
  isOpen: boolean;
  onClose: () => void;
  users: RideUser[];
  rideId: number | string;
}

const UsersPerRide: React.FC<ReviewPopupProps> = ({ 
  isOpen, 
  onClose, 
  users, 
  rideId 
}) => {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCurrentUserId = async () => {
      const userId = await getCurrentUserId();
      setCurrentUserId(userId);
    };

    fetchCurrentUserId();
  }, []);

  // Add animation effect when opening/closing
  useEffect(() => {
    if (isOpen) {
      // Small delay to ensure CSS transition works properly
      setTimeout(() => setMounted(true), 10);
    } else {
      setMounted(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUserSelect = (user: RideUser) => {
    if (user.id !== currentUserId) {
      // Redirect to the ReviewPage with rideId and reviewedId
      navigate(`/review?rideId=${rideId}&reviewedId=${user.id}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={onClose}
      style={{
        opacity: mounted ? 1 : 0,
        transition: "opacity 0.2s ease-in-out"
      }}
    >
      {/* Semi-transparent backdrop with blur effect */}
      <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"></div>
      
      {/* Popup container with animation */}
      <div 
        className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
        style={{
          transform: mounted ? "translateY(0)" : "translateY(20px)",
          transition: "transform 0.3s ease-out"
        }}
      >
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              Select User to Review
            </h3>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50 rounded-full p-1"
              aria-label="Close popup"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-2">
          <div className="space-y-2">
            {users.length > 0 ? (
              users.map((user) => (
                <div 
                  key={user.id}
                  className={`flex items-center p-3 ${
                    user.id !== currentUserId 
                      ? "cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700" 
                      : "opacity-80"
                  } rounded-lg transition-all duration-200 border border-transparent ${
                    user.id !== currentUserId ? "hover:border-blue-200 dark:hover:border-gray-600" : ""
                  }`}
                  onClick={() => user.id !== currentUserId && handleUserSelect(user)}
                >
                  <div className="relative w-14 h-14 rounded-full bg-gray-200 dark:bg-gray-600 mr-4 overflow-hidden flex-shrink-0 border-2 border-white dark:border-gray-700 shadow-md">
                    {user.imageUrl ? (
                   
                      <img src={user?.imageUrl || '/images/user/default-avatar.jpg'} 

                        alt={`${user.name} ${user.lastName}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/default-avatar.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-700">
                        <span className="text-lg font-bold text-gray-600 dark:text-gray-300">
                          {user.name.charAt(0)}{user.lastName.charAt(0)}
                        </span>
                      </div>
                    )}
                    {user.id === currentUserId && (
                      <div className="absolute bottom-0 right-0 bg-blue-500 text-white text-xs px-1 rounded-sm">
                        You
                      </div>
                    )}
                  </div>
                  <div className="flex-grow">
                    <p className="font-medium text-gray-800 dark:text-white flex items-center">
                      {user.name} {user.lastName}
                    </p>
                    <div className="flex items-center mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 capitalize">
                        {user.roleInRide}
                      </span>
                    </div>
                  </div>
                  {user.id !== currentUserId && (
                    <div className="text-blue-500 dark:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <div className="mx-auto w-16 h-16 mb-4 text-gray-300 dark:text-gray-600">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400">
                  No users found to review
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Footer with action button */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <button 
            onClick={onClose}
            className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default UsersPerRide;