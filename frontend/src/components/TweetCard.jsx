import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useTweetStore } from '../store/tweetStore';
import { likeService } from '../api/likeService';
import toast from 'react-hot-toast';

export default function TweetCard({ tweet, onDelete, onUpdate }) {
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [likeCount, setLikeCount] = useState(tweet.likeCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(tweet.content);

  const handleLike = async () => {
    try {
      await likeService.toggleTweetLike(tweet._id);
      setIsLiked(!isLiked);
      setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    } catch (err) {
      toast.error('Failed to like tweet');
    }
  };

  const handleUpdate = async () => {
    if (!editedContent.trim()) return;
    try {
      await onUpdate(tweet._id, editedContent);
      setIsEditing(false);
      toast.success('Tweet updated');
    } catch (err) {
      toast.error('Failed to update tweet');
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-md border border-gray-200 hover:shadow-lg transition-shadow hover:border-blue-200">
      <div className="flex items-start space-x-3">
        <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center flex-shrink-0">
          {tweet.owner?.avatar ? (
            <img src={tweet.owner.avatar} alt={tweet.owner.username} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span>{tweet.owner?.username?.[0]?.toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold text-gray-800">{tweet.owner?.username}</p>
              <p className="text-xs text-gray-500">{new Date(tweet.createdAt).toLocaleString()}</p>
            </div>
            {user?._id === tweet.owner?._id && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  ✏️
                </button>
                <button
                  onClick={() => onDelete(tweet._id)}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  🗑️
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2">
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:border-blue-500"
                rows="3"
              />
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={handleUpdate}
                  className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(tweet.content);
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-700 mt-2">{tweet.content}</p>
          )}

          <div className="flex items-center space-x-4 mt-3 pt-3 border-t border-gray-100">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1 transition-colors ${
                isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
              }`}
            >
              <span className="text-lg">{isLiked ? '❤️' : '🤍'}</span>
              <span className="text-xs">{likeCount}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
              <span className="text-lg">💬</span>
              <span className="text-xs">{tweet.commentCount || 0}</span>
            </button>
            <button className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors">
              <span className="text-lg">🔄</span>
              <span className="text-xs">{tweet.shareCount || 0}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
