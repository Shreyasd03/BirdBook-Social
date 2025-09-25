import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import axios from "axios";
import { hasAuthToken, verifyToken, clearAuth, getAuthHeaders, getCurrentUser } from "../api/auth/auth-client";

// ===== TYPESCRIPT INTERFACES =====
interface UserPost {
  id: number;
  title: string;
  content: string;
  createdAt: string;
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

interface UserProfile {
  id: number;
  username: string;
  email: string;
  bio: string | null;
  createdAt: string;
  posts: UserPost[];
}

/**
 * ProfilePage Component
 * 
 * A dynamic profile page that displays user information in a card format
 * and shows their posts in chronological order (most recent first).
 * Features the same navigation menu as the feed page.
 */
export default function ProfilePage() {
  // ===== STATE MANAGEMENT =====
  const router = useRouter();
  const { id } = router.query;
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [editedBio, setEditedBio] = useState('');
  const [isUpdatingBio, setIsUpdatingBio] = useState(false);
  const [deletingPostId, setDeletingPostId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);
  const [commentText, setCommentText] = useState<{ [postId: number]: string }>({});
  const [isSubmittingComment, setIsSubmittingComment] = useState<{ [postId: number]: boolean }>({});
  const [deletingCommentId, setDeletingCommentId] = useState<number | null>(null);

  // ===== API FUNCTIONS =====
  /**
   * Fetches user profile data and their posts
   */
  const fetchUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get<UserProfile>(`/api/users/${userId}`, getAuthHeaders());
      setUserProfile(response.data);
      
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      if (err.response?.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load profile. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Updates the user's bio
   */
  const updateBio = async () => {
    try {
      setIsUpdatingBio(true);
      
      const response = await axios.put('/api/users/update-bio', 
        { bio: editedBio }, 
        getAuthHeaders()
      );
      
      // Update the local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          bio: editedBio
        });
      }
      
      // Update current user in localStorage
      const updatedUser = { ...currentUser, bio: editedBio };
      localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      
      setIsEditingBio(false);
      
    } catch (err: any) {
      console.error('Error updating bio:', err);
      setError('Failed to update bio. Please try again.');
    } finally {
      setIsUpdatingBio(false);
    }
  };

  /**
   * Deletes a post
   */
  const deletePost = async (postId: number) => {
    try {
      setDeletingPostId(postId);
      
      await axios.delete('/api/posts/delete', {
        data: { postId },
        ...getAuthHeaders()
      });
      
      // Remove the post from local state
      if (userProfile) {
        setUserProfile({
          ...userProfile,
          posts: userProfile.posts.filter(post => post.id !== postId)
        });
      }
      
      setShowDeleteConfirm(null);
      
    } catch (err: any) {
      console.error('Error deleting post:', err);
      setError(err.response?.data?.error || 'Failed to delete post. Please try again.');
    } finally {
      setDeletingPostId(null);
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

      // Update the user profile with the new comment (add to beginning for newest first)
      if (userProfile) {
        setUserProfile(prevProfile => ({
          ...prevProfile!,
          posts: prevProfile!.posts.map(post => 
            post.id === postId 
              ? { ...post, comments: [response.data.comment, ...post.comments] }
              : post
          )
        }));
      }
      
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
      
      // Remove the comment from the user profile
      if (userProfile) {
        setUserProfile(prevProfile => ({
          ...prevProfile!,
          posts: prevProfile!.posts.map(post => 
            post.id === postId 
              ? { ...post, comments: post.comments.filter(comment => comment.id !== commentId) }
              : post
          )
        }));
      }
      
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
      if (isAuth && id) {
        fetchUserProfile(id as string);
      }
    });
  }, [id]);

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

  const handleFeedClick = () => {
    router.push("/feed");
  };

  const toggleComments = (postId: number) => {
    setExpandedComments(expandedComments === postId ? null : postId);
  };

  const handleUserProfileClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  const handleEditBio = () => {
    if (userProfile) {
      setEditedBio(userProfile.bio || '');
      setIsEditingBio(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditingBio(false);
    setEditedBio('');
  };

  const handleSaveBio = () => {
    updateBio();
  };

  const handleDeletePost = (postId: number) => {
    setShowDeleteConfirm(postId);
  };

  const handleConfirmDelete = (postId: number) => {
    deletePost(postId);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
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

  /**
   * Formats a date to show month and year (e.g., "June 2020")
   */
  const formatJoinDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
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
              <button 
                onClick={handleFeedClick}
                className="text-white font-medium hover:text-purple-200 transition-colors"
              >
                Feed
              </button>
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
        {/* ===== LOADING STATE ===== */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="loading loading-spinner loading-lg text-white"></div>
            <span className="ml-4 text-white text-lg">Loading profile...</span>
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
              onClick={() => id && fetchUserProfile(id as string)}
              className="btn btn-sm btn-outline"
            >
              Retry
            </button>
          </div>
        )}

        {/* ===== USER PROFILE CARD ===== */}
        {!loading && userProfile && (
          <div className="mb-8">
            <div className="card bg-white shadow-xl rounded-2xl">
              <div className="card-body p-8">
                <div className="flex items-start space-x-6">
                  {/* Profile Picture */}
                  <div className="avatar">
                    <div className="w-24 h-24 rounded-full ring ring-gray-200 ring-offset-base-100 ring-offset-2">
                      <Image
                        src="/Placeholder logo.png"
                        alt={userProfile.username}
                        width={96}
                        height={96}
                        className="rounded-full object-cover"
                      />
                    </div>
                  </div>

                  {/* User Information */}
                  <div className="flex-1">
                    {/* Username */}
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                      {userProfile.username}
                    </h1>
                    
                    {/* Bio */}
                    <div className="mb-3">
                      {isEditingBio ? (
                        <div className="space-y-3">
                          <textarea
                            value={editedBio}
                            onChange={(e) => setEditedBio(e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            rows={3}
                            maxLength={500}
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                              {editedBio.length}/500 characters
                            </span>
                            <div className="flex space-x-2">
                              <button
                                onClick={handleCancelEdit}
                                disabled={isUpdatingBio}
                                className="btn btn-sm btn-outline"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveBio}
                                disabled={isUpdatingBio}
                                className="btn btn-sm btn-primary"
                              >
                                {isUpdatingBio ? (
                                  <>
                                    <span className="loading loading-spinner loading-xs"></span>
                                    Saving...
                                  </>
                                ) : (
                                  'Save'
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between">
                          <p className="text-lg text-gray-600 flex-1">
                            {userProfile.bio || "No bio available"}
                          </p>
                          {/* Show edit button only if viewing own profile */}
                          {currentUser && currentUser.id === userProfile.id && (
                            <button
                              onClick={handleEditBio}
                              className="ml-4 btn btn-sm btn-outline btn-primary"
                            >
                              Edit Bio
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Join Date */}
                    <div className="flex items-center text-gray-500">
                      <svg 
                        className="w-4 h-4 mr-2" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-sm">
                        Joined {formatJoinDate(userProfile.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ===== USER POSTS SECTION ===== */}
        {!loading && userProfile && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              {userProfile.username}'s Posts
            </h2>
            
            {userProfile.posts.length > 0 ? (
              userProfile.posts.map((post) => (
                <div key={post.id} className="card bg-white shadow-xl rounded-2xl">
                  <div className="card-body p-6">
                    {/* Post Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <div className="avatar">
                          <div className="w-12 h-12 rounded-full ring ring-gray-200 ring-offset-base-100 ring-offset-2">
                            <Image
                              src="/Placeholder logo.png"
                              alt={userProfile.username}
                              width={48}
                              height={48}
                              className="rounded-full object-cover"
                            />
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="font-semibold text-gray-800">{userProfile.username}</h3>
                          <p className="text-sm text-gray-500">{formatTimeAgo(post.createdAt)}</p>
                        </div>
                      </div>
                      
                      {/* Delete Button - Only show for own posts */}
                      {currentUser && currentUser.id === userProfile.id && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          disabled={deletingPostId === post.id}
                          className="text-red-500 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors p-2"
                          title="Delete post"
                        >
                          {deletingPostId === post.id ? (
                            <span className="loading loading-spinner loading-sm"></span>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Post Content */}
                    <div className="mb-4">
                      <h4 className="text-xl font-bold text-gray-800 mb-3">{post.title}</h4>
                      <p className="text-gray-700 leading-relaxed">{post.content}</p>
                    </div>

                    {/* Post Interactions */}
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
              ))
            ) : (
              <div className="text-center py-12">
                <div className="text-white text-xl opacity-70">
                  {userProfile.username} hasn't posted anything yet.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ===== DELETE CONFIRMATION MODAL ===== */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">Delete Post</h3>
                  <p className="text-sm text-gray-500">This action cannot be undone</p>
                </div>
              </div>

              {/* Content */}
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete this post? This will permanently remove the post and all its comments.
              </p>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  disabled={deletingPostId !== null}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleConfirmDelete(showDeleteConfirm)}
                  disabled={deletingPostId !== null}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center"
                >
                  {deletingPostId === showDeleteConfirm ? (
                    <>
                      <span className="loading loading-spinner loading-xs mr-2"></span>
                      Deleting...
                    </>
                  ) : (
                    'Delete Post'
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
