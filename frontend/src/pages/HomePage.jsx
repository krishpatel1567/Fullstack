import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

export default function HomePage() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out!');
      navigate('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Welcome to Full Stack App</h1>

      {user ? (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2>👤 Logged in as: <strong>{user.username}</strong></h2>
          <p>Email: {user.email}</p>
          <button
            onClick={handleLogout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
          <p>Not logged in</p>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '10px 20px',
              marginRight: '10px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Login
          </button>
          <button
            onClick={() => navigate('/register')}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '4px',
            }}
          >
            Register
          </button>
        </div>
      )}

      <div style={{ marginTop: '30px' }}>
        <h3>📚 Guides</h3>
        <ul>
          <li><strong>QUICK_START.md</strong> - Get this working in 5 minutes</li>
          <li><strong>FULLSTACK_PATTERN.md</strong> - Copy-paste templates for any feature</li>
        </ul>
        <p style={{ color: '#666', fontSize: '14px' }}>
          These files are in the frontend folder. Open them to see the pattern!
        </p>
      </div>

      <div style={{ marginTop: '30px', backgroundColor: '#f0f0f0', padding: '15px', borderRadius: '8px' }}>
        <h3>✨ What's Set Up</h3>
        <ul>
          <li>✅ Login & Register pages with file upload</li>
          <li>✅ Auth store (Zustand) for global state</li>
          <li>✅ API service with Axios</li>
          <li>✅ React Hook Form for validation</li>
          <li>✅ React Router for navigation</li>
          <li>✅ Toast notifications (React Hot Toast)</li>
        </ul>
      </div>
    </div>
  );
}
