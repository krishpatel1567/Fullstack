import React, { useRef, useState } from 'react';

export default function VideoPlayer({ videoUrl, title }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100 || 0);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleProgressChange = (e) => {
    const newTime = (e.target.value / 100) * duration;
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time) => {
    if (!time) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.parentElement.requestFullscreen();
      }
    }
  };

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden group">
      <div className="relative bg-black">
        <video
          ref={videoRef}
          src={videoUrl}
          className="w-full aspect-video"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
        />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-30">
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 flex items-center justify-center transition-all transform hover:scale-110"
          >
            <span className="text-3xl">{isPlaying ? '⏸️' : '▶️'}</span>
          </button>
        </div>

        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            className="w-full cursor-pointer h-1 bg-gray-600 rounded appearance-none accent-red-600"
          />
          <div className="flex items-center justify-between mt-2 text-white text-sm">
            <span>
              {formatTime(videoRef.current?.currentTime || 0)} / {formatTime(duration)}
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={togglePlay}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                {isPlaying ? '⏸️' : '▶️'}
              </button>
              <button
                onClick={toggleFullscreen}
                className="hover:bg-white hover:bg-opacity-20 p-1 rounded transition-colors"
              >
                🖥️
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
