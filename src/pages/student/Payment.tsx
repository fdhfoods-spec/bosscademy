import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, QrCode, Clock, ArrowRight, ShieldCheck, CreditCard, Banknote } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function Payment() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Check if coming from registration
    const stored = localStorage.getItem('temp_payment_user');
    if (stored) {
      setTempUser(JSON.parse(stored));
    }

    // Polling mechanism only if there's a temp user waiting for verification
    let interval: NodeJS.Timeout;
    if (stored) {
      interval = setInterval(() => {
        const allUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        const user = allUsers.find((u: any) => u.email === JSON.parse(stored).email);
        
        if (user && user.payment_status === 'verified') {
          setPaymentStatus('verified');
          clearInterval(interval);
        }
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, []);

  const handleProceedToDashboard = async () => {
    if (tempUser && paymentStatus === 'verified') {
      await login(tempUser.email, tempUser.password, 'Student');
      localStorage.removeItem('temp_payment_user'); 
      navigate('/student/dashboard');
    }
  };

  const handleMockPayment = () => {
    if (!tempUser) {
      alert("Please register first before making a payment.");
      navigate('/student/register');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Auto-verify the user in mock storage
      const allUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
      const updatedUsers = allUsers.map((u: any) => 
        u.email === tempUser.email ? { ...u, payment_status: 'verified' } : u
      );
      localStorage.setItem('mock_users', JSON.stringify(updatedUsers));
      
      setPaymentStatus('verified');
      setIsProcessing(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans selection:bg-blue-200">
      
      {/* Brand Header */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-8">
        <div className="mx-auto w-16 h-16 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/20 mb-4">
          <ShieldCheck className="text-white" size={32} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-900">Secure Payment</h2>
        <p className="mt-2 text-sm text-gray-600">BOSS Academy Premium Enrollment</p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-xl sm:rounded-2xl border border-gray-100 text-center relative overflow-hidden">
          
          {/* Decorative Background */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-50 to-white -z-10" />

          {paymentStatus === 'pending' ? (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Complete Your Payment</h2>
              <p className="text-gray-500 mb-8 text-sm">
                Scan the QR code below using any UPI app (GPay, PhonePe, Paytm) to finalize your course enrollment.
              </p>

              {/* QR Code Container */}
              <div className="bg-white p-4 rounded-2xl inline-block mb-8 shadow-md border border-gray-100 relative group hover:scale-105 transition-transform cursor-pointer" onClick={handleMockPayment}>
                <div className="absolute inset-0 bg-blue-600 opacity-0 group-hover:opacity-5 transition-opacity rounded-2xl" />
                <img 
                  src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=upi://pay?pa=bossacademy@upi&pn=BOSSAcademy&cu=INR" 
                  alt="Payment QR Code" 
                  className={`w-48 h-48 rounded-lg ${isProcessing ? 'opacity-50 blur-sm' : ''} transition-all`}
                />
                {isProcessing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                    <span className="text-sm font-bold text-blue-900 bg-white/80 px-2 py-1 rounded">Processing...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-center gap-6 mb-8 border-b border-gray-100 pb-8">
                <button onClick={handleMockPayment} disabled={isProcessing} className="flex flex-col items-center group focus:outline-none">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:scale-110 transition-all">
                    <QrCode className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600">Scan QR</span>
                </button>
                <button onClick={handleMockPayment} disabled={isProcessing} className="flex flex-col items-center group focus:outline-none">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:scale-110 transition-all">
                    <CreditCard className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600">UPI App</span>
                </button>
                <button onClick={handleMockPayment} disabled={isProcessing} className="flex flex-col items-center group focus:outline-none">
                  <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mb-2 group-hover:bg-blue-50 group-hover:scale-110 transition-all">
                    <Banknote className="text-blue-600" size={20} />
                  </div>
                  <span className="text-xs font-semibold text-slate-600 group-hover:text-blue-600">Pay Securely</span>
                </button>
              </div>

              {tempUser ? (
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-left flex items-start">
                  <Clock className="text-blue-600 mt-0.5 mr-3 shrink-0" size={20} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Awaiting Verification</h4>
                    <p className="text-sm text-blue-700 mt-1">
                      Your account (<span className="font-semibold">{tempUser.email}</span>) is pending. Admin will verify your payment shortly to grant access.
                    </p>
                    <div className="mt-3 flex items-center text-xs font-bold text-blue-600">
                      <span className="relative flex h-2.5 w-2.5 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                      </span>
                      Listening for admin approval...
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-gray-500 font-medium">After completing your payment, please register or log in to access your courses.</p>
                  <div className="flex gap-4 justify-center">
                    <Link to="/student/register" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-sm">
                      Register Now
                    </Link>
                    <Link to="/student/login" className="px-6 py-2.5 bg-white border border-gray-300 text-slate-700 font-bold rounded-lg hover:bg-gray-50 transition-colors">
                      Log In
                    </Link>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8">
              <div className="mx-auto w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle2 className="text-green-600" size={40} />
              </div>
              <h2 className="text-3xl font-extrabold text-slate-900 mb-3">Payment Verified!</h2>
              <p className="text-gray-600 mb-8 text-sm max-w-xs mx-auto leading-relaxed">
                Your transaction was successfully confirmed. Welcome to BOSS Academy! Your courses are now unlocked.
              </p>

              <button
                onClick={handleProceedToDashboard}
                className="w-full flex items-center justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all transform hover:-translate-y-0.5"
              >
                Enter Dashboard <ArrowRight size={18} className="ml-2" />
              </button>
            </div>
          )}

        </div>
        
        {/* Footer info */}
        <div className="mt-8 text-center text-sm text-gray-500 font-medium flex items-center justify-center gap-2">
          <ShieldCheck size={16} className="text-gray-400" />
          <span>Payments are 100% secure and encrypted.</span>
        </div>
      </div>
    </div>
  );
}
