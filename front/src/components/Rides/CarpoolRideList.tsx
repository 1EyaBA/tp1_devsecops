import React, { useState, useMemo, useEffect } from 'react';
import RideCard from './RideCard';
import FilterButton from './FilterButton';
import { CarpoolPost, Ride, RideState } from '../../types/posts';
import ViewPostModal from '../posts/ViewPostModal';
import { useLazyQuery, useQuery } from '@apollo/client';
import { GET_RIDES_BY_DRIVER, GET_RIDES_BY_PASSENGER, GET_USER, SEARCH_RIDES_BY_USER } from '../../graphQl/queries/rides';
import { useNavigate, useLocation } from 'react-router-dom';
import { GET_POST_BY_ID } from '../../graphQl/queries/posts';
import { Search, X } from 'lucide-react';

interface CarpoolRideListProps {
  onView?: (post: Ride) => void;
}

type FilterType = 'yourRides' | 'ridesTaken' | null;

const CarpoolRideList: React.FC<CarpoolRideListProps> = ({ }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeFilter, setActiveFilter] = useState<FilterType>(null);
  const [rides, setRides] = useState<Ride[]>([]);
  const [selectedPost, setSelectedPost] = useState<CarpoolPost | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Ride[]>([]);
  const [searchPage, setSearchPage] = useState(1);
  const [hasMoreResults, setHasMoreResults] = useState(false);
  
  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token;

  const { data: userData, loading: userLoading, error: userError, refetch: refetchUser } = useQuery(GET_USER, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
    onCompleted: (data) => console.log('GET_USER completed:', data),
    onError: (error) => console.error('GET_USER error:', error),
  });
  const userInfo = userData?.getAppUserInfo || {};
  
  const { 
    data: driverRidesData, 
    loading: driverLoading, 
    refetch: refetchDriverRides 
  } = useQuery(GET_RIDES_BY_DRIVER, {
    skip: !isLoggedIn || !userData || isSearching,
    fetchPolicy: 'network-only',
    onCompleted: (data) => console.log('GET_RIDES_BY_DRIVER completed:', data),
    onError: (error) => console.error('GET_RIDES_BY_DRIVER error:', error),
  });
  
  const { 
    data: passengerRidesData, 
    loading: passengerLoading,
    refetch: refetchPassengerRides 
  } = useQuery(GET_RIDES_BY_PASSENGER, {
    skip: !isLoggedIn || !userData || isSearching,
    fetchPolicy: 'network-only',
    onCompleted: (data) => console.log('GET_RIDES_BY_PASSENGER completed:', data),
    onError: (error) => console.error('GET_RIDES_BY_PASSENGER error:', error),
  });

  // Search query
  const [executeSearch, { loading: searchLoading }] = useLazyQuery(SEARCH_RIDES_BY_USER, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      console.log('Search completed:', data);
      if (data?.searchRidesByUser) {
        const formattedResults = formatRideData(data.searchRidesByUser.data);
        
        if (searchPage === 1) {
          setSearchResults(formattedResults);
        } else {
          setSearchResults(prev => [...prev, ...formattedResults]);
        }
        
        setHasMoreResults(
          data.searchRidesByUser.currentPage < data.searchRidesByUser.totalPages
        );
      }
    },
    onError: (error) => {
      console.error('Search error:', error);
    },
  });

  console.log('Driver Rides Data:', driverRidesData);
  console.log('Passenger Rides Data:', passengerRidesData);

  // Use a separate lazy query for getting post details
  const [getPost, { loading: postLoading }] = useLazyQuery(GET_POST_BY_ID, {
    fetchPolicy: 'network-only',
    onCompleted: (data) => {
      if (data && data.getPostById) {
        const post = data.getPostById;
        const formattedPost: CarpoolPost = {
          id: post.id.toString(),
          destination: post.destination,
          departure: post.departure,
          date: post.date,
          time: post.time,
          seatCount: post.seatCount,
          frequency: post.frequency,
          description: post.description,
          price: post.price,
          contactInfo: post.contactInfo,
          driverName:
            post.postOwner?.name && post.postOwner?.lastName
              ? `${post.postOwner.name} ${post.postOwner.lastName}`
              : "Unknown",
          comments: post.comments ?? [],
          postOwnerId: post.postOwner.id,
          status: post.status,
        };
        setSelectedPost(formattedPost);
        setIsViewModalOpen(true);
      }
    },
    onError: (error) => {
      console.error("Error fetching post:", error);
    }
  });

  // Format ride data helper function
  const formatRideData = (ridesData: any[]): Ride[] => {
    return ridesData.map((ride: any) => ({
      id: ride.id,
      date: ride.date,
      departure: ride.departure,
      arrival: ride.arrival,
      isYourRide: ride.post?.postOwner?.id === parseInt(userInfo.id),
      isRideYouTook: ride.appUserRides?.some((userRide: any) => 
        userRide.appUser?.id === parseInt(userInfo.id)
      ),
      post: ride.post?.id,
      time: ride.date ? new Date(ride.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
      price: ride.price || 0,
      nbPassengers: ride.nbPassengers || 0,
      state: ride.state || RideState.NOT_STARTED,
      appUserRides: ride.appUserRides || [],
      driver: ride.post?.postOwner ? `${ride.post.postOwner.name} ${ride.post.postOwner.lastName}` : 'Unknown'
    }));
  };

  // This effect will run whenever the route/location changes
  useEffect(() => {
    if (isLoggedIn && !isSearching) {
      console.log('Location changed or component mounted, refetching data...');
      refetchUser().then(() => {
        refetchDriverRides();
        refetchPassengerRides();
      });
    }
  }, [location.pathname, isLoggedIn, isSearching]);

  useEffect(() => {
    if (!isSearching && driverRidesData && passengerRidesData && userInfo.id) {
      const formattedRides: Ride[] = [];
  
      if (driverRidesData?.getRidesByDriver) {
        driverRidesData.getRidesByDriver.forEach((ride: any) => {
          formattedRides.push({
            id: ride.id,
            date: ride.date,
            departure: ride.departure,
            arrival: ride.arrival,
            isYourRide: true,
            isRideYouTook: false,
            post: ride.post?.id,
            time: ride.date ? new Date(ride.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            price: ride.price || 0,
            nbPassengers: ride.nbPassengers || 0,
            state: ride.state || RideState.NOT_STARTED,
            appUserRides: ride.appUserRides || [],
            driver: ride.post?.postOwner ? `${ride.post.postOwner.name} ${ride.post.postOwner.lastName}` : 'Unknown'
          });
        });
      }
  
      if (passengerRidesData?.getRidesByPassenger) {
        passengerRidesData.getRidesByPassenger.forEach((ride: any) => {
          formattedRides.push({
            id: ride.id,
            date: ride.date,
            departure: ride.departure,
            arrival: ride.arrival,
            isYourRide: false,
            isRideYouTook: true,
            post: ride.post?.id,
            time: ride.date ? new Date(ride.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '',
            price: ride.price || 0,
            nbPassengers: ride.nbPassengers || 0,
            state: ride.state || RideState.NOT_STARTED,
            appUserRides: [],
            driver: ride.post?.postOwner ? `${ride.post.postOwner.name} ${ride.post.postOwner.lastName}` : 'Unknown'
          });
        });
      }
  
      setRides(formattedRides);
    }
  }, [driverRidesData, passengerRidesData, userInfo.id, isSearching]);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setSearchPage(1);
    
    if (term.trim().length >= 2) {
      setIsSearching(true);
      executeSearch({
        variables: {
          searchTerm: term.trim(),
          page: 1,
          limit: 10,
          filterType: activeFilter
        }
      });
    } else {
      setIsSearching(false);
      setSearchResults([]);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setIsSearching(false);
    setSearchResults([]);
    setSearchPage(1);
  };

  const loadMoreResults = () => {
    if (hasMoreResults && !searchLoading) {
      const nextPage = searchPage + 1;
      setSearchPage(nextPage);
      executeSearch({
        variables: {
          searchTerm: searchTerm.trim(),
          page: nextPage,
          limit: 10,
          filterType: activeFilter
        }
      });
    }
  };

  const displayedRides = useMemo(() => {
    if (isSearching) {
      return searchResults;
    }
    
    if (!activeFilter) return rides;
    return activeFilter === 'yourRides'
      ? rides.filter(ride => ride.isYourRide)
      : rides.filter(ride => ride.isRideYouTook);
  }, [rides, activeFilter, isSearching, searchResults]);

  const toggleFilter = (filter: FilterType) => {
    const newFilter = activeFilter === filter ? null : filter;
    setActiveFilter(newFilter);
    
    if (isSearching && searchTerm.trim().length >= 2) {
      setSearchPage(1);
      executeSearch({
        variables: {
          searchTerm: searchTerm.trim(),
          page: 1,
          limit: 10,
          filterType: newFilter
        }
      });
    }
  };

  const handleViewPost = (postId: string) => {
    if (!postId) {
      console.error("Invalid postId:", postId);
      return;
    }
    getPost({ variables: { id: postId } });
  };
  
  const refreshAllData = () => {
    if (isLoggedIn) {
      if (isSearching && searchTerm.trim().length >= 2) {
        setSearchPage(1);
        executeSearch({
          variables: {
            searchTerm: searchTerm.trim(),
            page: 1,
            limit: 10,
            filterType: activeFilter
          }
        });
      } else {
        refetchUser().then(() => {
          refetchDriverRides();
          refetchPassengerRides();
        });
      }
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-600 dark:text-white/70">Please log in to view your rides</p>
          <button
            onClick={() => navigate('/signin')}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (userLoading || (!isSearching && (driverLoading || passengerLoading))) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-600 dark:text-white/70">Loading rides...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="w-full px-4 md:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-red-500 dark:text-red-400">Error loading user data: {userError.message}</p>
          <button
            onClick={refreshAllData}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full px-4 md:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900 pt-8 py-8">
      <div className="max-w-7xl mx-auto py-8">
        <div className="mb-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white/90 mb-4">Carpool Rides</h2>
              <div className="flex space-x-3 mb-4">
                <FilterButton 
                  label="Your Rides" 
                  isActive={activeFilter === 'yourRides'} 
                  onClick={() => toggleFilter('yourRides')} 
                />
                <FilterButton 
                  label="Rides You Took" 
                  isActive={activeFilter === 'ridesTaken'} 
                  onClick={() => toggleFilter('ridesTaken')} 
                />
              </div>
            </div>
            <button
              onClick={refreshAllData}
              className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-100 px-4 py-2 rounded-md hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
              disabled={searchLoading}
            >
              {searchLoading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search rides by location, driver name, or passenger name..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
      {isSearching && (
  <div
    className="mt-4 mb-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg backdrop-blur-sm px-5 py-3 animate-in slide-in-from-top-2 duration-200"
    role="status"
  >
    <div className="flex items-center gap-3">
      {searchLoading ? (
        <>
          <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Searching...
          </p>
        </>
      ) : (
        <>
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Found results for <span className="font-semibold text-gray-900 dark:text-gray-100">"{searchTerm}"</span>
          </p>
        </>
      )}
    </div>
  </div>
)}
          </div>
        </div>

        {displayedRides.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-gray-600 dark:text-white/70">
              {isSearching 
                ? `No rides found for "${searchTerm}"`
                : activeFilter === 'yourRides'
                ? "You haven't created any rides yet"
                : activeFilter === 'ridesTaken'
                ? "You haven't joined any rides yet"
                : 'No rides available'
              }
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
              {displayedRides.map((ride) => (
                <div key={ride.id} className="relative">
                  <RideCard 
                    ride={ride} 
                    onView={() => handleViewPost(String(ride.post))} 
                    userData={userInfo}
                  />
                </div>
              ))}
            </div>

            {isSearching && hasMoreResults && (
              <div className="text-center mt-8">
                <button
                  onClick={loadMoreResults}
                  disabled={searchLoading}
                  className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {searchLoading ? 'Loading...' : 'Load More Results'}
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {postLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg">
            <p className="text-gray-700 dark:text-white">Loading post details...</p>
          </div>
        </div>
      )}

      <ViewPostModal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        post={selectedPost} 
        userData={userInfo}
      />
    </div>
  );
};

export default CarpoolRideList;