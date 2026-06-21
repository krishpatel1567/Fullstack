import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useVideoStore } from '../store/videoStore';
import { commentService } from '../api/commentService';
import { likeService } from '../api/likeService';
import { subscriptionService } from '../api/subscriptionService';
import VideoPlayer from '../components/VideoPlayer';
import {LoadingSpinner} from '../components/LoadingSpinner';
import toast from 'react-hot-toast';

export default function VideoDetailPage() {
  const { videoId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentVideo, isLoading, fetchVideoById } = useVideoStore();
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [isCommentLoading, setIsCommentLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscribers, setSubscribers] = useState(0);
  const [viewCount, setViewCount] = useState(0);
  
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (videoId && !fetchedRef.current) {
      fetchedRef.current = true;
      fetchVideoById(videoId);
    }
  }, [videoId, fetchVideoById]);

  useEffect(() => {
    if (currentVideo) {
      setLikeCount(currentVideo.likeCount || 0);
      setViewCount(currentVideo.views || 0);
      loadComments();
      loadSubscribers();
    }
  }, [currentVideo]);

  const loadSubscribers = async () => {
    if (!currentVideo?.owner?._id) return;
    try {
      const data = await subscriptionService.getChannelSubscribers(currentVideo.owner._id);
      setSubscribers(data?.length || 0);
      if (user) {
        const subscribed = data.some(sub => sub.subscriber === user._id || sub.subscriber?._id === user._id);
        setIsSubscribed(subscribed);
      }
    } catch (err) {
      console.error('Failed to load subscribers');
    }
  };

  const loadComments = async () => {
    try {
      const data = await commentService.getVideoComments(videoId);
      setComments(data || []);
    } catch (err) {
      console.error('Failed to load comments');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setIsCommentLoading(true);
    try {
      await commentService.addComment(videoId, newComment);
      setNewComment('');
      loadComments();
      toast.success('Comment added');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setIsCommentLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await commentService.deleteComment(commentId);
      loadComments();
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const handleLike = async () => {
    try {
      await likeService.toggleVideoLike(videoId);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (err) {
      toast.error('Failed to like video');
    }
  };

  const handleSubscribe = async () => {
    try {
      await subscriptionService.toggleSubscription(currentVideo.owner._id);
      setIsSubscribed(!isSubscribed);
      setSubscribers(isSubscribed ? subscribers - 1 : subscribers + 1);
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed');
    } catch (err) {
      toast.error('Failed to toggle subscription');
    }
  };

  if (isLoading && !currentVideo) return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  if (!currentVideo) return <div className="text-center py-12 text-neutral-500 font-medium">Video not found</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-black py-6 font-sans">
      <div className="max-w-[1200px] mx-auto px-4 md:px-6">
        
        {/* Video Player Section */}
        <div className="w-full">
          <VideoPlayer videoUrl={currentVideo.videoFile} title={currentVideo.title} />
        </div>

        {/* Details Section */}
        <div className="mt-6">
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">{currentVideo.title}</h1>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mt-4 pb-6 border-b border-neutral-200 dark:border-neutral-800 gap-4 sm:gap-0">
            
            {/* Owner Info */}
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity border border-neutral-200 dark:border-neutral-800 overflow-hidden"
                onClick={() => navigate(`/profile/${currentVideo.owner._id}`)}
              >
                {currentVideo.owner?.avatar ? (
                  <img src={currentVideo.owner.avatar} alt={currentVideo.owner.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-medium">{currentVideo.owner?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <p
                  className="font-semibold text-neutral-900 dark:text-neutral-100 text-sm cursor-pointer hover:underline"
                  onClick={() => navigate(`/profile/${currentVideo.owner._id}`)}
                >
                  {currentVideo.owner?.username}
                </p>
                <p className="text-xs text-neutral-500">{subscribers} subscribers</p>
              </div>
              
              <button
                onClick={handleSubscribe}
                className={`ml-3 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  isSubscribed
                    ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800'
                    : 'bg-black dark:bg-white text-white dark:text-black border-black dark:border-white hover:bg-neutral-800 dark:hover:bg-neutral-200'
                }`}
              >
                {isSubscribed ? 'Subscribed' : 'Subscribe'}
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <button
                onClick={handleLike}
                className={`flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
                  isLiked
                    ? 'bg-neutral-100 dark:bg-neutral-900 border-neutral-300 dark:border-neutral-700 text-neutral-900 dark:text-neutral-100'
                    : 'bg-transparent border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                <span>{likeCount}</span>
              </button>
              
              <button className="flex-1 sm:flex-none flex items-center justify-center space-x-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all bg-transparent border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-900">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
                <span>Share</span>
              </button>
            </div>
          </div>

          <div className="mt-4 bg-neutral-50 dark:bg-neutral-900/50 rounded-xl p-4 border border-neutral-100 dark:border-neutral-800/50">
            <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100">{viewCount} views</p>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 whitespace-pre-wrap">{currentVideo.description}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div className="mt-10">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-neutral-100 mb-6">{comments.length} Comments</h2>

          {user && (
            <div className="mb-8 flex items-start space-x-4">
              <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 border border-neutral-200 dark:border-neutral-800 overflow-hidden text-neutral-500">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs font-medium">{user.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="w-full p-0 py-1 bg-transparent border-0 border-b border-neutral-300 dark:border-neutral-700 focus:ring-0 focus:border-black dark:focus:border-white text-sm text-neutral-900 dark:text-neutral-100 resize-none transition-colors placeholder:text-neutral-400 dark:placeholder:text-neutral-600 outline-none"
                  rows="1"
                  style={{ minHeight: '32px' }}
                />
                <div className="flex justify-end mt-2">
                  <button
                    onClick={handleAddComment}
                    disabled={isCommentLoading || !newComment.trim()}
                    className="px-4 py-1.5 bg-black dark:bg-white text-white dark:text-black rounded-full text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-30"
                  >
                    {isCommentLoading ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment._id} className="flex items-start space-x-3 group">
                <div className="w-9 h-9 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center flex-shrink-0 border border-neutral-200 dark:border-neutral-800 overflow-hidden text-neutral-500">
                  {comment.owner?.avatar ? (
                    <img src={comment.owner.avatar} alt={comment.owner.username} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-medium">{comment.owner?.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-baseline space-x-2">
                    <p className="font-semibold text-sm text-neutral-900 dark:text-neutral-100">{comment.owner?.username}</p>
                    <p className="text-[11px] text-neutral-500">{new Date(comment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <p className="text-sm text-neutral-800 dark:text-neutral-200 mt-1">{comment.content}</p>
                  
                  {user?._id === comment.owner?._id && (
                    <button
                      onClick={() => handleDeleteComment(comment._id)}
                      className="text-[11px] text-neutral-400 hover:text-red-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity font-medium"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
            
            {comments.length === 0 && (
              <p className="text-sm text-neutral-500 text-center py-8">No comments yet. Be the first to start the conversation.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
