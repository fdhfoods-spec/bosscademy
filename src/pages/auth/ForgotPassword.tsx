import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { KeyRound, AlertCircle, Loader2, ArrowLeft, Mail } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [mockToken, setMockToken] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (IS_MOCK_SUPABASE) {
        // Mock Forgot Password Logic
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        
        const userIndex = mockUsers.findIndex((u: any) => u.email?.toLowerCase().trim() === email.toLowerCase().trim());
                          
        if (userIndex === -1) {
          throw new Error('No account found with that email address.');
        }

        // Generate mock token
        const token = crypto.randomUUID();
        mockUsers[userIndex].reset_token = token;
        localStorage.setItem('mock_users', JSON.stringify(mockUsers));
        
        // For development/testing purposes, store the token separately to show it in the UI
        setMockToken(token);
        setSuccess(true);
        setIsLoading(false);
        return;
      }

      // Live Supabase - Bypass Supabase rate limits with custom Admin API route
      const linkRes = await fetch('/api/generate-reset-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const linkData = await linkRes.json();
      
      if (!linkRes.ok) {
        throw new Error(linkData.error || 'Failed to generate secure reset link');
      }

      const subject = 'Reset your password - Boss Academy';
      const text = `HELLO,

Someone has requested a password reset for your Boss Academy account.
If this was you, please click the link below to set a new password:

${linkData.action_link}

Note: This link will expire in 24 hours.

If you didn't request a password reset, you can safely ignore this email.

CONFIDENTIAL & PROPRIETARY
© 2026 BOSS ACADEMY. ALL RIGHTS RESERVED.`;

      const emailRes = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to: email, subject, text })
      });
      
      if (!emailRes.ok) {
        throw new Error('Failed to send email. Check your SMTP configuration.');
      }
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
            <KeyRound className="text-white" size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a link to reset your password.
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
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="text-gray-400" size={18} />
                  </div>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="you@example.com"
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
                      Sending...
                    </>
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                <h3 className="text-lg font-medium text-green-800 mb-1">Check your inbox</h3>
                <p className="text-sm text-green-700">
                  We've sent a password reset link to <strong>{email}</strong>.
                </p>
              </div>
              
              {IS_MOCK_SUPABASE && mockToken && (
                <div className="mt-6 p-4 border border-blue-200 bg-blue-50 rounded-lg text-left">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2">Development Demo Mode</p>
                  <p className="text-sm text-blue-900 mb-3">Since you are running with Mock Supabase, an actual email was not sent. Click the button below to simulate opening the email link.</p>
                  <button 
                    onClick={() => navigate(`/reset-password?token=${mockToken}`)}
                    className="w-full py-2 bg-white border border-blue-300 text-blue-700 font-medium rounded-md hover:bg-blue-100 transition-colors text-sm shadow-sm"
                  >
                    Simulate Email Link Click
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center">
            <Link to="/student/login" className="font-medium text-blue-600 hover:text-blue-500 flex items-center justify-center text-sm">
              <ArrowLeft size={16} className="mr-2" />
              Back to Student Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
