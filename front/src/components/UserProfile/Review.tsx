import { useQuery } from '@apollo/client';
import { GET_PAGINATED_REVIEWS_BY_USER } from '../../graphQl/queries/reviews';
import ReviewCard from './ReviewCard';
import { useNavigate } from 'react-router';



export default function Review() {
  const navigate = useNavigate();
  const { loading, error, data } = useQuery(GET_PAGINATED_REVIEWS_BY_USER, {
    variables: {
      page: 1,
      limit: 3,
      sortField: 'date',
      sortOrder: 'DESC',
    },
  });

  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error loading reviews: {error.message}</p>;

  const reviews = data?.getPaginatedMyReviews?.data || [];

  return (
    <div className="relative w-full">
      <h2 className="mb-5 text-lg font-semibold text-gray-800 dark:text-white/90 lg:mb-7">
        My Reviews
      </h2>

      {reviews.length === 0 ? (
        <p className="text-gray-500 text-center">No reviews yet.</p>
      ) : (
        <>
          <div className="flex items-center relative">
            <div className="w-full overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reviews.map((review: any) => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center mt-4">
            <button
              onClick={() => navigate('/reviews')}
              className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-gray-700 shadow-theme-xs hover:bg-gray-50 hover:text-gray-800 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-white/[0.03] dark:hover:text-gray-200 lg:inline-flex lg:w-auto"
            >
              View More
            </button>
          </div>
        </>
      )}
    </div>
  );
}