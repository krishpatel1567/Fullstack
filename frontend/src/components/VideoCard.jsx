import { useNavigate } from 'react-router-dom';
import React from 'react';

export default function VideoCard({ video }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/video/${video._id}`)}
      className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
    >
      <div className="relative h-40 bg-gray-200 overflow-hidden">
        <img
          src={video.thumbnail || 'https://via.placeholder.com/320x180?text=Video'}
          alt={video.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300 flex items-center justify-center">
          <div className="text-white text-3xl">▶️</div>
        </div>
        <span className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded text-xs">
          {video.duration || '0:00'}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600 mt-1">{video.owner?.username}</p>
        <p className="text-xs text-gray-500 mt-2">
          {video.views || 0} views • {new Date(video.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
