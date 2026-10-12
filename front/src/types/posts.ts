import { Review } from "../types";

export interface CarpoolPost {
    id: string;
    destination: string;
    departure: string;
    date: string;
    time: string;
    seatCount: number;
    driverName: string;
    frequency: string;
    description?: string;
    price?: number;
    contactInfo?: string;
    comments? : Comment[];
    postOwnerId: number;
    status: string;
    postOwner?: AppUser;
  }

export enum RideState {
  NOT_STARTED = 'NotStarted',
  STARTED = 'Started',
  CLOSED = 'Closed',
}

export interface Ride {
  id: number;
  date: string;  // Date should be in string format (ISO 8601) when using GraphQLISODateTime
  time: string;
  departure: string;
  arrival: string;
  price: number;
  nbPassengers: number;
  state: RideState;
  appUserRides: AppUserRide[];
  driver:string;
  post: CarpoolPost;
  isYourRide: boolean;
  isRideYouTook: boolean;
}

  export interface CreatePostFormData {
    destination: string;
    departure: string;
    date: string;
    time: string;
    seatCount: number;
    driverName: string;
    frequency: string;
    description?: string;
    price?: number;
    contactInfo?: string;
  }
 export interface Comment {
    id: string;
    commenter: AppUser;
    text: string;
    date: Date;
    postId: string; 
  }
  export interface User {
    id: number;
    email: string;
    password: string;
    role: 'user' | 'admin';
  }
  
  export interface AppUser extends User {
    name: string;
    lastName: string;
    dateOfBirth: string; // ISO string (as Date is usually serialized)
    phoneNumber: string;
    imageUrl: string;
    rating: number;
    posts: CarpoolPost[];
    reviews: Review[];
    appUserRides: AppUserRide[];
  }
  
export interface AppUserRide {
  id: number;
  ride: Ride;
  appUser: AppUser;
}