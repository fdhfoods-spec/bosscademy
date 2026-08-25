import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, CheckCircle2, Mail } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (IS_MOCK_SUPABASE) {
      const searchParams = new URLSearchParams(location.search);
      const rawToken = searchParams.get('token');
      
      if (!rawToken) {
        setError('Invalid or expired reset token.');
        setIsValidToken(false);
        return;
      }
      
      const token = rawToken.replace(/\s+/g, '');
      
      const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const user = mockUsers.find((u: any) => u.reset_token === token);
      
      if (!user) {
        setError('Invalid or expired reset token.');
        setIsValidToken(false);
      } else {
        setUserEmail(user.email || '');
        setIsValidToken(true);
      }
    } else {
      // Live Supabase
      const checkSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsValidToken(true);
        } else {
          const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
              setIsValidToken(true);
            }
          });
          
          setTimeout(async () => {
             const { data: { session: newSession } } = await supabase.auth.getSession();
             if (!newSession) {
               // Only set error if they haven't successfully loaded the form
               setIsValidToken((prev) => {
                 if (prev !== true) {
                   setError('Invalid or expired reset link. Please request a new one.');
                   return false;
                 }
                 return prev;
               });
             }
          }, 2000);
          
          return () => subscription.unsubscribe();
        }
      };
      checkSession();
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);

    try {
      if (IS_MOCK_SUPABASE) {
        const searchParams = new URLSearchParams(location.search);
        const rawToken = searchParams.get('token');
        
        if (!rawToken) throw new Error('Invalid or expired reset token.');
        
        const token = rawToken.replace(/\s+/g, '');

        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const userIndex = mockUsers.findIndex((u: any) => u.reset_token === token);
        
        if (userIndex === -1) {
          throw new Error('Invalid or expired reset token.');
        }

        const user = mockUsers[userIndex];
        
        if (email.toLowerCase().trim() !== (user.email || '').toLowerCase().trim()) {
          throw new Error('The email address provided does not match this reset link.');
        }

        // Mock hashing for local storage - in production/Live Supabase handles secure bcrypt hashing
        mockUsers[userIndex].password = btoa(password);
        mockUsers[userIndex].reset_token = null; // Clear token
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        
        setSuccess(true);
        setTimeout(() => navigate('/login'), 3000);
        return;
      }

      // Live Supabase
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: password
      });

      if (supabaseError) throw supabaseError;
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <Lock className="text-white" size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Set Your Password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Welcome! Please set a secure password to access your account.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {isValidToken === null ? (
            <div className="flex justify-center py-12">
              <Loader2 className="animate-spin text-blue-600" size={32} />
            </div>
          ) : isValidToken === false ? (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex flex-col items-center">
                <div className="flex items-center mb-4">
                  <AlertCircle className="text-red-500 mr-2" size={20} />
                  <p className="text-sm text-red-700">{error || 'Invalid or expired reset token.'}</p>
                </div>
                <button 
                  onClick={() => navigate('/login')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium underline"
                >
                  Return to Login
                </button>
              </div>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                <h3 className="text-lg font-medium text-green-800 mb-1">Password Reset Successful</h3>
                <p className="text-sm text-green-700">
                  Your password has been successfully updated. Redirecting to login...
                </p>
              </div>
              <button 
                onClick={() => navigate('/login')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login Now
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md flex items-center">
                  <AlertCircle className="text-red-500 mr-2 shrink-0" size={20} />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Updating...
                    </>
                  ) : (
                    'Set Password'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
