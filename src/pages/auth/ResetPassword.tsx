import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Lock, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();

  // For real Supabase, the hash contains the access_token.
  // For Mock, we use a custom ?token=... in the search params.
  useEffect(() => {
    if (IS_MOCK_SUPABASE) {
      const searchParams = new URLSearchParams(location.search);
      const token = searchParams.get('token');
      const savedToken = localStorage.getItem('mock_reset_token');
      
      if (!token || token !== savedToken) {
        setError('Invalid or expired reset token.');
      }
    } else {
      // Setup listener for real supabase password recovery if needed
      // Actually with PKCE flow, Supabase handles the session exchange automatically on the callback route
      // and we just need to call updateUser.
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
        // Verify mock token again just in case
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const savedToken = localStorage.getItem('mock_reset_token');
        
        if (!token || token !== savedToken) {
          throw new Error('Invalid or expired reset token.');
        }

        const email = localStorage.getItem('mock_reset_email');
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        
        const userIndex = mockUsers.findIndex((u: any) => u.email === email);
        if (userIndex >= 0) {
          mockUsers[userIndex].password = password;
          localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        } else {
          // If they were a default user, they might not be in mock_users yet
          const cleanUsername = email?.split('@')[0] || '';
          let validRole = 'Student';
          if (cleanUsername === 'admin') validRole = 'Admin';
          if (cleanUsername === 'mentor') validRole = 'Mentor';

          mockUsers.push({
            id: `mock-${cleanUsername}`,
            username: cleanUsername,
            name: `${validRole} User`,
            email: email,
            role: validRole,
            status: 'active',
            password: password,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        }

        localStorage.removeItem('mock_reset_token');
        localStorage.removeItem('mock_reset_email');
        
        setSuccess(true);
        setTimeout(() => navigate('/student/login'), 3000);
        return;
      }

      // Live Supabase
      const { error: supabaseError } = await supabase.auth.updateUser({
        password: password
      });

      if (supabaseError) throw supabaseError;
      
      setSuccess(true);
      setTimeout(() => navigate('/student/login'), 3000);
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
          Set new password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please enter your new password below.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-2" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {!success ? (
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700">New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    disabled={!!error && error.includes('token')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="text-gray-400" size={18} />
                  </div>
                  <input
                    type="password"
                    required
                    disabled={!!error && error.includes('token')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading || (!!error && error.includes('token'))}
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin mr-2" size={20} />
                      Updating...
                    </>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <CheckCircle2 className="mx-auto text-green-500 mb-2" size={32} />
                <h3 className="text-lg font-medium text-green-800 mb-1">Password Reset Successful</h3>
                <p className="text-sm text-green-700">
                  Your password has been successfully updated. Redirecting to login...
                </p>
              </div>
              <button 
                onClick={() => navigate('/student/login')}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Go to Login Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
