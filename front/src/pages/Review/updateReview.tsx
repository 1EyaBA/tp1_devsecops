import React, { useState } from 'react';
import { updateReview } from '../../services/reviews';
import { X, Star } from 'lucide-react';

interface UpdateReviewModalProps {
  reviewId: number;
  initialStars: number;
  initialComment: string;
  onClose: () => void;
  onUpdated: () => void;
}

const UpdateReviewModal: React.FC<UpdateReviewModalProps> = ({
  reviewId,
  initialStars,
  initialComment,
  onClose,
  onUpdated,
}) => {
  const [stars, setStars] = useState(initialStars);
  const [comment, setComment] = useState(initialComment);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (stars < 1 || stars > 5) {
      setError('Stars must be between 1 and 5');
      setIsSubmitting(false);
      return;
    }

    if (!comment.trim()) {
      setError('Comment cannot be empty');
      setIsSubmitting(false);
      return;
    }

    try {
      await updateReview(reviewId, { id: reviewId, stars, comment });
      onUpdated();
      onClose();
    } catch (err: any) {
      setError('Failed to update review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, idx) => (
      <button
        key={idx}
        type="button"
        onClick={() => setStars(idx + 1)}
        className="focus:outline-none"
      >
        <Star
          size={24}
          className={`${idx < stars ? "text-yellow-400 dark:text-yellow-500" : "text-gray-300 dark:text-gray-600"} hover:text-yellow-300 dark:hover:text-yellow-400 transition-colors`}
          fill={idx < stars ? "currentColor" : "none"}
        />
      </button>
    ));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 dark:bg-opacity-60 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transform transition-all animate-fade-in">
        <div className="flex justify-between items-center mb-5">
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">Update Your Review</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full p-1.5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2">Rating</label>
            <div className="flex space-x-1 mb-1">
              {renderStars()}
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {stars === 1 && "Poor"}
              {stars === 2 && "Fair"}
              {stars === 3 && "Average"}
              {stars === 4 && "Good"}
              {stars === 5 && "Excellent"}
            </span>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 dark:text-gray-300 font-medium mb-2" htmlFor="comment">
              Your Feedback
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 resize-none min-h-32 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
              placeholder="Share your experience..."
              required
            />
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-800 rounded-lg p-3 mb-4 border-l-4 border-red-500 dark:border-red-700">
              <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg bg-blue-600 dark:bg-blue-500 text-white dark:text-gray-200 hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors font-medium flex items-center ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Updating...
                </>
              ) : 'Update Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateReviewModal;