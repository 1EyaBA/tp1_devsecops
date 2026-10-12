import { useMutation, useQuery } from '@apollo/client';
import { CREATE_POST, GET_POSTS } from '../../graphQl/queries/posts';
import React, { useEffect, useMemo, useState } from 'react';
import { CreatePostFormData } from '../../types/posts.ts';
import '../../styles/posts.css';
import { GET_USER } from '../../graphQl/queries/rides.ts';
interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  userData: {
    id?: string;
    name?: string;
    lastName?: string;
  };
}


const initialFormData: CreatePostFormData = {
  destination: '',
  departure: '',
  date: '',
  time: '',
  seatCount: 1,
  driverName:'' ,
  frequency: 'One-time',
  description: '',
  price: 0,
  contactInfo: ''
};

const CreatePostModal: React.FC<CreatePostModalProps> = ({ isOpen, onClose,userData}) => {
  const [formData, setFormData] = useState<CreatePostFormData>(initialFormData);

  useEffect(() => {
    if (userData.name && userData?.lastName) {
      setFormData((prev) => ({
        ...prev,
        driverName: `${userData.name} ${userData.lastName}`, // Combine name and lastName
      }));
    }
  }, [userData]);
  

  const [errors, setErrors] = useState<Partial<Record<keyof CreatePostFormData, string>>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreatePostFormData, string>> = {};
    
    if (!formData.destination.trim()) newErrors.destination = 'Destination is required';
    if (!formData.departure.trim()) newErrors.departure = 'Departure location is required';
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.driverName.trim()) newErrors.driverName = 'Driver name is required';
    if (formData.seatCount < 1) newErrors.seatCount = 'At least 1 seat is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
    
    // Clear error when field is edited
    if (errors[name as keyof CreatePostFormData]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const [createPost] = useMutation(CREATE_POST, {
    refetchQueries: [{ query: GET_POSTS }]
  });

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const { driverName, ...formDataWithoutDriverName } = formData;


  if (!validateForm()) return;

  try {
    await createPost({
      variables: {
        createPostInput: {
          ...formDataWithoutDriverName,
          date: new Date(formData.date), // Ensure proper Date format
          postOwnerId: userData.id, // Replace with actual user ID dynamically if possible
          listRide: [] // Add ride IDs or empty array
        }
      }
    });

    setFormData(initialFormData);
    setFormData((prev) => ({
      ...prev,
      driverName: `${userData.name} ${userData.lastName}`, // Combine name and lastName
    }));
    onClose();
  } catch (err) {
    console.error("Failed to create post:", err);
  }
};


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 z-999999 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[80vh] overflow-auto">
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Create Carpool Post</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                name="driverName"
                value={formData.driverName}
                readOnly
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 cursor-not-allowed"
              />

              {errors.driverName && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.driverName}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                From
              </label>
              <input
                type="text"
                name="departure"
                value={formData.departure}
                onChange={handleChange}
                className={`w-full px-2 py-1 text-sm border ${errors.departure ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100`}
              />
              {errors.departure && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.departure}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                To
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                className={`w-full px-2 py-1 text-sm border ${errors.destination ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100`}
              />
              {errors.destination && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.destination}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Date
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={`w-full px-2 py-1 text-sm border ${errors.date ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100`}
              />
              {errors.date && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.date}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Time
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleChange}
                className={`w-full px-2 py-1 text-sm border ${errors.time ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100`}
              />
              {errors.time && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.time}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Seats
              </label>
              <input
                type="number"
                name="seatCount"
                min="1"
                max="10"
                value={formData.seatCount}
                onChange={handleChange}
                className={`w-full px-2 py-1 text-sm border ${errors.seatCount ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100`}
              />
              {errors.seatCount && <p className="mt-1 text-xs text-red-500 dark:text-red-400">{errors.seatCount}</p>}
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Frequency
              </label>
              <select
                name="frequency"
                value={formData.frequency}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              >
                <option value="One-time">One-time</option>
                <option value="Daily">Daily</option>
                <option value="Weekdays">Weekdays</option>
                <option value="Weekly">Weekly</option>
                <option value="Biweekly">Biweekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Price ($)
              </label>
              <input
                type="number"
                name="price"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Contact
              </label>
              <input
                type="text"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                placeholder="Email/phone"
              />
            </div>
            
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={2}
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"
                placeholder="Additional details about your ride offer..."
              />
            </div>
          </div>
          
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded-md font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-xs bg-blue-600 dark:bg-blue-500 rounded-md font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
            >
              Create Post
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostModal;
