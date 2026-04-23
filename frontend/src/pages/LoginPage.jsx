import { useState, useContext, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import GamingLoginSettings from '../components/ui/gaming-login';
import { AlertCircle } from 'lucide-react';

const LoginPage = () => {
  const [searchParams] = useSearchParams();
  const isSetup = searchParams.get('setup') === 'true';
  const [isLogin, setIsLogin] = useState(!isSetup);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleLoginSubmit = async (email, password, remember) => {
    setError('');
    setIsSubmitting(true);

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
      const res = await axios.post(`http://localhost:5000${endpoint}`, { email, password });
      
      // Artificial delay for the cool animation
      await new Promise(resolve => setTimeout(resolve, 500));
      
      login(res.data.user, res.data.token);
      navigate('/dashboard');
      return true; // Success
    } catch (err) {
      setError(err.response?.data?.msg || 'Authentication failed. Please try again.');
      setIsSubmitting(false);
      return false; // Failed
    }
  };

  return (
    <div className="relative min-h-[85vh] w-full flex flex-col items-center justify-center p-4">
      {/* Background Video layer */}
      <div className="fixed inset-0 z-[-1]">
        <GamingLoginSettings.NativeVideoBackground videoSrc="/f1-background.mp4" />
      </div>

      <div className="relative z-20 w-full max-w-md animate-fadeIn">
         {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/80 backdrop-blur-md border border-red-400 flex items-center gap-2 text-white text-sm shadow-xl absolute -top-16 left-0 w-full z-50">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
        <GamingLoginSettings.LoginForm onSubmit={handleLoginSubmit} isSubmitting={isSubmitting} />
      </div>

      <footer className="absolute bottom-4 left-0 right-0 text-center text-white/50 text-xs tracking-widest z-20 uppercase">
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="hover:text-white transition-colors"
        >
          {isLogin ? 'Switch to Setup Mode' : 'Switch to Login Mode'}
        </button>
        <div className="mt-2 text-[10px]">© 2026 PITWALL FEDERATED telemetry. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LoginPage;
