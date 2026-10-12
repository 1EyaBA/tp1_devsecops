export interface Drive {
    from: string;
    to: string;
    date: string;
    riders: string[];
    time: string;
    state: string;
  }

  export interface Ride {
    from: string;
    to: string;
    date: string;
    time: string;
    state:string,
    driver: string;
  }
  export interface Review {
    id: number;
    stars: number;
    comment: string;
    date: string; 
    reviewer: {
      id: number;
      username: string;
    };
    reviewedUser: {
      id: number;
      username: string;
    };
    
  }
  export type UpdateAppUserInput = {
    name: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
    password: string;
  };
  export interface User {
    id: number
    name: string;
    lastName: string;
    email: string;
    phoneNumber?: string ;
    dateOfBirth?: string | null; 
    imageUrl?: string
  }
  export type UpdatePhotoInput = {
    file: string;
  }
  
export interface RidePost {
  id: string;
  date: string;
  from: string;
  to: string;
  riders?: string[];
  driver?: string;
  isYourRide: boolean;
  isRideYouTook: boolean;
  postId: string;
}
  
  export interface Sender {
    id: string;
    name: string;
    avatar?: string;
  }
  
  export interface Notification {
    id: string;
    type: 'message' | 'like' | 'comment' | 'follow' | 'mention' | 'other';
    title: string;
    message: string;
    timestamp: Date;
    read: boolean;
    sender?: Sender;
    actionUrl?: string;
  }


