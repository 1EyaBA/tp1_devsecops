import React from 'react';

interface PostFilterProps {
  activeFilter: 'all' | 'my';
  onFilterChange: (filter: 'all' | 'my') => void;
  isLoggedIn?: boolean;
}

const PostFilter: React.FC<PostFilterProps> = ({ 
  activeFilter, 
  onFilterChange,
  isLoggedIn = true
}) => {
  return (
    <div className="flex space-x-4 mb-6">
      <button
        onClick={() => onFilterChange('all')}
        className={`px-4 py-2 rounded-md transition-colors ${
          activeFilter === 'all'
            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
            : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
        }`}
      >
        All Carpools
      </button>
      
      {isLoggedIn && (
        <button
          onClick={() => onFilterChange('my')}
          className={`px-4 py-2 rounded-md transition-colors ${
            activeFilter === 'my'
              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
              : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/50'
          }`}
        >
          My Carpools
        </button>
      )}
    </div>
  );
};

export default PostFilter;