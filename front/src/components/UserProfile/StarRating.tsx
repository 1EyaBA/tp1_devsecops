import React from 'react';
import { Star } from 'lucide-react';
import '../../Styles/StarRating.css';

interface StarRatingProps {
  rating: number;
  size?: number;
}

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  size = 20
}) => {
  const renderStars = () => {
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <div key={i} className="star-container">
          <Star
            size={size}
            className={`star ${i < rating ? 'star-filled' : 'star-empty'}`}
            fill={i < rating ? 'currentColor' : 'none'}
            strokeWidth={1.5}
          />
        </div>
      );
    }
    
    return stars;
  };

  return (
    <div className="star-rating-component">
      <div className="stars-container">
        {renderStars()}
      </div>
    </div>
  );
};

export default StarRating;