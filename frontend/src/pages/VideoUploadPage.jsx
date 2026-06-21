import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useVideoStore } from '../store/videoStore';
import { PageLayout, Container, SectionHeader } from '../components/ui/Layout';
import { Card, CardContent } from '../components/ui/Card';
import { Input, Textarea } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
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
    <PageLayout>
      <Container className="max-w-2xl">
        <SectionHeader 
          title="Upload Video" 
          description="Share your amazing video with the world" 
        />
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="border-2 border-dashed border-border rounded-xl p-8 text-center hover:border-primary hover:bg-surface-hover transition-colors cursor-pointer group">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoChange}
                    className="hidden"
                  />
                  <div className="text-4xl mb-2 text-foreground-muted group-hover:text-foreground transition-colors">🎥</div>
                  <p className="text-foreground font-medium">Choose video file</p>
                  <p className="text-sm text-foreground-muted mt-1">or drag and drop</p>
                </label>
                {videoFile && (
                  <div className="mt-4 p-3 bg-background rounded-lg border border-border">
                    <p className="text-sm text-foreground font-medium truncate">✅ {videoFile.name}</p>
                    <p className="text-xs text-foreground-muted">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                )}
              </div>

              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary hover:bg-surface-hover transition-colors cursor-pointer group">
                <label className="cursor-pointer block">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="hidden"
                  />
                  <div className="text-3xl mb-2 text-foreground-muted group-hover:text-foreground transition-colors">🖼️</div>
                  <p className="text-foreground font-medium">Choose thumbnail</p>
                </label>
                {thumbnailPreview && (
                  <img src={thumbnailPreview} alt="Thumbnail" className="mt-4 h-24 mx-auto rounded-lg object-cover" />
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Title *</label>
                  <Input
                    {...register('title')}
                    placeholder="My Awesome Video"
                  />
                  {errors.title && <p className="text-destructive text-xs mt-1.5">{errors.title.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
                  <Textarea
                    {...register('description')}
                    placeholder="Tell us about your video..."
                    rows="4"
                  />
                </div>
              </div>

              {videoProgress > 0 && (
                <div className="bg-background-secondary rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-primary h-full transition-all duration-300"
                    style={{ width: `${videoProgress}%` }}
                  ></div>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading || !videoFile}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Uploading...' : 'Upload Video'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </Container>
    </PageLayout>
  );
}
