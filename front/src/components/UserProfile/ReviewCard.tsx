import { Review} from "../../types";
import StarRating from "./StarRating";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {

  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-7 2xl:gap-x-32">
              <div>
               
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {review.reviewer.username}
                </p>
                <p className="mb-2 text-xs leading-normal text-gray-500 dark:text-gray-400">
                  {review.date}
                </p>
              </div>

              <div>
                <StarRating rating={review.stars}  />
              </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                  {review.comment}
                </p>
              

            </div>
          </div>

        </div>
      </div>
    
    </>
  );
}
