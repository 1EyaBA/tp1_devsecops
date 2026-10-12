export interface ReviewedUser {
  id: number;
  name: string;
  image: string;
}

export interface Ride {
  id: number;
  date: string  ;
  departure: string;
  arrival: string;
  price: number;
  time: string;

}

export interface ReviewFormData {
  reviewedUser: ReviewedUser;
  ride: Ride;
}

export interface GetReviewFormDataResponse {
  reviewFormData: ReviewFormData;
}
