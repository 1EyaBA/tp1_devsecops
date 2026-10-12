import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReviewCard from '../../components/review/ReviewCard';
import { getReceivedReviews } from '../../services/reviews';
import { Star, ArrowLeft, AlertTriangle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Review } from '../../interfaces/Review';

interface PaginatedReviews {
  data: Review[];
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const UserReviewsPage = () => {
  const { userId } = useParams<{ userId: string }>();
  const [reviews, setReviews] = useState<PaginatedReviews | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchReviews = async (page: number) => {
      try {
        setLoading(true);
        if (!userId) throw new Error('User ID is required');
        
        const reviewsData = await getReceivedReviews(parseInt(userId), page);
        setReviews(reviewsData); // Set the full pagination data
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews(currentPage);
  }, [userId, currentPage]);

  // Loading Spinner Component
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-800">
        <div className="text-center">
          <Loader2 className="w-12 h-12 mx-auto text-blue-600 animate-spin" />
          <p className="mt-4 text-lg text-gray-700 dark:text-gray-300">Loading reviews...</p>
        </div>
      </div>
    );
  }

  // Error Display Component
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-800">
        <div className="max-w-md p-6 bg-white dark:bg-gray-700 rounded-lg shadow-md">
          <div className="flex items-center justify-center text-red-500 mb-4">
            <AlertTriangle className="w-10 h-10" />
          </div>
          <h3 className="text-xl font-bold text-center text-gray-800 dark:text-gray-100 mb-2">Error Loading Reviews</h3>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-6">{error}</p>
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Try Again
            </button>
            <Link
              to="/"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-100 dark:hover:bg-gray-600"
            >
              Go Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Main Component
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <Link
          to={`/users/${userId}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-500 mb-6"
        >
          <ArrowLeft className="mr-2" size={18} />
          Back to Profile
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">Received Reviews</h1>
        
        {(reviews?.data ?? []).length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews?.data.map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                variant="recipient"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-700 rounded-lg shadow-sm p-8 text-center max-w-md mx-auto">
            <div className="mx-auto bg-gray-100 dark:bg-gray-600 rounded-full w-24 h-24 flex items-center justify-center mb-4">
              <Star className="text-gray-400 dark:text-gray-500" size={32} />
            </div>
            <h3 className="text-xl font-medium text-gray-700 dark:text-gray-200 mb-2">No Reviews Yet</h3>
            <p className="text-gray-500 dark:text-gray-300">This user hasn't received any reviews yet.</p>
          </div>
        )}

        {/* Pagination Controls */}
        {reviews && reviews.totalPages >= 1 && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:dark:bg-gray-600"
            >
              Previous
            </button>
            <span className="mx-4 text-lg text-gray-700 dark:text-gray-300">
              Page {currentPage} of {reviews?.totalPages ?? 0}
            </span>
            <button
              onClick={() => reviews && setCurrentPage((prev) => Math.min(prev + 1, reviews.totalPages))}
              disabled={currentPage === reviews?.totalPages}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:dark:bg-gray-600"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserReviewsPage;
