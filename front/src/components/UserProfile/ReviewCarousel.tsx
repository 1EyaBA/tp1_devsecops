import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_USER_REVIEWS } from '../../graphQl/queries/reviews';
import ReviewCard from './ReviewCard';

interface ReviewProps {
  userId: number;
}

export default function ReviewCarousel({ userId}: ReviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsToShow = 3;

  const { loading, error, data } = useQuery(GET_USER_REVIEWS, {
    variables: { userId: userId ,
       page: 1,
      limit: 6,
    }, 
  });
  if (loading) return <p>Loading reviews...</p>;
  if (error) return <p>Error loading reviews: {error.message}</p>;

  const reviews = data?.getUserReviews?.data || [];

  if (reviews.length === 0) {
    return (
      <div className="w-full text-center text-gray-500 dark:text-gray-500">
        No reviews yet.
      </div>
    );
  }

  const totalSlides = Math.ceil(reviews.length / itemsToShow);

  const nextSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + itemsToShow >= reviews.length ? 0 : prevIndex + itemsToShow
    );
  };

  const prevSlide = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? (totalSlides - 1) * itemsToShow : prevIndex - itemsToShow
    );
  };

  const visibleReviews = reviews.slice(currentIndex, currentIndex + itemsToShow);

  return (
    <div className="relative w-full">
      <div className="flex items-center relative">
        <button
          onClick={prevSlide}
          className="absolute left-0 z-10 p-2 -translate-x-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          aria-label="Previous reviews"
        >
          <ChevronLeft size={24} />
        </button>

        <div className="w-full overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleReviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))}
          </div>
        </div>

        <button
          onClick={nextSlide}
          className="absolute right-0 z-10 p-2 translate-x-full text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          aria-label="Next reviews"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalSlides }).map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index * itemsToShow)}
            className={`w-2 h-2 rounded-full transition-colors ${
              Math.floor(currentIndex / itemsToShow) === index
                ? 'bg-gray-800 dark:bg-white'
                : 'bg-gray-300 dark:bg-gray-600'
            }`}
            aria-label={`Go to review set ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}