import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const avatar = data.avatar?.[0];
      if (!avatar) {
        toast.error('Avatar is required');
        return;
      }

      await registerUser(
        data.fullName,
        data.email,
        data.username,
        data.password,
        avatar
      );
      toast.success('Registered successfully! Redirecting to home...');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto' }}>
      <h1>Register</h1>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <form onSubmit={handleSubmit(onSubmit)}>
        <div style={{ marginBottom: '15px' }}>
          <label>Full Name:</label>
          <input
            {...register('fullName', { required: 'Full name is required' })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.fullName && <p style={{ color: 'red' }}>{errors.fullName.message}</p>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Email:</label>
          <input
            {...register('email', { required: 'Email is required' })}
            type="email"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.email && <p style={{ color: 'red' }}>{errors.email.message}</p>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Username:</label>
          <input
            {...register('username', { required: 'Username is required' })}
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.username && <p style={{ color: 'red' }}>{errors.username.message}</p>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Password:</label>
          <input
            {...register('password', { required: 'Password is required' })}
            type="password"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.password && <p style={{ color: 'red' }}>{errors.password.message}</p>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>Avatar (Image):</label>
          <input
            {...register('avatar', { required: 'Avatar is required' })}
            type="file"
            accept="image/*"
            style={{ width: '100%', padding: '8px', marginTop: '5px' }}
          />
          {errors.avatar && <p style={{ color: 'red' }}>{errors.avatar.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: isLoading ? '#ccc' : '#28a745',
            color: 'white',
            border: 'none',
            cursor: isLoading ? 'not-allowed' : 'pointer',
          }}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>

      <p style={{ marginTop: '15px', textAlign: 'center' }}>
        Already have an account?{' '}
        <a href="/login" style={{ color: '#007bff', cursor: 'pointer' }}>
          Login here
        </a>
      </p>
    </div>
  );
}
