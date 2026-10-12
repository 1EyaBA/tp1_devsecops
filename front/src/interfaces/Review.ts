export interface Review {
    id: number;
    stars: number;
    comment?: string;
    date: any;
    ride: {
      id: number;
      departure: string;
      arrival: string;
      date: any;
      time: string;
    };
    user: {
      id: number;
      name: string;
      lastName?: string;
      imageUrl?: string;
    };
  }
  