import { Notification } from '../../types';

// Create mock notifications with different types, read states, and timestamps
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'message',
    title: 'New message from Sarah',
    message: 'Hey there! Just wanted to check in on the project progress.',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    read: false,
    sender: {
      id: 'user-1',
      name: 'Sarah Johnson',
    },
    actionUrl: '/messages/123'
  },
  {
    id: '2',
    type: 'like',
    title: 'Michael liked your post',
    message: 'Your post "Design Systems in 2025" received a like.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    read: true,
    actionUrl: '/posts/456'
  },
  {
    id: '3',
    type: 'comment',
    title: 'New comment on your design',
    message: 'Alex commented: "Love the color palette you chose for this!"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
    read: false,
    sender: {
      id: 'user-2',
      name: 'Alex Rivera',
    },
    actionUrl: '/designs/789'
  },
  {
    id: '4',
    type: 'follow',
    title: 'New follower',
    message: 'Emily Chen started following you',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    read: true,
    sender: {
      id: 'user-3',
      name: 'Emily Chen',
    },
    actionUrl: '/profile/emily'
  },
  {
    id: '5',
    type: 'mention',
    title: 'Mention in a comment',
    message: 'Jamie mentioned you: "@user check out this new component library"',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    read: false,
    sender: {
      id: 'user-4',
      name: 'Jamie Wong',
    },
    actionUrl: '/comments/321'
  },
  {
    id: '6',
    type: 'other',
    title: 'Your weekly summary',
    message: 'Your activity summary for last week is now available.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
    read: true,
    actionUrl: '/summary/weekly'
  },
  {
    id: '7',
    type: 'message',
    title: 'Team announcement',
    message: 'Important: All team members are required to update their profiles by Friday.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    read: true,
    sender: {
      id: 'admin',
      name: 'Admin',
    }
  }
];