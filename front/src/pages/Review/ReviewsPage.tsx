import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, AlertTriangle, Send, ThumbsUp, Users, Star, MessageSquare, Search, X } from 'lucide-react';

import ReviewCard from '../../components/review/ReviewCard';
import { getMyReviews, getReceivedReviews, deleteReview } from '../../services/reviews';
import { getCurrentUserId } from '../../services/authService';
import { Review } from '../../interfaces/Review';
import DeleteConfirmationModal from './DeleteConfirmationModel';
import UpdateReviewModal from './updateReview';
import LoginPrompt from '../../components/auth/LoginPrompt';

const ReviewsPage = () => {
  const [activeView, setActiveView] = useState<'my-reviews' | 'received-reviews'>('my-reviews');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 6, 
    totalItems: 0,
    totalPages: 1
  });
  const [editingReview, setEditingReview] = useState<{
    id: number;
    stars: number;
    comment: string;
  } | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [reviewToDelete, setReviewToDelete] = useState<number | null>(null);
  
  // Configuration based on active view
  const config = {
    'my-reviews': {
      title: "Reviews You've Written",
      subtitle: "Your honest feedback helps other travelers make informed decisions.",
      emptyTitle: "You Haven't Written Any Reviews",
      emptyMessage: "Help the community by sharing your honest feedback about your travel companions.",
      emptyIcon: Send,
      emptyCtaText: "Find Rides to Review",
      emptyCtaLink: "/rides",
      loadingMessage: "Loading your feedback history...",
      gradientColors: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
      accentColor: "blue",
      fetchFn: async (variables: { page: number, limit: number }) => {
        return getMyReviews(variables.page, variables.limit);
      },
      variant: "author" as 'author',
      stats: [
        { title: "Total Feedback", icon: Send, color: "blue", getValue: (reviews: Review[]) => reviews.length, iconFilled: false },
        { title: "Positive Ratings", icon: ThumbsUp, color: "green", getValue: (reviews: Review[]) => reviews.filter(r => r.stars >= 4).length, iconFilled: false },
        { title: "People Reviewed", icon: Users, color: "amber", getValue: (reviews: Review[]) => new Set(reviews.map(r => r.user.id)).size, iconFilled: false }
      ]
    },
    'received-reviews': {
      title: "Your Travel Memories",
      subtitle: "Revisit your journey experiences and the connections you've made along the way.",
      emptyTitle: "No Reviews Yet",
      emptyMessage: "Share your experiences and help others by leaving reviews for your past rides.",
      emptyIcon: Star,
      emptyCtaText: "Browse Your Rides",
      emptyCtaLink: "/rides",
      loadingMessage: "Loading your journey memories...",
      gradientColors: "bg-gradient-to-br from-indigo-50 to-purple-100 dark:from-gray-800 dark:via-gray-700 dark:to-gray-800",
      accentColor: "indigo",
      fetchFn: async (variables: { page: number, limit: number }) => {
        const userId = await getCurrentUserId();
        if (!userId) throw new Error('User ID is null');
        return getReceivedReviews(userId, variables.page, variables.limit);
      },
      variant: "recipient" as 'recipient',
      stats: [
        { title: "Total Reviews", icon: Star, color: "indigo", getValue: (reviews: Review[]) => reviews.length, iconFilled: false },
        { title: "Positive Reviews", icon: Star, color: "green", iconFilled: true, getValue: (reviews: Review[]) => reviews.filter(r => r.stars >= 4).length },
        { title: "With Comments", icon: MessageSquare, color: "blue", getValue: (reviews: Review[]) => reviews.filter(r => r.comment && r.comment.trim() !== '').length, iconFilled: false }
      ]
    }
  };

  const currentConfig = config[activeView];

  // Filter reviews based on search term and active tab
  const filteredReviews = useMemo(() => {
    let filtered = reviews;

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(review => {
        const userName = `${review.user.name} ${review.user.lastName}`.toLowerCase();
        const comment = review.comment?.toLowerCase() || '';
        const departure = review.ride.departure.toLowerCase();
        const arrival = review.ride.arrival.toLowerCase();
        const rideRoute = `${departure} ${arrival}`;
        
        return (
          userName.includes(searchLower) ||
          comment.includes(searchLower) ||
          rideRoute.includes(searchLower) ||
          departure.includes(searchLower) ||
          arrival.includes(searchLower)
        );
      });
    }

    // Apply rating filter
    if (activeTab === 'positive') {
      filtered = filtered.filter(review => review.stars >= 4);
    } else if (activeTab === 'negative') {
      filtered = filtered.filter(review => review.stars < 4);
    }

    return filtered;
  }, [reviews, searchTerm, activeTab]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  // Check authentication status first
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userId = await getCurrentUserId();
        setIsLoggedIn(!!userId);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error checking authentication');
        setLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  // Only fetch reviews if user is logged in
  useEffect(() => {
    if (isLoggedIn === true) {
      const fetchReviews = async () => {
        try {
          setLoading(true);
          const response = await currentConfig.fetchFn({
            page: pagination.page,
            limit: pagination.limit
          });
          
          setReviews(response.data);
          setPagination(prev => ({
            ...prev,
            totalItems: response.totalItems,
            totalPages: response.totalPages,
            currentPage: response.currentPage
          }));
          setError(null);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error fetching reviews');
        } finally {
          setLoading(false);
        }
      };
    
      fetchReviews();
    }
  }, [activeView, pagination.page, isLoggedIn]);

  const handleDeleteReview = (id: number) => {
    setReviewToDelete(id);
    setDeleteModalOpen(true);
  };
 
  const confirmDelete = async () => {
    if (!reviewToDelete) return;
    
    try {
      await deleteReview(reviewToDelete);
      setReviews(reviews.filter(review => review.id !== reviewToDelete));
      setDeleteModalOpen(false);
      setReviewToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete review');
    }
  };

  const handleEditReview = (id: number) => {
    const reviewToEdit = reviews.find(review => review.id === id);
    if (reviewToEdit) {
      setEditingReview({
        id: reviewToEdit.id,
        stars: reviewToEdit.stars,
        comment: reviewToEdit.comment || ''
      });
    }
  };
  
  const handleUpdateComplete = async () => {
    try {
      const response = await currentConfig.fetchFn({
        page: pagination.page,
        limit: pagination.limit
      });
      setReviews(response.data);
      setPagination(prev => ({
        ...prev,
        totalItems: response.totalItems,
        totalPages: response.totalPages,
        currentPage: response.currentPage
      }));
    } catch (err) {
      console.error('Error refreshing reviews:', err);
    }
  };

  const userid = getCurrentUserId();
  console.log('userId', userid); 
  console.log('isLoggedIn', isLoggedIn);
  
  if (isLoggedIn === false) {
    return <LoginPrompt />;
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 dark:bg-gradient-to-br dark:from-red-900 dark:to-red-800">
        <div className="bg-white p-8 rounded-xl shadow-xl border-l-4 border-red-500 max-w-md dark:bg-gray-800 dark:border-red-700">
          <div className="flex items-center mb-4">
            <AlertTriangle size={24} className="text-red-500 mr-3 dark:text-red-300" />
            <h3 className="text-xl font-bold text-red-600 dark:text-red-300">Oops! Something went wrong</h3>
          </div>
          <p className="text-gray-600 mb-4 dark:text-gray-300">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg hover:from-red-600 hover:to-red-700 transition-all font-medium flex items-center justify-center"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${currentConfig.gradientColors} py-12 px-4 dark:bg-gray-900`}>
      <div className="max-w-6xl mx-auto">
        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-md p-1 dark:bg-gray-800">
            <button
              onClick={() => setActiveView('my-reviews')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'my-reviews'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-blue-50 dark:text-white dark:hover:bg-gray-700'
              }`}
            >
              My Reviews
            </button>
            <button
              onClick={() => setActiveView('received-reviews')}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                activeView === 'received-reviews'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-indigo-50 dark:text-white dark:hover:bg-gray-700'
              }`}
            >
              Received Reviews
            </button>
          </div>
        </div>

        <div className="mb-10 text-center">
          <h1 className={`text-3xl font-bold ${
            activeView === 'received-reviews' 
              ? 'bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700' 
              : `text-${currentConfig.accentColor}-900 dark:text-white`
          } mb-3`}>
            {currentConfig.title}
          </h1>
          <p className={`text-${currentConfig.accentColor}-700 max-w-lg mx-auto dark:text-gray-300 mb-6`}>
            {currentConfig.subtitle}
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
              </div>
              <input
                type="text"
                placeholder="Search reviews, users, or routes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg bg-white dark:bg-gray-800 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={clearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <X className="h-5 w-5 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                </button>
              )}
            </div>
            {searchTerm && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                {filteredReviews.length} result{filteredReviews.length !== 1 ? 's' : ''} found
              </p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            {currentConfig.stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-lg p-4 shadow-md flex items-center dark:bg-gray-800"
                >
                  <div 
                    className={`h-12 w-12 rounded-full bg-${stat.color}-100 flex items-center justify-center mr-4 dark:bg-${stat.color}-700`}
                  >
                    <Icon 
                      size={20} 
                      className={`text-${stat.color}-600 dark:text-${stat.color}-300`}
                      fill={stat.iconFilled ? "currentColor" : "none"} 
                    />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm dark:text-gray-400">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-800 dark:text-white">
                      {stat.getValue(reviews)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center max-w-md mx-auto px-6 mt-12">
            <div className="relative">
              <div className="bg-white rounded-full h-32 w-32 flex items-center justify-center mx-auto mb-8 shadow-xl dark:bg-gray-700">
                <div 
                  className={`absolute inset-0 rounded-full bg-gradient-to-br from-${currentConfig.accentColor}-100 to-${currentConfig.accentColor}-50 animate-pulse dark:bg-gradient-to-br dark:from-${currentConfig.accentColor}-700 dark:to-${currentConfig.accentColor}-600`}
                ></div>
                <currentConfig.emptyIcon size={40} className={`text-${currentConfig.accentColor}-500 relative z-10`} />
              </div>
            </div>
            <h2 className={`text-2xl font-bold text-${currentConfig.accentColor}-900 mb-3 dark:text-white`}>
              {currentConfig.emptyTitle}
            </h2>
            <p className={`text-${currentConfig.accentColor}-700 mb-8 dark:text-gray-300`}>
              {currentConfig.emptyMessage}
            </p>
            <Link
              to={currentConfig.emptyCtaLink}
              className={`inline-block bg-gradient-to-r from-${currentConfig.accentColor}-600 to-${currentConfig.accentColor}-700 text-white rounded-lg px-6 py-3 font-medium hover:from-${currentConfig.accentColor}-700 hover:to-${currentConfig.accentColor}-800 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 dark:bg-gradient-to-r dark:from-${currentConfig.accentColor}-600 dark:to-${currentConfig.accentColor}-500`}
            >
              {currentConfig.emptyCtaText}
            </Link>
          </div>
        ) : (
          <>
            {/* Filter Tabs */}
            <div className="flex justify-center mb-8">
              <div className="flex bg-white rounded-lg shadow-md p-1 dark:bg-gray-800">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'all'
                      ? `bg-${currentConfig.accentColor}-600 text-white shadow-md`
                      : 'text-gray-700 hover:bg-blue-50 dark:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  All ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('positive')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'positive'
                      ? `bg-${currentConfig.accentColor}-600 text-white shadow-md`
                      : 'text-gray-700 hover:bg-blue-50 dark:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  Positive ({reviews.filter(r => r.stars >= 4).length})
                </button>
                <button
                  onClick={() => setActiveTab('negative')}
                  className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'negative'
                      ? `bg-${currentConfig.accentColor}-600 text-white shadow-md`
                      : 'text-gray-700 hover:bg-blue-50 dark:text-white dark:hover:bg-gray-700'
                  }`}
                >
                  Negative ({reviews.filter(r => r.stars < 4).length})
                </button>
              </div>
            </div>

            {/* No Results Message */}
            {filteredReviews.length === 0 && searchTerm && (
              <div className="text-center py-12">
                <Search size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No reviews found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Try adjusting your search terms or filters
                </p>
                <button
                  onClick={clearSearch}
                  className="text-blue-600 hover:text-blue-700 font-medium dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Clear search
                </button>
              </div>
            )}

            {/* Reviews Grid */}
            {filteredReviews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {filteredReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    variant={currentConfig.variant}
                    onEdit={currentConfig.variant === 'author' ? handleEditReview : undefined}
                    onDelete={currentConfig.variant === 'author' ? handleDeleteReview : undefined}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {pagination.totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className={`p-2 rounded-md ${pagination.page === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'}`}
              >
                <ChevronLeft size={20} />
              </button>
              
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map((_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.page >= pagination.totalPages - 2) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-md flex items-center justify-center ${
                      pageNum === pagination.page
                        ? `bg-${currentConfig.accentColor}-600 text-white`
                        : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className={`p-2 rounded-md ${pagination.page === pagination.totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100 dark:text-white dark:hover:bg-gray-700'}`}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {reviews.length > 0 && !searchTerm && (
          <div className="text-center text-sm text-gray-600 mt-2 dark:text-gray-400">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.totalItems)} of{' '}
            {pagination.totalItems} reviews
          </div>
        )}
      </div>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setReviewToDelete(null);
        }}
        onConfirm={confirmDelete}
      />
      
      {editingReview && (
        <UpdateReviewModal
          reviewId={editingReview.id}
          initialStars={editingReview.stars}
          initialComment={editingReview.comment}
          onClose={() => setEditingReview(null)}
          onUpdated={handleUpdateComplete}
        />
      )}
    </div>
  );
};

export default ReviewsPage;