import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/video/${video._id}`)}
      className="group cursor-pointer flex flex-col gap-3"
    >
      <div className="relative aspect-video bg-neutral-100 dark:bg-neutral-900 rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800">
        <img
          src={video.thumbnail || 'https://via.placeholder.com/320x180?text=Video'}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <span className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white px-1.5 py-0.5 rounded text-[10px] font-medium tracking-wide">
          {video.duration || '0:00'}
        </span>
      </div>
      
      <div className="flex gap-3 px-1">
        <div 
          onClick={(e) => {
            e.stopPropagation();
            if(video.owner?._id) navigate(`/profile/${video.owner._id}`);
          }}
          className="w-9 h-9 rounded-full bg-neutral-100 dark:bg-neutral-900 flex-shrink-0 overflow-hidden border border-neutral-200 dark:border-neutral-800"
        >
          {video.owner?.avatar ? (
            <img src={video.owner.avatar} alt={video.owner.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-medium text-neutral-500">
              {video.owner?.username?.[0]?.toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <h3 className="font-medium text-sm text-neutral-900 dark:text-neutral-100 line-clamp-2 leading-tight group-hover:text-black dark:group-hover:text-white transition-colors">
            {video.title}
          </h3>
          <p 
            onClick={(e) => {
              e.stopPropagation();
              if(video.owner?._id) navigate(`/profile/${video.owner._id}`);
            }}
            className="text-[13px] text-neutral-500 dark:text-neutral-400 mt-1 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
          >
            {video.owner?.username}
          </p>
          <div className="flex items-center text-[12px] text-neutral-500 dark:text-neutral-500 mt-0.5">
            <span>{video.views || 0} views</span>
            <span className="mx-1.5 text-[8px]">•</span>
            <span>{new Date(video.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
