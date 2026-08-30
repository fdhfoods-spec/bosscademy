import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, User, Mail, Lock, Phone, AlertCircle, Loader2, CheckCircle, CreditCard, ArrowRight, ShieldCheck } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import type { Course } from '../../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 1: Form, 2: Summary, 3: Processing, 4: Success
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    courseId: ''
  });

  const selectedCourse = courses.find(c => c.id === formData.courseId);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .in('status', ['Active', 'Published']);
      
    if (error) {
      console.error("Error fetching courses:", error);
      return;
    }

    if (data) {
      setCourses(data as Course[]);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    
    if (!formData.courseId) {
      setError('Please select a course.');
      return;
    }

    setStep(2);
  };

  const handlePayNow = async () => {
    if (!selectedCourse) return;
    setError(null);
    setIsLoading(true);

    const price = selectedCourse.price || 4999; // Default price if missing

    try {
      // 1. Create order on the backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: selectedCourse.id,
          amount: price,
          currency: 'INR'
        })
      });
      
      const orderData = await orderRes.json();
      
      if (!orderRes.ok || !orderData.id) {
        throw new Error(orderData.error || 'Failed to create payment order');
      }

      // 2. Open Razorpay Checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'dummy_key',
        amount: orderData.amount,
        currency: orderData.currency,
        name: "BOSS Academy",
        description: `Enrollment for ${selectedCourse.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          await verifyPaymentAndRegister(response, orderData);
        },
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone || '9999999999'
        },
        theme: {
          color: "#2563eb" // blue-600
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setError(`Payment failed: ${response.error.description}`);
        setIsLoading(false);
      });

      rzp.open();

    } catch (err: any) {
      setError(err.message || 'Payment initialization failed.');
      setIsLoading(false);
    }
  };

  const verifyPaymentAndRegister = async (paymentResponse: any, orderData: any) => {
    setStep(3);
    setError(null);

    try {
      const verifyRes = await fetch('/api/complete-student-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentInfo: {
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            amount: orderData.amount / 100, // convert paise to INR
            currency: orderData.currency
          },
          studentInfo: formData
        })
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Registration verification failed');
      }

      setStep(4);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Payment verified, but registration failed. Please contact support.');
      setStep(2); // Go back to summary to show error
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen className="text-white" size={24} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {step === 1 && "Student Registration"}
          {step === 2 && "Order Summary"}
          {step === 3 && "Processing Payment"}
          {step === 4 && "Registration Complete!"}
        </h2>
        {step === 1 && (
          <p className="mt-2 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 transition-colors">
              Sign in here
            </Link>
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md lg:max-w-2xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
          
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in">
              <div className="flex items-center">
                <AlertCircle className="text-red-500 mr-3 flex-shrink-0" size={20} />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* STEP 1: REGISTRATION FORM */}
          {step === 1 && (
            <form className="space-y-5" onSubmit={handleFormSubmit}>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="text" required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="pl-10 block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="email" required
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="pl-10 block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="tel" required
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="pl-10 block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                      placeholder="+91 9999999999"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                  <div className="relative">
                    <select
                      required
                      value={formData.courseId}
                      onChange={(e) => setFormData({...formData, courseId: e.target.value})}
                      className="block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                    >
                      <option value="" disabled>Select a course to enroll...</option>
                      {courses.map(course => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="password" required
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="pl-10 block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="text-gray-400" size={18} />
                    </div>
                    <input
                      type="password" required
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                      className="pl-10 block w-full border border-gray-300 rounded-lg py-2.5 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
                    />
                  </div>
                </div>
              </div>
              
              {selectedCourse && (
                <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-4 transition-all">
                   {selectedCourse.thumbnail ? (
                      <img src={selectedCourse.thumbnail} alt={selectedCourse.title} className="w-24 h-24 object-cover rounded-lg shadow-sm" />
                   ) : (
                      <div className="w-24 h-24 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <BookOpen className="text-blue-500" size={32} />
                      </div>
                   )}
                   <div className="flex flex-col justify-center">
                     <h4 className="font-bold text-gray-900">{selectedCourse.title}</h4>
                     <p className="text-sm text-gray-600 line-clamp-2 mt-1">{selectedCourse.description}</p>
                     <div className="mt-2 text-blue-700 font-semibold text-lg">
                        ₹{selectedCourse.price || 4999}
                     </div>
                   </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:shadow-md"
                >
                  Continue to Payment <ArrowRight size={18} className="ml-2" />
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: ORDER SUMMARY */}
          {step === 2 && selectedCourse && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-100 shadow-inner">
                <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-3 mb-4">Order Summary</h3>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Student Name</span>
                    <span className="font-medium text-gray-900 text-right">{formData.name}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Email Address</span>
                    <span className="font-medium text-gray-900 text-right">{formData.email}</span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-gray-500">Course Selected</span>
                    <span className="font-medium text-gray-900 text-right">{selectedCourse.title}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-600">Course Price</span>
                    <span className="font-medium text-gray-900">₹{selectedCourse.price || 4999}</span>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-green-600 font-medium">Discount</span>
                    <span className="text-green-600 font-medium">- ₹0</span>
                  </div>
                  <div className="flex justify-between items-center bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <span className="text-base font-bold text-gray-900">Total Payable</span>
                    <span className="text-2xl font-bold text-blue-700">₹{selectedCourse.price || 4999}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center text-sm text-gray-500 mt-4 mb-6">
                <ShieldCheck size={16} className="text-green-500 mr-2" />
                Secure Encrypted Checkout
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePayNow}
                  disabled={isLoading}
                  className="flex-[2] flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none transition-all hover:shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <><Loader2 className="animate-spin mr-2" size={20} /> Loading Payment...</>
                  ) : (
                    <><CreditCard className="mr-2" size={20} /> Pay ₹{selectedCourse.price || 4999}</>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING */}
          {step === 3 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 animate-pulse text-blue-600">
              <Loader2 className="animate-spin" size={64} />
              <h3 className="text-xl font-bold text-gray-900">Verifying Payment...</h3>
              <p className="text-gray-500 text-center text-sm">Please do not close this window or refresh the page while we activate your account.</p>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="py-8 flex flex-col items-center justify-center space-y-6 text-center animate-fade-in">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center shadow-inner">
                <CheckCircle className="text-green-500" size={48} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Registration Successful!</h3>
                <p className="text-gray-600 mb-6">Your payment has been received and your course is now active.</p>
                
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 inline-block mb-8 w-full max-w-sm shadow-sm">
                   <p className="text-sm text-gray-500 mb-1">Your Login Email is</p>
                   <p className="font-mono font-medium text-gray-900 text-lg">{formData.email}</p>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-base font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none transition-all hover:shadow-lg"
              >
                Go to Login <ArrowRight className="ml-2" size={20} />
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
