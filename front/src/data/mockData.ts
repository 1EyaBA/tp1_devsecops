
import { CarpoolPost } from '../types/posts.ts';
import { RidePost } from '../types';
export const mockCarpoolPosts: CarpoolPost[] = [
  {
    id: '1',
    destination: 'San Francisco, CA',
    departure: 'San Jose, CA',
    date: '2025-07-15',
    time: '08:00',
    seatCount: 3,
    driverName: 'Alex Johnson',
    frequency: 'Weekdays',
    description: 'I drive to SF for work every weekday. Looking for regular passengers to share the commute and reduce costs.',
    price: 10,
    contactInfo: 'alex.j@example.com',
    comments: [
      {
        id: '1',
        author: 'John Doe',
        text: 'I would love to join! I work in SF and can commute on weekdays.',
        timestamp: new Date('2025-06-20T14:00:00'),
        postId: '1'
      },
      {
        id: '2',
        author: 'Jane Smith',
        text: 'Sounds great! Could you let me know if there are still seats available?',
        timestamp: new Date('2025-06-21T16:30:00'),
        postId: '1'
      }
    ]
  },
  {
    id: '2',
    destination: 'Los Angeles, CA',
    departure: 'San Diego, CA',
    date: '2025-07-10',
    time: '10:30',
    seatCount: 2,
    driverName: 'Samantha Parker',
    frequency: 'One-time',
    description: 'Going to LA for a concert, happy to have some company and split gas money!',
    price: 25,
    contactInfo: 'sam.parker@example.com',
    comments: [
      {
        id: '3',
        author: 'Mike Taylor',
        text: 'I am interested in joining, but I need to check with my schedule. I’ll confirm by tomorrow.',
        timestamp: new Date('2025-06-22T10:45:00'),
        postId: '2'
      }
    ]
  },
  {
    id: '3',
    destination: 'Portland, OR',
    departure: 'Seattle, WA',
    date: '2025-07-20',
    time: '09:15',
    seatCount: 4,
    driverName: 'Michael Chen',
    frequency: 'Weekly (Fridays)',
    description: 'Driving to Portland every Friday to visit family. Car is comfortable with good AC and space for luggage.',
    price: 30,
    contactInfo: 'm.chen@example.com',
    comments: []
  },
  {
    id: '4',
    destination: 'Austin, TX',
    departure: 'Houston, TX',
    date: '2025-07-12',
    time: '14:00',
    seatCount: 1,
    driverName: 'Emily Rodriguez',
    frequency: 'Biweekly',
    description: 'Making this trip every other weekend. I have a fuel-efficient hybrid and like to listen to podcasts during the drive.',
    price: 15,
    contactInfo: 'emily.r@example.com',
    comments: [
      {
        id: '4',
        author: 'Tom Green',
        text: 'I would like to join! I’m from Austin and can meet you in Houston.',
        timestamp: new Date('2025-06-23T09:20:00'),
        postId: '4'
      }
    ]
  },
  {
    id: '5',
    destination: 'Chicago, IL',
    departure: 'Milwaukee, WI',
    date: '2025-07-16',
    time: '07:30',
    seatCount: 3,
    driverName: 'David Wilson',
    frequency: 'Weekdays',
    description: 'Daily commute to Chicago for work. Looking for regular passengers who need to be in the city by 9 AM.',
    price: 12,
    contactInfo: 'david.w@example.com',
    comments: [
      {
        id: '5',
        author: 'Alice Brown',
        text: 'I’m interested! Can you let me know if you have seats available for a couple of weeks?',
        timestamp: new Date('2025-06-24T12:00:00'),
        postId: '5'
      }
    ]
  },
  {
    id: '6',
    destination: 'New York, NY',
    departure: 'Philadelphia, PA',
    date: '2025-07-25',
    time: '11:00',
    seatCount: 2,
    driverName: 'Sophia Martinez',
    frequency: 'One-time',
    description: 'Weekend trip to NYC. I have a sedan with plenty of space and am a careful driver with 10+ years of experience.',
    price: 35,
    contactInfo: 'sophia.m@example.com',
    comments: [
      {
        id: '6',
        author: 'David Clark',
        text: 'Sounds like a fun trip! I’ve been meaning to visit NYC for a while now.',
        timestamp: new Date('2025-06-25T15:30:00'),
        postId: '6'
      }
    ]
  }
];

export const sampleRides: RidePost[] = [
  {
    id: '1',
    date: 'Mon, Sep 15, 2025',
    from: 'San Francisco',
    to: 'Palo Alto',
    riders: ['Alice Johnson', 'Bob Smith'],
    isYourRide: true,
    isRideYouTook: false,
    postId: '1'
  },
  {
    id: '2',
    date: 'Tue, Sep 16, 2025',
    from: 'Oakland',
    to: 'San Jose',
    driver: 'Carol Davis',
    isYourRide: false,
    isRideYouTook: true,
    postId: '2'
  },
  {
    id: '3',
    date: 'Wed, Sep 17, 2025',
    from: 'Berkeley',
    to: 'Mountain View',
    riders: ['Alice Johnson', 'Eve Brown'],
    isYourRide: true,
    isRideYouTook: false,
    postId: '1'
  },
  {
    id: '4',
    date: 'Thu, Sep 18, 2025',
    from: 'Fremont',
    to: 'Cupertino',
    driver: 'Frank Miller',
    isYourRide: false,
    isRideYouTook: true,
    postId: '2'
  },
  {
    id: '5',
    date: 'Fri, Sep 19, 2025',
    from: 'San Mateo',
    to: 'Sunnyvale',
    riders: ['Alice Johnson', 'Henry Taylor'],
    isYourRide: true,
    isRideYouTook: false,
    postId: '3'
  }
];

