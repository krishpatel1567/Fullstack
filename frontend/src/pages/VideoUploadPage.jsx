import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVideoStore } from '../store/videoStore';
import toast from 'react-hot-toast';

const uploadSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

export default function VideoUploadPage() {
  const navigate = useNavigate();
  const { uploadVideo, isLoading } = useVideoStore();
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [videoProgress, setVideoProgress] = useState(0);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(uploadSchema),
  });

  const handleVideoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoProgress(30);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setThumbnailPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    if (!videoFile) {
      toast.error('Please select a video file');
      return;
    }

    try {
      setVideoProgress(50);
      await uploadVideo(videoFile, thumbnailFile, data.title, data.description);
      setVideoProgress(100);
      toast.success('Video uploaded successfully!');
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
      setVideoProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📤 Upload Video</h1>
          <p className="text-gray-600 mb-8">Share your amazing video with the world</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer group">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
                <div className="group-hover:scale-110 transition-transform">
                  <div className="text-4xl mb-2">🎥</div>
                  <p className="text-gray-700 font-semibold">Choose video file</p>
                  <p className="text-sm text-gray-500 mt-1">or drag and drop</p>
                </div>
              </label>
              {videoFile && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-gray-700">✅ {videoFile.name}</p>
                  <p className="text-xs text-gray-600">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              )}
            </div>

            <div className="border-2 border-dashed border-green-300 rounded-lg p-6 text-center hover:border-green-500 transition-colors cursor-pointer group">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <div className="group-hover:scale-110 transition-transform">
                  <div className="text-3xl mb-2">🖼️</div>
                  <p className="text-gray-700 font-semibold">Choose thumbnail</p>
                </div>
              </label>
              {thumbnailPreview && (
                <img src={thumbnailPreview} alt="Thumbnail" className="mt-4 h-24 mx-auto rounded-lg" />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                {...register('title')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="My Awesome Video"
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                {...register('description')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                placeholder="Tell us about your video..."
                rows="4"
              />
            </div>

            {videoProgress > 0 && (
              <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-300"
                  style={{ width: `${videoProgress}%` }}
                ></div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !videoFile}
              className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-transform"
            >
              {isLoading ? '⏳ Uploading...' : '🚀 Upload Video'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
