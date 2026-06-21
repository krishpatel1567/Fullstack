import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../store/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading } = useAuthStore();
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
  });

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      await registerUser(data.fullName, data.email, data.username, data.password, avatarFile);
      toast.success('Account created successfully!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-background p-4 animate-fade-in py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center mb-4">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          </div>
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join MediaHub and start sharing</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex flex-col items-center mb-6">
              <label className="cursor-pointer group relative">
                <div className="w-20 h-20 rounded-full bg-surface-hover flex items-center justify-center overflow-hidden border border-border group-hover:border-primary transition-colors">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Avatar preview" className="w-full h-full object-cover" />
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground-muted group-hover:text-foreground transition-colors"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
              <span className="text-xs text-foreground-muted mt-2">Upload avatar (optional)</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Full Name</label>
              <Input
                {...register('fullName')}
                placeholder="John Doe"
              />
              {errors.fullName && <p className="text-destructive text-xs mt-1.5">{errors.fullName.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Email</label>
              <Input
                type="email"
                {...register('email')}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-destructive text-xs mt-1.5">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Username</label>
              <Input
                {...register('username')}
                placeholder="johndoe"
              />
              {errors.username && <p className="text-destructive text-xs mt-1.5">{errors.username.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Password</label>
              <Input
                type="password"
                {...register('password')}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-destructive text-xs mt-1.5">{errors.password.message}</p>}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6"
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center border-t border-border pt-6">
          <p className="text-sm text-foreground-muted">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-primary font-medium hover:underline transition-colors"
            >
              Log in
            </button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
