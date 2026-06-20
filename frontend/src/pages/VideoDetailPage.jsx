import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useVideoStore } from '../store/videoStore';
import { commentService } from '../api/commentService';
import { likeService } from '../api/likeService';
import { subscriptionService } from '../api/subscriptionService';
import VideoPlayer from '../components/VideoPlayer';
import LoadingSpinner from '../components/LoadingSpinner';
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
  const [viewCount, setViewCount] = useState(0);

  useEffect(() => {
    fetchVideoById(videoId);
  }, [videoId, fetchVideoById]);

  useEffect(() => {
    if (currentVideo) {
      setLikeCount(currentVideo.likeCount || 0);
      setViewCount(currentVideo.views || 0);
      loadComments();
    }
  }, [currentVideo]);

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
      toast.success('Comment added!');
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
      toast.success(isSubscribed ? 'Unsubscribed' : 'Subscribed!');
    } catch (err) {
      toast.error('Failed to toggle subscription');
    }
  };

  if (isLoading) return <LoadingSpinner />;
  if (!currentVideo) return <div className="text-center py-12">Video not found</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <VideoPlayer videoUrl={currentVideo.videoFile} title={currentVideo.title} />

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{currentVideo.title}</h1>

          <div className="flex items-center justify-between mt-4 pb-4 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors">
                {currentVideo.owner?.avatar ? (
                  <img src={currentVideo.owner.avatar} alt={currentVideo.owner.username} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{currentVideo.owner?.username?.[0]?.toUpperCase()}</span>
                )}
              </div>
              <div>
                <p
                  className="font-semibold text-gray-800 cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`/profile/${currentVideo.owner._id}`)}
                >
                  {currentVideo.owner?.username}
                </p>
                <p className="text-sm text-gray-500">2.4M subscribers</p>
              </div>
              <button
                onClick={handleSubscribe}
                className={`px-6 py-2 rounded-lg font-semibold transition-colors ml-4 ${
                  isSubscribed
                    ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isSubscribed ? '✓ Subscribed' : '+ Subscribe'}
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleLike}
                className={`px-4 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${
                  isLiked
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                }`}
              >
                <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
                <span>{likeCount}</span>
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                🔗 Share
              </button>
            </div>
          </div>

          <div className="mt-4">
            <p className="text-gray-600">{viewCount} views</p>
            <p className="text-gray-700 mt-4">{currentVideo.description}</p>
          </div>
        </div>

        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">💬 Comments ({comments.length})</h2>

          {user && (
            <div className="mb-6 pb-6 border-b border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.username} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <span>{user.username?.[0]?.toUpperCase()}</span>
                  )}
                </div>
                <div className="flex-1">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  />
                  <button
                    onClick={handleAddComment}
                    disabled={isCommentLoading || !newComment.trim()}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-semibold"
                  >
                    {isCommentLoading ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="pb-4 border-b border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
                    {comment.owner?.avatar ? (
                      <img src={comment.owner.avatar} alt={comment.owner.username} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{comment.owner?.username?.[0]?.toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{comment.owner?.username}</p>
                    <p className="text-gray-700">{comment.content}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(comment.createdAt).toLocaleDateString()}</p>
                    {user?._id === comment.owner?._id && (
                      <button
                        onClick={() => handleDeleteComment(comment._id)}
                        className="text-xs text-red-600 hover:text-red-700 mt-2"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
