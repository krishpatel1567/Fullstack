import React, { useRef, useState, useEffect } from 'react';

export default function VideoPlayer({ videoUrl, title }) {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const progressTrackRef = useRef(null);
  const progressFillRef = useRef(null);
  const thumbRef = useRef(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState('0:00');
  const [duration, setDuration] = useState(0);
  const [isEnded, setIsEnded] = useState(false);
  
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [prevVolume, setPrevVolume] = useState(1);

  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const [showControls, setShowControls] = useState(true);
  const [centerIcon, setCenterIcon] = useState({ type: '', visible: false });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let animationFrameId;

    const updateScrubber = () => {
      const video = videoRef.current;
      const fill = progressFillRef.current;
      const thumb = thumbRef.current;

      if (video && fill && thumb && video.duration) {
        const percentage = (video.currentTime / video.duration) * 100;
        
        fill.style.width = `${percentage}%`;
        thumb.style.left = `${percentage}%`;
        
        setCurrentTimeDisplay(formatTime(video.currentTime));
      }
      animationFrameId = requestAnimationFrame(updateScrubber);
    };

    animationFrameId = requestAnimationFrame(updateScrubber);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  let controlsTimeout = null;

  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeout) clearTimeout(controlsTimeout);
    if (isPlaying) {
      controlsTimeout = setTimeout(() => {
        setShowControls(false);
        setShowSpeedMenu(false);
      }, 2500);
    }
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeout) clearTimeout(controlsTimeout);
    };
  }, [isPlaying]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const triggerCenterIcon = (type) => {
    setCenterIcon({ type, visible: true });
    setTimeout(() => {
      setCenterIcon(prev => ({ ...prev, visible: false }));
    }, 400);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isEnded) {
        handleReplay();
      } else {
        if (isPlaying) {
          videoRef.current.pause();
          triggerCenterIcon('pause');
        } else {
          videoRef.current.play();
          triggerCenterIcon('play');
        }
        setIsPlaying(!isPlaying);
      }
    }
    resetControlsTimeout();
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleTimelineClick = (e) => {
    if (!videoRef.current || !progressTrackRef.current) return;

    const rect = progressTrackRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    
    const newTime = percentage * videoRef.current.duration;
    videoRef.current.currentTime = newTime;

    if (isEnded) setIsEnded(false);

    if (progressFillRef.current && thumbRef.current) {
      progressFillRef.current.style.transition = 'width 0.1s linear';
      thumbRef.current.style.transition = 'left 0.1s linear';
      setTimeout(() => {
        if (progressFillRef.current && thumbRef.current) {
          progressFillRef.current.style.transition = 'none';
          thumbRef.current.style.transition = 'none';
        }
      }, 100);
    }
    resetControlsTimeout();
  };

  const formatTime = (time) => {
    if (!time || isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (containerRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        containerRef.current.requestFullscreen();
      }
    }
  };

  const handleEnded = () => {
    setIsEnded(true);
    setIsPlaying(false);
    setShowControls(true);
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
      setIsEnded(false);
      triggerCenterIcon('play');
    }
    resetControlsTimeout();
  };

  const seek = (seconds) => {
    if (videoRef.current) {
      videoRef.current.currentTime = Math.max(0, Math.min(duration, videoRef.current.currentTime + seconds));
      triggerCenterIcon(seconds > 0 ? 'forward' : 'rewind');
    }
    resetControlsTimeout();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') {
        return;
      }
      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'm':
          toggleMute();
          break;
        case 'f':
          toggleFullscreen();
          break;
        case 'arrowleft':
          e.preventDefault();
          seek(-5);
          break;
        case 'arrowright':
          e.preventDefault();
          seek(5);
          break;
        case 'arrowup':
          e.preventDefault();
          adjustVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          adjustVolume(-0.1);
          break;
        default:
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlaying, isMuted, volume, isEnded, duration]);

  const toggleMute = () => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = prevVolume;
        setVolume(prevVolume);
        setIsMuted(false);
        triggerCenterIcon('volume-up');
      } else {
        setPrevVolume(volume);
        videoRef.current.volume = 0;
        setVolume(0);
        setIsMuted(true);
        triggerCenterIcon('volume-mute');
      }
    }
    resetControlsTimeout();
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (videoRef.current) {
      videoRef.current.volume = val;
      videoRef.current.muted = val === 0;
    }
    resetControlsTimeout();
  };

  const adjustVolume = (amount) => {
    const newVol = Math.max(0, Math.min(1, volume + amount));
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
    }
    triggerCenterIcon(newVol === 0 ? 'volume-mute' : 'volume-up');
    resetControlsTimeout();
  };

  const handleVideoClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const width = rect.width;

    if (e.detail === 2) {
      if (x < width * 0.4) {
        seek(-10);
      } else if (x > width * 0.6) {
        seek(10);
      } else {
        toggleFullscreen();
      }
    } else if (e.detail === 1) {
      setTimeout(() => {
        if (e.detail === 1) togglePlay();
      }, 200);
    }
  };

  const changeSpeed = (speed) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    setShowSpeedMenu(false);
    resetControlsTimeout();
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => {
        if (isPlaying) {
          setShowControls(false);
          setShowSpeedMenu(false);
        }
      }}
      className={`w-full bg-black relative group font-sans select-none overflow-hidden ${isFullscreen ? '' : 'rounded-lg border border-neutral-200 dark:border-neutral-800'} ${showControls ? '' : 'cursor-none'}`}
      style={{ zIndex: isFullscreen ? 9999 : 'auto' }}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        className="w-full aspect-video cursor-pointer block bg-black"
        onClick={handleVideoClick}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        playsInline
      />

      {/* Center Action Indicators */}
      {centerIcon.visible && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center text-white text-xl shadow-sm">
            {centerIcon.type === 'play' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
            )}
            {centerIcon.type === 'pause' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            )}
            {centerIcon.type === 'forward' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>
            )}
            {centerIcon.type === 'rewind' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>
            )}
            {centerIcon.type === 'volume-up' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
            )}
            {centerIcon.type === 'volume-mute' && (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
            )}
          </div>
        </div>
      )}

      {/* Replay Overlay */}
      {isEnded && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-20 backdrop-blur-sm">
          <button
            onClick={handleReplay}
            className="w-16 h-16 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform duration-200"
            title="Replay Video"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/></svg>
          </button>
        </div>
      )}

      {/* Control Bar Overlay */}
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300 z-30 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Scrubber */}
        <div 
          ref={progressTrackRef}
          onClick={handleTimelineClick}
          className="relative group/scrub mb-4 flex items-center h-4 cursor-pointer"
        >
          <div className="w-full bg-white/30 h-1 rounded-full group-hover/scrub:h-1.5 transition-all duration-150 relative overflow-visible">
            <div 
              ref={progressFillRef}
              className="absolute left-0 top-0 h-full bg-red-600 rounded-full"
              style={{ width: '0%' }}
            />
            <div 
              ref={thumbRef}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full scale-0 group-hover/scrub:scale-100 transition-transform duration-150 pointer-events-none"
              style={{ left: '0%' }}
            />
          </div>
        </div>

        {/* Lower Toolbar */}
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center space-x-5">
            <button
              onClick={togglePlay}
              className="hover:opacity-80 transition-opacity flex items-center justify-center"
              title={isPlaying ? 'Pause (space)' : 'Play (space)'}
            >
              {isPlaying ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              )}
            </button>

            <div className="flex items-center space-x-2 group/volume relative">
              <button
                onClick={toggleMute}
                className="hover:opacity-80 transition-opacity flex items-center justify-center"
                title="Mute (m)"
              >
                {isMuted ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                ) : volume < 0.5 ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-0 overflow-hidden group-hover/volume:w-16 focus:w-16 transition-all duration-300 cursor-pointer h-1 rounded appearance-none bg-white/30 accent-white"
              />
            </div>

            <div className="text-xs font-mono font-medium tracking-wide text-neutral-300 select-none">
              <span>{currentTimeDisplay}</span>
              <span className="mx-1 text-neutral-500">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="text-xs font-medium px-2 py-1 rounded bg-white/10 hover:bg-white/20 transition-colors"
                title="Playback Speed"
              >
                {playbackSpeed === 1 ? '1x' : `${playbackSpeed}x`}
              </button>
              {showSpeedMenu && (
                <div className="absolute bottom-10 right-0 w-24 bg-neutral-900 border border-neutral-800 rounded shadow-2xl py-1 text-xs text-neutral-200 z-40">
                  {[0.5, 1, 1.25, 1.5, 2].map((speed) => (
                    <button
                      key={speed}
                      onClick={() => changeSpeed(speed)}
                      className={`w-full text-left px-3 py-2 hover:bg-neutral-800 transition-colors ${
                        playbackSpeed === speed ? 'text-white font-medium bg-neutral-800' : ''
                      }`}
                    >
                      {speed === 1 ? 'Normal' : `${speed}x`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={toggleFullscreen}
              className="hover:opacity-80 transition-opacity flex items-center justify-center"
              title="Fullscreen (f)"
            >
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"/></svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}