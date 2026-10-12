import { useEffect, useState } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { createReview } from '../../services/reviews'; // <-- Import service
import { getCurrentUserId } from '../../services/authService';
import { useNavigate } from 'react-router';

interface ReviewFormProps {
  rideId: number;
  reviewedId: number;
  onReviewSubmitted: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ rideId, reviewedId, onReviewSubmitted }) => {
  console.log('Ride ID:', rideId);
  console.log('Reviewed User ID:', reviewedId);
  
  const [stars, setStars] = useState<number>(0);
  const [comment, setComment] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    const reviewData = {
      stars,
      comment,
      reviewerId: Number(localStorage.getItem('user_id')),
      reviewedUserId: reviewedId, 
      rideId,
    };
    

    try {
      await createReview(reviewData); 
      setIsSubmitted(true);
      setIsSubmitting(false);

      setTimeout(() => {
        setStars(0);
        setComment('');
        setIsSubmitted(false);
        onReviewSubmitted();
      }, 3000);
    } catch (error) {
      console.error('Error submitting review:', error);
      setIsSubmitting(false);
    }
  };
  const navigate = useNavigate();
   useEffect(() => {
    const checkAuthStatus = async () => {
      const userId = await getCurrentUserId();
      if (!userId) {
        navigate('/signup');  // Redirect to signup page if not logged in
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
      {isSubmitted ? (
        <div className="text-center py-4">
          <CheckCircle className="mx-auto text-green-500 dark:text-green-400 mb-2" size={32} />
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300">Thank you for your review!</h3>
          <p className="text-green-600 dark:text-green-400">Your feedback helps improve our service.</p>
        </div>
      ) : (
        <>
          <h3 className="text-lg font-semibold mb-4 dark:text-gray-100">Rate Your Experience</h3>

          <form onSubmit={handleSubmit}>
            <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
              <div className="mb-4 md:mb-0 md:w-1/3">
                <label className="block text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setStars(star)}
                      className="focus:outline-none"
                    >
                      <Star
                        fill={star <= stars ? '#FFD700' : 'none'}
                        color={star <= stars ? '#FFD700' : '#CBD5E0'}
                        size={28}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:w-2/3">
                <label htmlFor="comment" className="block text-gray-700 dark:text-gray-300 mb-2">
                  Comment
                </label>
                <textarea
                  required
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience with this ride..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-300 focus:border-blue-500 dark:focus:border-blue-300 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100"

                  rows={3}
                />
              </div>
            </div>

            <div className="mt-4">
              <button
                type="submit"
                disabled={isSubmitting || stars === 0}
                className={`w-full py-3 px-4 rounded-md text-white font-medium ${
                  stars === 0
                    ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default ReviewForm;