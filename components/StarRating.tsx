
import React, { useState } from 'react';
import { StarIcon } from './icons';

interface StarRatingProps {
  rating: number;
  setRating?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating: React.FC<StarRatingProps> = ({ rating, setRating, size = 'md' }) => {
  const [hoverRating, setHoverRating] = useState(0);

  const onMouseEnter = (index: number) => {
    if (!setRating) return;
    setHoverRating(index);
  };

  const onMouseLeave = () => {
    if (!setRating) return;
    setHoverRating(0);
  };

  const onSaveRating = (index: number) => {
    if (!setRating) return;
    setRating(index);
  };

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  }

  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((index) => (
        <div
          key={index}
          className={setRating ? 'cursor-pointer' : ''}
          onMouseEnter={() => onMouseEnter(index)}
          onMouseLeave={onMouseLeave}
          onClick={() => onSaveRating(index)}
        >
          <StarIcon 
            className={sizeClasses[size]}
            filled={(hoverRating || rating) >= index}
          />
        </div>
      ))}
    </div>
  );
};

export default StarRating;
