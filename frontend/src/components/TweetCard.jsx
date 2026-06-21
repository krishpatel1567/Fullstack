import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { likeService } from '../api/likeService';
import { Card, CardContent } from './ui/Card';
import { Avatar } from './ui/Avatar';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';
import toast from 'react-hot-toast';

export default function TweetCard({ tweet, onDelete, onUpdate }) {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [isLiked, setIsLiked] = useState(tweet.isLiked || false);
  const [likeCount, setLikeCount] = useState(tweet.likeCount || 0);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(tweet.content);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      await onUpdate(tweet._id, editedContent);
      setIsEditing(false);
      toast.success('Tweet updated');
    } catch (err) {
      toast.error('Failed to update tweet');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isNewlyCreated = typeof tweet.owner === 'string';
  const ownerObj = isNewlyCreated ? user : tweet.owner;
  const isOwner = user?._id === (isNewlyCreated ? tweet.owner : tweet.owner?._id);

  const navigateToProfile = () => {
    if (ownerObj?._id) {
      navigate(`/profile/${ownerObj._id}`);
    }
  };

  return (
    <Card className="hover:bg-surface-hover transition-colors group">
      <CardContent className="p-5 flex items-start space-x-4">
        
        <div onClick={navigateToProfile} className="cursor-pointer flex-shrink-0">
          <Avatar src={ownerObj?.avatar} alt={ownerObj?.username} fallback={ownerObj?.username?.[0]?.toUpperCase()} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2 truncate">
              <p 
                onClick={navigateToProfile}
                className="font-semibold text-sm text-foreground cursor-pointer hover:underline truncate"
              >
                {ownerObj?.fullName || ownerObj?.username}
              </p>
              <p className="text-sm text-foreground-muted truncate hidden sm:block">
                @{ownerObj?.username}
              </p>
              <span className="text-foreground-muted hidden sm:block">•</span>
              <p className="text-xs text-foreground-muted whitespace-nowrap">
                {new Date(tweet.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              </p>
            </div>
            
            {isOwner && (
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-foreground-muted hover:text-foreground transition-colors p-1"
                  title="Edit Tweet"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                </button>
                <button
                  onClick={() => onDelete(tweet._id)}
                  className="text-foreground-muted hover:text-destructive transition-colors p-1"
                  title="Delete Tweet"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
              </div>
            )}
          </div>

          {isEditing ? (
            <div className="mt-2 pr-4">
              <Textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full text-foreground bg-background"
                rows="3"
                autoFocus
              />
              <div className="flex space-x-2 mt-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedContent(tweet.content);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleUpdate}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed mt-1">
              {tweet.content}
            </p>
          )}

          <div className="flex items-center space-x-6 mt-4">
            <button
              onClick={handleLike}
              className={`flex items-center space-x-2 text-sm transition-colors group/like ${
                isLiked ? 'text-destructive' : 'text-foreground-muted hover:text-destructive'
              }`}
            >
              <div className={`p-1.5 rounded-full transition-colors ${isLiked ? 'bg-destructive/10' : 'group-hover/like:bg-destructive/10'}`}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill={isLiked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
              </div>
              <span className="font-medium">{likeCount}</span>
            </button>

            
            <button className="flex items-center space-x-2 text-sm text-foreground-muted hover:text-primary transition-colors group/share">
              <div className="p-1.5 rounded-full transition-colors group-hover/share:bg-primary/10">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
              </div>
            </button>
          </div>
        </div>
        
      </CardContent>
    </Card>
  );
}