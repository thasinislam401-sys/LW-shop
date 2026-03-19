import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Loader2, LogIn } from 'lucide-react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';

const AdminLogin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError('');
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Check if the logged in user is one of the allowed admins
      const allowedAdmins = ['mdemamh587@gmail.com', 'thasinislam401@gmail.com'];
      
      if (user.email && allowedAdmins.includes(user.email)) {
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        setError('Access denied. You are not an authorized admin.');
        await auth.signOut();
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to login with Google');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white p-8 rounded-3xl border border-stone-200 shadow-xl"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 text-white rounded-2xl mb-4">
            <Lock size={32} />
          </div>
          <h1 className="text-3xl font-bold text-stone-900 tracking-tight">Admin Access</h1>
          <p className="text-stone-500 mt-2">Sign in with your authorized Google account</p>
        </div>

        <div className="space-y-6">
          {error && (
            <div className="text-red-500 text-sm font-semibold text-center bg-red-50 py-3 px-4 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <button 
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full bg-white text-stone-900 border-2 border-stone-200 py-4 rounded-2xl font-bold hover:bg-stone-50 transition-all flex items-center justify-center space-x-3 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <>
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                <span>SIGN IN WITH GOOGLE</span>
              </>
            )}
          </button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-stone-400 font-bold tracking-widest">Authorized Access Only</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
