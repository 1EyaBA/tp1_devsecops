import React from 'react';

interface FilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ label, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-md transition-all duration-200 font-medium
        ${isActive 
          ? 'bg-blue-600 text-white dark:bg-white/20 dark:text-white/90 scale-105 shadow-md' 
          : 'bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-white/70 hover:bg-gray-300 dark:hover:bg-gray-700'}
      `}
    >
      {label=='Your Rides'? 'My Rides':'Rides I took'}
    </button>
  );
};

export default FilterButton;