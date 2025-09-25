import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import { hasAuthToken, verifyToken, clearAuth, getAuthHeaders, getCurrentUser } from "./api/auth/auth-client";

// ===== TYPESCRIPT INTERFACES =====
interface FeedPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    bio: string | null;
  };
  comments: {
    id: number;
    content: string;
    createdAt: string;
    author: {
      id: number;
      username: string;
    };
  }[];
}

interface FeedResponse {
  posts: FeedPost[];
}

/**
 * FeedPage Component
 * 
 * A social media feed page with purple header, orange gradient background,
 * and interactive post cards with like/comment functionality.
 * Features infinite scroll loading from PostgreSQL database.
 */
export default function FeedPage() {
  // ===== STATE MANAGEMENT =====
  const router = useRouter();
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [showCreatePostOverlay, setShowCreatePostOverlay] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postContent, setPostContent] = useState('');
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: number]: string }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<{ [postId: number]: boolean }>({});
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  // ===== API FUNCTIONS =====
  /**
   * Fetches all posts from the API
   */
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Use the auth utility function to get headers
      const response = await axios.get<FeedResponse>('/api/main/feed', getAuthHeaders());
      setPosts(response.data.posts);
      
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Creates a new post
   */
  const createPost = async (title: string, content: string) => {
    try {
      setIsSubmittingPost(true);
      setPostError(null);

      const response = await axios.post('/api/posts/create', 
        { title, content }, 
        getAuthHeaders()
      );

      // Add the new post to the beginning of the posts array
      setPosts(prevPosts => [response.data.post, ...prevPosts]);
      
      // Close overlay and reset form
      setShowCreatePostOverlay(false);
      setPostTitle('');
      setPostContent('');
      
    } catch (err: any) {
      console.error('Error creating post:', err);
      setPostError(err.response?.data?.error || 'Failed to create post. Please try again.');
    } finally {
      setIsSubmittingPost(false);
    }
  };

  /**
   * Creates a new comment
   */
  const createComment = async (postId: number, content: string) => {
    try {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: true }));

      const response = await axios.post('/api/comments/create', 
        { postId, content }, 
        getAuthHeaders()
      );

      // Update the posts array with the new comment (add to beginning for newest first)
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: [response.data.comment, ...post.comments] }
            : post
        )
      );
      
      // Clear the comment text for this post
      setCommentText(prev => ({ ...prev, [postId]: '' }));
      
    } catch (err: any) {
      console.error('Error creating comment:', err);
      setError(err.response?.data?.error || 'Failed to create comment. Please try again.');
    } finally {
      setIsSubmittingComment(prev => ({ ...prev, [postId]: false }));
    }
  };

  /**
   * Deletes a comment
   */
  const deleteComment = async (commentId: number, postId: number) => {
    try {
      setDeletingCommentId(commentId);
      
      await axios.delete('/api/comments/delete', {
        data: { commentId },
        ...getAuthHeaders()
      });
      
      // Remove the comment from the posts array
      setPosts(prevPosts => 
        prevPosts.map(post => 
          post.id === postId 
            ? { ...post, comments: post.comments.filter(comment => comment.id !== commentId) }
            : post
        )
      );
      
    } catch (err: any) {
      console.error('Error deleting comment:', err);
      setError(err.response?.data?.error || 'Failed to delete comment. Please try again.');
    } finally {
      setDeletingCommentId(null);
    }
  };

  // ===== AUTHENTICATION CHECK =====
  const checkAuthentication = async () => {
    // First check if we have a token
    if (!hasAuthToken()) {
      router.push('/login');
      return false;
    }

    try {
      // Verify token using auth utility function
      const result = await verifyToken();
      
      if (result.valid) {
        setIsCheckingAuth(false);
        // Set current user from localStorage
        const user = getCurrentUser();
        setCurrentUser(user);
        return true;
      } else {
        // Clear invalid auth data
        clearAuth();
        router.push('/login');
        return false;
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Clear invalid auth data
      clearAuth();
      router.push('/login');
      return false;
    }
    
    return false;
  };

  // ===== INITIAL DATA LOAD =====
  useEffect(() => {
    // Check authentication first
    checkAuthentication().then((isAuth) => {
      if (isAuth) {
        fetchPosts();
      }
    });
  }, []);

  // ===== EVENT HANDLERS =====
  const handleSignOut = () => {
    clearAuth();
    router.push("/login");
  };

  const handleProfileClick = () => {
    if (currentUser) {
      router.push(`/profile/${currentUser.id}`);
    }
  };

  const handleUserProfileClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(expandedComments === postId ? null : postId);
  };

  const handleCreatePost = () => {
    setShowCreatePostOverlay(true);
  };

  const handleCancelPost = () => {
    setShowCreatePostOverlay(false);
    setPostTitle('');
    setPostContent('');
    setPostError(null);
  };

  const handlePostSubmit = () => {
    if (postTitle.trim() && postContent.trim()) {
      createPost(postTitle.trim(), postContent.trim());
    }
  };

  const handleCommentSubmit = (postId: number) => {
    const content = commentText[postId];
    if (content && content.trim()) {
      createComment(postId, content.trim());
    }
  };

  const handleCommentTextChange = (postId: number, value: string) => {
    setCommentText(prev => ({ ...prev, [postId]: value }));
  };

  const handleDeleteComment = (commentId: number, postId: number) => {
    deleteComment(commentId, postId);
  };

  /**
   * Formats a date string to a human-readable relative time
   */
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // ===== RENDER =====
  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-400 via-red-500 to-red-600">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg text-white mb-4"></div>
          <p className="text-white text-lg">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-red-500 to-red-600">
      {/* ===== PURPLE HEADER BAR ===== */}
      <div className="bg-purple-600 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left Navigation */}
            <div className="flex items-center space-x-6">
              <span className="text-white font-medium">
                {currentUser ? `Welcome ${currentUser.username}` : 'Welcome User'}
              </span>
              <a href="/feed" className="text-white font-medium hover:text-purple-200 transition-colors">
                Feed
              </a>
              <button 
                onClick={handleProfileClick}
                className="text-white font-medium hover:text-purple-200 transition-colors"
              >
                Profile
              </button>
            </div>
            
            {/* Right Sign Out */}
            <button 
              onClick={handleSignOut}
              className="text-white font-medium hover:text-purple-200 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* ===== MAIN CONTENT AREA ===== */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ===== PAGE TITLE SECTION ===== */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Social Feed</h1>
          <p className="text-lg text-gray-700">See what's happening in the flock</p>
        </div>

        {/* ===== LOADING STATE ===== */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg text-white"></div>
            <span className="ml-4 text-white text-lg">Loading posts...</span>
          </div>
        )}

        {/* ===== ERROR STATE ===== */}
        {error && (
          <div className="alert alert-error mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
            <button 
              onClick={() => fetchPosts()}
              className="btn btn-sm btn-outline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===== POSTS SECTION ===== */}
        {!loading && (
          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="card bg-white shadow-xl rounded-2xl">
                <div className="card-body p-6">
                  {/* ===== POST HEADER ===== */}
                  <div className="flex items-center mb-4">
                    <div className="avatar">
                      <div className="w-12 h-12 rounded-full ring ring-gray-200 ring-offset-base-100 ring-offset-2">
                        <Image
                          src="/Placeholder logo.png"
                          alt={post.author.username}
                          width={48}
                          height={48}
                          className="rounded-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="ml-4">
                      <button 
                        onClick={() => handleUserProfileClick(post.author.id)}
                        className="font-semibold text-gray-800 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                      >
                        {post.author.username}
                      </button>
                      <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                    </div>
                  </div>

                  {/* ===== POST CONTENT ===== */}
                  <div className="mb-4">
                    <h2 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h2>
                    <p className="text-gray-700 leading-relaxed">{post.content}</p>
                  </div>

                  {/* ===== POST INTERACTIONS ===== */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-6">
                      {/* Like Button */}
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-red-500 transition-colors">
                        <Image 
                          src="/heartPNG.png" 
                          alt="Like" 
                          width={20} 
                          height={20} 
                          className="w-6 h-6"
                        />
                        <span className="font-medium">0 Likes</span>
                      </button>

                      {/* Comment Button */}
                      <button 
                        onClick={() => toggleComments(post.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-500 transition-colors"
                      >
                        <Image 
                          src="/commentPNG.png" 
                          alt="Comment" 
                          width={20} 
                          height={20} 
                          className="w-6 h-6"
                        />
                        <span className="font-medium">{post.comments.length} Comments</span>
                      </button>
                    </div>
                  </div>

                  {/* ===== EXPANDED COMMENTS SECTION ===== */}
                  {expandedComments === post.id && (
                    <div className="mt-6 pt-6 border-t border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-gray-800">Comments</h4>
                      </div>
                      
                      {/* Add Comment Form */}
                      <div className="mb-4">
                        <div className="flex space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-medium text-gray-600">
                              {currentUser?.username?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={commentText[post.id] || ''}
                              onChange={(e) => handleCommentTextChange(post.id, e.target.value)}
                              placeholder="Write a comment..."
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                              rows={2}
                              maxLength={500}
                              disabled={isSubmittingComment[post.id]}
                            />
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-gray-500">
                                {(commentText[post.id] || '').length}/500 characters
                              </span>
                              <button
                                onClick={() => handleCommentSubmit(post.id)}
                                disabled={!commentText[post.id]?.trim() || isSubmittingComment[post.id]}
                                className="px-4 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                              >
                                {isSubmittingComment[post.id] ? (
                                  <>
                                    <span className="loading loading-spinner loading-xs mr-1"></span>
                                    Posting...
                                  </>
                                ) : (
                                  'Comment'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Comments List */}
                      <div className="space-y-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-sm font-medium text-gray-600">
                                {comment.author.username.charAt(0).toUpperCase()}
                              </span>
                            </div>
                            <div className="flex-1">
                              <div className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  <button 
                                    onClick={() => handleUserProfileClick(comment.author.id)}
                                    className="font-medium text-sm text-gray-800 hover:text-blue-600 hover:underline transition-colors cursor-pointer"
                                  >
                                    {comment.author.username}
                                  </button>
                                  {/* Delete button for own comments */}
                                  {currentUser && currentUser.id === comment.author.id && (
                                    <button
                                      onClick={() => handleDeleteComment(comment.id, post.id)}
                                      disabled={deletingCommentId === comment.id}
                                      className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-1"
                                      title="Delete comment"
                                    >
                                      {deletingCommentId === comment.id ? (
                                        <span className="loading loading-spinner loading-xs"></span>
                                      ) : (
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      )}
                                    </button>
                                  )}
                                </div>
                                <p className="text-gray-700 mt-1">{comment.content}</p>
                                <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(comment.createdAt)}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* ===== NO POSTS MESSAGE ===== */}
            {!loading && posts.length === 0 && !error && (
              <div className="text-center py-12">
                <div className="text-white text-xl opacity-70">
                  No posts available. Be the first to create a post!
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== FLOATING ACTION BUTTON ===== */}
      <button
        onClick={handleCreatePost}
        className="fixed bottom-6 right-6 hover:shadow-xl transition-all duration-300"
        aria-label="Create new post"
      >
        <Image 
          src="/addPostPNG.png" 
          alt="Add Post" 
          width={56} 
          height={56} 
          className="w-14 h-14"
        />
      </button>

      {/* ===== CREATE POST OVERLAY ===== */}
      {showCreatePostOverlay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Create New Post</h2>
                <button
                  onClick={handleCancelPost}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Error Message */}
              {postError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-red-700 text-sm">{postError}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="space-y-4">
                {/* Title Input */}
                <div>
                  <label htmlFor="post-title" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Title
                  </label>
                  <input
                    id="post-title"
                    type="text"
                    value={postTitle}
                    onChange={(e) => setPostTitle(e.target.value)}
                    placeholder="What do you want to talk about?"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    maxLength={100}
                    disabled={isSubmittingPost}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {postTitle.length}/100 characters
                  </div>
                </div>

                {/* Content Input */}
                <div>
                  <label htmlFor="post-content" className="block text-sm font-medium text-gray-700 mb-2">
                    Post Content
                  </label>
                  <textarea
                    id="post-content"
                    value={postContent}
                    onChange={(e) => setPostContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={6}
                    maxLength={1000}
                    disabled={isSubmittingPost}
                  />
                  <div className="text-right text-sm text-gray-500 mt-1">
                    {postContent.length}/1000 characters
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <button
                  onClick={handleCancelPost}
                  disabled={isSubmittingPost}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePostSubmit}
                  disabled={!postTitle.trim() || !postContent.trim() || isSubmittingPost}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {isSubmittingPost ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      Posting...
                    </>
                  ) : (
                    'Post'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
