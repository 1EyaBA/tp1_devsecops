import React from 'react';
import { Calendar, MapPin, X, AlertCircle, Info } from 'lucide-react';

interface EventFormModalProps {
  isOpen: boolean;
  closeModal: () => void;
  eventTitle: string;
  eventDescription: string;
  eventLocation: string;
  eventDate: string;
  eventLevel: string;
}

const EventFormModal: React.FC<EventFormModalProps> = ({
  isOpen,
  closeModal,
  eventTitle,
  eventDescription,
  eventLocation,
  eventDate,
  eventLevel,
}) => {
  if (!isOpen) return null;

  // Function to determine status color
  const getStatusColor = (level: string) => {
    switch(level.toLowerCase()) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  // Overlay click handler
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeModal();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm" onClick={handleOverlayClick}>
      <div className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all dark:bg-gray-800 dark:border dark:border-gray-700 animate-in fade-in zoom-in-95">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 relative">
          <button
            className="absolute right-4 top-4 text-white hover:text-gray-200 focus:outline-none"
            onClick={closeModal}
          >
            <X className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold text-white">
            {eventTitle}
          </h2>
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(eventLevel)}`}>
            <AlertCircle className="w-3 h-3 mr-1" />
            {eventLevel} priority
          </div>
        </div>

        <div className="p-6">
          {/* Description */}
          <div className="mb-6">
            <div className="flex items-start">
              <Info className="h-5 w-5 text-gray-500 dark:text-gray-400 mt-1 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Description</h3>
                <p className="text-gray-800 dark:text-gray-200">{eventDescription}</p>
              </div>
            </div>
          </div>
          
          {/* Details grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Date/Time */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start">
              <Calendar className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Date & Time</h3>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{eventDate}</p>
              </div>
            </div>
            
            {/* Location */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex items-start">
              <MapPin className="h-5 w-5 text-indigo-500 dark:text-indigo-400 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-300">Location</h3>
                <p className="text-gray-800 dark:text-gray-200 font-medium">{eventLocation}</p>
              </div>
            </div>
          </div>
        
          {/* Footer with action button */}
          <div className="mt-8 flex justify-end">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 transition-colors"
              onClick={closeModal}
            >
              Close details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;