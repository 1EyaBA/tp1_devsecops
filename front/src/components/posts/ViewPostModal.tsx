import React, { useState, useEffect } from 'react';
import { MapPin, Calendar, Clock, Users, RotateCcw, DollarSign, Mail, Send, Variable, User } from 'lucide-react';
import { CarpoolPost, Comment } from '../../types/posts.ts';
import { formatDate, formatTime } from '../../utils/dateTime';
import '../../styles/posts.css';
import { useLazyQuery, useMutation, useQuery } from '@apollo/client';
import { CREATE_COMMENT, GET_RIDE, IS_USER_IN_RIDE,GET_JOIN_REQUESTS } from '../../graphQl/queries/posts';
import { CREATE_JOIN_REQUEST, DELETE_JOIN_REQUEST } from '../../graphQl/queries/rides.ts';
import { Link } from 'react-router-dom';

interface ViewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CarpoolPost | null;
    userData: {
      id?: string;
      name?: string;
      lastName?: string;
    };
}


const ViewPostModal: React.FC<ViewPostModalProps> = ({ isOpen, onClose, post,userData }) => {
    console.log("post data ",post);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [requestPending, setRequestPending] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const { data: rideData} = useQuery(GET_RIDE, {
    variables: { postId: Number(post?.id )},
  });
  console.log("ride",rideData);
    const { data: joinRequest } = useQuery(GET_JOIN_REQUESTS, {
      variables:{rideId:Number(rideData?.matchingRide?.ride?.id),userId:Number(userData.id)},
      fetchPolicy: 'network-only',
      onCompleted: (data) => console.log('GET_ride completed:', data),
      //onError: (error) => console.error('GET_ride error:', error)
    });
    useEffect(() => {
      if (joinRequest?.getJoinRequestsByRideUser) {
        const hasRequests = Array.isArray(joinRequest.getJoinRequestsByRideUser) 
          ? joinRequest.getJoinRequestsByRideUser.length > 0 
          : !!joinRequest.getJoinRequestsByRideUser;
        
        setRequestPending(hasRequests);
      } else {
        setRequestPending(false);
      }
    }, [joinRequest]);
    const [checkIsPassenger, { data: isPassengerData }] = useLazyQuery(IS_USER_IN_RIDE);
  
  useEffect(() => {
    if (rideData?.matchingRide?.ride?.id && userData?.id) {
      checkIsPassenger({
        variables: {
          userId: Number(userData.id),
          rideId: Number(rideData.matchingRide.ride.id),
        },
      });
    }
  }, [rideData, userData]);
  console.log("is", isPassengerData);
  const [createJoinRequest] = useMutation(CREATE_JOIN_REQUEST);
  const [deleteJoinRequest] = useMutation(DELETE_JOIN_REQUEST);
  const [createComment] = useMutation(CREATE_COMMENT, {
    onCompleted: (data) => {
      const newCommentData :Comment = {
        id:data.createComment.id,
        text:data.createComment.text,
        date :data.createComment.date,
        commenter: data.createComment.commenter,
        postId: data.createComment.post.id,
      };
      setComments(prevComments => [...prevComments, newCommentData]);
      setNewComment('');
      setSubmittingComment(false);
    },
    onError: (error) => {
      console.error("Error creating comment:", error);
      setSubmittingComment(false);
    }
  });
  const isPostOwner = Number(post?.postOwnerId) === Number(userData?.id);

  useEffect(() => {
    if (post && isOpen) {
      setComments(post.comments || []);
      setRequestPending(false);
      setShowAlert(false);
      setNewComment('');
    }
  }, [post, isOpen]);

  if (!isOpen || !post) return null;

  const handleAddComment = async () => {
    if (!newComment.trim() || !post || submittingComment) return;
    
    setSubmittingComment(true);
    
    try {
      // Call the GraphQL mutation
      await createComment({
        variables: {
          input: {
            postId: +post.id,
            text: newComment
            // The server uses the current user from auth token
          }
        }
      });
    } catch (error) {
      // Error handling is done in the onError callback of the useMutation
      console.error("Failed to create comment:", error);
    }
  };

  // Format relative time for comments
  const formatCommentTime = (date: Date | string | undefined): string => {
    if (!date) return 'Unknown time';
  
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
  
    if (isNaN(parsedDate.getTime())) return 'Invalid time';
  
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - parsedDate.getTime()) / (1000 * 60));
  
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
  
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };
  
  // Handle join ride button
  const handleJoinRide =async  (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering other events
    
    if (requestPending) {
      setRequestPending(false);
      setShowAlert(true);
      await deleteJoinRequest({ variables: { postId: Number(post.id) } });
      // Auto-hide the alert after 3 seconds
      setTimeout(() => {
        setShowAlert(false);
      }, 3000);
    } else {
      setRequestPending(true);
      await createJoinRequest({ variables: { postId: Number(post.id) } });
      
    }
  };
    const handleDeletePost = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("Delete post clicked for post ID:", post.id);
    };
  
    const handleClosePost = (e: React.MouseEvent) => {
      e.stopPropagation();
      console.log("Close post clicked for post ID:", post.id);
    };
  

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-30 z-99999 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md flex flex-col max-h-[80vh] relative">
        {showAlert && (
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="bg-black/50 dark:bg-gray-900/60 text-white text-sm px-6 py-3 rounded-md shadow-lg">
            Request cancelled
          </div>
        </div>
      )}
        
        <div className="flex justify-between items-center p-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">Post Details</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-3 overflow-y-auto flex-grow">
          <div className="mb-3">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400 mb-2">{post.departure} → {post.destination}</h3>
            <Link
            to={`/profile/${post.postOwnerId}`} 
            className="flex items-center no-underline text-inherit hover:bg-gray-100 dark:hover:bg-gray-700 p-1 rounded-md"
          >
            <div className="flex items-center mb-1">
              <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-medium mr-2 dark:bg-blue-600 dark:text-blue-200">
                {post.driverName.charAt(0)}
              </div>
              <span className="font-medium text-gray-800 dark:text-gray-100">{post.driverName}</span>
            </div>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-start">
              <MapPin size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">From</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{post.departure}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <MapPin size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">To</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{post.destination}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Calendar size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">Date</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{formatDate(post.date)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Clock size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">Time</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{formatTime(post.time)}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <Users size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">Available Seats</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{post.seatCount}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <RotateCcw size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">Frequency</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{post.frequency}</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <DollarSign size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-300">Price</p>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100">${post.price}</p>
              </div>
            </div>
            
            {post.contactInfo && (
              <div className="flex items-start">
                <Mail size={16} className="mr-2 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-300">Contact</p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{post.contactInfo}</p>
                </div>
              </div>
            )}
          </div>
          
          {post.description && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</h4>
              <p className="text-sm text-gray-600 dark:text-gray-200">{post.description}</p>
            </div>
          )}
          
          <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Comments</h4>
            
            <div className="space-y-3 mb-3 max-h-40 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 italic">No comments yet</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-2">
                    <div className="flex justify-between items-center mb-1">
                      <Link
                        to={`/profile/${comment.commenter.id}`} 
                        className="flex items-center no-underline text-inherit hover:bg-gray-90 dark:hover:bg-gray-700 p-1 rounded-md"
                      >
                      <div className="flex items-center">
                        <div className="w-5 h-5 bg-blue-100 dark:bg-blue-600 rounded-full flex items-center justify-center text-blue-700 dark:text-blue-200 text-xs font-medium">
                        {comment.commenter?.imageUrl ? (
                          <img 
                           src={`http://localhost:3000${comment.commenter.imageUrl}`}
                            alt={`${comment.commenter.name}'s profile`}
                            className="w-full h-full object-cover rounded-full"

                          />
                        ) : (
                          <User className="w-5 h-5 text-gray-500" />
                        )}
                        </div>
                        <span className="ml-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
                          {comment.commenter?.name && comment.commenter?.lastName
                          ? `${comment.commenter.name} ${comment.commenter.lastName}`
                          : "Unknown"}
                        </span>
                      </div>
                      </Link>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCommentTime(comment.date)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-200">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
            
            <div className="flex items-center mt-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 text-sm border border-gray-300 dark:border-gray-600 rounded-l-md px-3 py-1.5 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') handleAddComment();
                }}
                disabled={submittingComment}
              />
              <button
                onClick={handleAddComment}
                disabled={submittingComment || !newComment.trim() || post.status=='closed'}
                className={`${
                  submittingComment || !newComment.trim() 
                    ? 'bg-blue-400 dark:bg-blue-600 cursor-not-allowed'
                    : 'bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400'
                } text-white px-3 py-1.5 rounded-r-md transition-colors`}
              >
                {submittingComment ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send size={21.5} />
                )}
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end p-2 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
        <div className="flex space-x-2">
          {!isPostOwner && post.status !== "closed" &&(
            <button
              onClick={handleJoinRide}
              disabled={isPassengerData?.isUserInRide}
              title={isPassengerData?.isUserInRide ? 'Already joined this ride' : ''}
              className={`py-1 px-4 rounded-md font-medium text-sm transition-all duration-300 ${
                requestPending
                  ? 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/30'
                  : 'bg-blue-100 dark:bg-brand-500/20 text-blue-700 dark:text-brand-400 border border-blue-200 dark:border-brand-500/20 hover:bg-blue-200 dark:hover:bg-brand-500/30'
              }`}
            >
              {requestPending ? 'Request Pending' : 'Join Ride'}
            </button>
          )}
                  
          {isPostOwner && (
            <div className="flex space-x-2">
              <button
                onClick={handleDeletePost}
                className="py-1 px-4 rounded-md font-medium text-sm transition-all duration-300 bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-500/30 hover:bg-red-200 dark:hover:bg-red-500/30"
              >
                Delete Post
              </button>
              
              <button
                onClick={handleClosePost}
                className="py-1 px-4 rounded-md font-medium text-sm transition-all duration-300 bg-gray-100 dark:bg-gray-500/20 text-gray-700 dark:text-gray-400 border border-gray-200 dark:border-gray-500/30 hover:bg-gray-200 dark:hover:bg-gray-500/30"
              >
                Close Post
              </button>
            </div>
          )}
          <button
            onClick={onClose}
            className="px-3 py-1 text-xs bg-blue-600 dark:bg-blue-500 rounded-md font-medium text-white hover:bg-blue-700 dark:hover:bg-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ViewPostModal;