import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ReviewForm from '../../components/review/ReviewForm';
import { getReviewFormData } from '../../services/reviews';

const ReviewPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const queryParams = new URLSearchParams(location.search);
  const rideId = Number(queryParams.get('rideId'));
  const reviewedId = Number(queryParams.get('reviewedId'));

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    if (!rideId || !reviewedId) return;

    const fetchData = async () => {
      try {
        const result = await getReviewFormData(rideId, reviewedId);
        setData(result);
      } catch (err: any) {
        const msg = err?.message || '';
        if (msg.includes('Entities with IDs')) {
          setError(new Error('User or ride not found'));
        } else {
          setError(new Error('An unexpected error occurred'));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [rideId, reviewedId]);

  if (!rideId || !reviewedId) {
    return <div>Missing required parameters</div>;
  }

  if (loading) return <div>Loading review data...</div>;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto mt-10 p-6 bg-red-100 dark:bg-red-900 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-300 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-2">Oops! Something went wrong</h2>
        <p>{error.message}</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-red-500 dark:bg-red-700 text-white rounded hover:bg-red-600 dark:hover:bg-red-800"
        >
          Go Back
        </button>
      </div>
    );
  }

  const reviewedUser = data?.reviewedUser;
  const ride = data?.ride;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800 rounded-lg shadow-md mt-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-6">Ride Details</h1>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <div className="mr-4">
            <img
              src={reviewedUser?.imageUrl || '/images/user/default-avatar.jpg'}
              alt={reviewedUser?.name || 'Driver'}
              className="w-12 h-12 rounded-full object-cover"
            />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">Ride with {reviewedUser?.name || 'N/A'}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{ride?.date || 'N/A'}</p>
            <button

              onClick={() => navigate(`/profile/${reviewedId}`)}
              className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              View {reviewedUser?.name}'s profile
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Departure</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{ride?.departure || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Arrival</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{ride?.arrival || 'N/A'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Price</p>
            <p className="font-medium text-lg text-gray-800 dark:text-gray-200">${ride?.price?.toFixed(2) || '0.00'}</p>
          </div>
          <div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Time</p>
            <p className="font-medium text-gray-800 dark:text-gray-200">{ride?.time || 'N/A'}</p>
          </div>
        </div>
      </div>

      <ReviewForm
        rideId={rideId}
        reviewedId={reviewedId}
        onReviewSubmitted={() => console.log('Review submitted!')}
      />
    </div>
  );
};

export default ReviewPage;