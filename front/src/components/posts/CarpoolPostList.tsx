
import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import CarpoolPostItem from './CarpoolPostItem.tsx';
import CreatePostModal from './CreatePostModal.tsx';
import ViewPostModal from './ViewPostModal.tsx';
import { CarpoolPost} from '../../types/posts.ts';
import '../../styles/posts.css';
import { useQuery } from '@apollo/client';
import { GET_POSTS } from '../../graphQl/queries/posts.ts';
import { GET_USER } from '../../graphQl/queries/rides.ts';
import PostFilter from './postFilter.tsx';
import { useLocation } from 'react-router-dom';

const CarpoolPostList: React.FC = () => {
  const location = useLocation();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(6); 
  const handlePostDeleted = (postId: number) => {
  setFilteredPosts(prevPosts => prevPosts.filter(post => post.id !== postId.toString()));
};

const handlePostClosed = (postId: number) => {
  setFilteredPosts(prevPosts => prevPosts.filter(post => post.id !== postId.toString()));
};
  

  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<CarpoolPost | null>(null);
  const [filter, setFilter] = useState<'all' | 'my'>('all');
  const [filteredPosts, setFilteredPosts] = useState<CarpoolPost[]>([]);
  const [debugInfo, setDebugInfo] = useState({
    hasData: false,
    hasPosts: false,
    postsCount: 0,
    rawData: null
  });
  
  const token = localStorage.getItem('auth_token');
  const isLoggedIn = !!token;
  
  const { 
    data: userData, 
    loading: userLoading, 
    error: userError,
    refetch: refetchUser 
  } = useQuery(GET_USER, {
    skip: !isLoggedIn,
    fetchPolicy: 'network-only',
    onCompleted: (data) => console.log('GET_USER completed:', data),
    onError: (error) => console.error('GET_USER error:', error)
  });
  

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchTerm]);

  useEffect(() => {
    if (isLoggedIn) {
      console.log('Location changed or component mounted, refetching post data...');
      refetchUser().then(() => {
        refetchPosts();
      });
    } else {
      refetchPosts();
    }
  }, [location.pathname, isLoggedIn]);
  
  const refreshAllData = () => {
    if (isLoggedIn) {
      refetchUser().then(() => {
        refetchPosts();
      });
    } else {
      refetchPosts();
    }
  };

  useEffect(() => {
    if (isCreateModalOpen || isViewModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isCreateModalOpen, isViewModalOpen]);
  
  const userInfo = userData?.getAppUserInfo || {};
  const { 
  data, 
  loading, 
  error, 
  refetch: refetchPosts 
} = useQuery(GET_POSTS, {
  variables: {
    searchTerm: debouncedSearchTerm,
    page,
    limit,
    filter: filter === 'my' ? userInfo?.id?.toString() : null
  },
  fetchPolicy: 'network-only'
});
useEffect(() => {
  setPage(1); 
}, [filter]);
  
  const transformPosts = (): CarpoolPost[] => {
    if (!data?.getPosts) return [];
    
    const posts = Array.isArray(data.getPosts) ? data.getPosts : data.getPosts.data;
    if (!posts) return [];
    
    return posts.map((post: any) => ({
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
      driverName: post.postOwner?.name && post.postOwner?.lastName
        ? `${post.postOwner.name} ${post.postOwner.lastName}`
        : "Unknown",
      comments: post.comments ?? [],
      postOwnerId: post.postOwner?.id,
      postOwner:post.postOwner,
      status: post.status,
    }));
  };

  console.log("info", userInfo);
  
useEffect(() => {
  setFilteredPosts(transformPosts());
}, [data]);

  const handlePostClick = (post: CarpoolPost) => {
    setSelectedPost(post);
    setIsViewModalOpen(true);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleLoadMore = () => {
    if (data?.getPosts?.currentPage) {
      if (data.getPosts.currentPage < Math.ceil(data.getPosts.totalItems / limit)) {
        setPage(prevPage => prevPage + 1);
      }
    } else {
      setPage(prevPage => prevPage + 1);
    }
  };

  const totalPosts = data?.getPosts?.totalItems || 0;
  const currentPostsCount = filteredPosts.length;
  const hasMorePosts = data?.getPosts?.totalItems ? 
    currentPostsCount < totalPosts : 
    currentPostsCount === limit;

  if (loading && page === 1) return <p>Loading...</p>;
  if (error) return (
    <div className="w-full px-4 md:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900 pt-2 pb-8 mt-2">
      <div className="max-w-7xl mx-auto text-center py-12">
        <p className="text-red-500 dark:text-red-400">Error loading posts: {error.message}</p>
        <button
          onClick={refreshAllData}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Retry
        </button>
      </div>
    </div>
  );
  
  return (
    <div className="w-full px-4 md:px-8 lg:px-12 bg-gray-50 dark:bg-gray-900 pt-4 pb-8">
      <div className="flex justify-between items-center mb-6" style={{marginTop:"0px",padding:"0rem"}}>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Available Carpools</h1>
        <div className="flex gap-2">
          <button 
            onClick={refreshAllData}
            className="bg-blue-100 text-blue-700 px-4 py-2 rounded-md flex items-center hover:bg-blue-200 transition-colors dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
          >
            Refresh
          </button>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors dark:bg-brand-500/[0.12] dark:text-white/90 dark:hover:bg-white/5"
          >
            <Plus size={18} className="mr-1" />
            Create Post
          </button>
        </div>
      </div>

      {/* Search input */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={18} className="text-gray-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by destination, departure, or description..."
            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-white focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          />
        </div>
      </div>

      <PostFilter 
        activeFilter={filter} 
        onFilterChange={setFilter} 
        isLoggedIn={isLoggedIn}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6 justify-start w-full">
        {filteredPosts.length > 0 ? (
          filteredPosts.map(post => (
            <CarpoolPostItem 
              key={post.id} 
              post={post} 
              onClick={handlePostClick}
              userData={userInfo}
              onPostDeleted={handlePostDeleted}  
              onPostClosed={handlePostClosed}  
            />
          ))
        ) : (
          <div className="col-span-full text-left py-4 text-gray-500 pl-1">
            {debouncedSearchTerm ? 
              `No results found for "${debouncedSearchTerm}"` : 
              filter === 'my' ? 
                "You haven't created any carpool posts yet." : 
                "No carpool posts available."
            }
          </div>
        )}
      </div>

      {/* Load more button */}
      {hasMorePosts && (
  <div className="mt-6 text-center">
    <div className="flex justify-center items-center gap-4">
      <button
        onClick={() => setPage(prevPage => Math.max(prevPage - 1, 1))}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        disabled={loading || page === 1}
      >
        &larr; Prev
      </button>

      <button
        onClick={() => setPage(prevPage => prevPage + 1)}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
        disabled={loading || page * limit >= totalPosts}
      >
        Next &rarr;
      </button>
    </div>
  </div>
)}


      {/* Display information about search results */}
      {debouncedSearchTerm && (
        <div className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          {data?.getPosts?.totalItems !== undefined ? 
            `Showing ${currentPostsCount} of ${totalPosts} results for "${debouncedSearchTerm}"` :
            `Found ${currentPostsCount} results for "${debouncedSearchTerm}"`
          }
        </div>
      )}
      
      <CreatePostModal 
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        userData={userInfo} 
      />
      
      <ViewPostModal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        post={selectedPost}
        userData={userInfo}
      />
    </div>
  );
};

export default CarpoolPostList;