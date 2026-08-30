import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Course, Payment } from '../../types';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Payment() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const courseId = searchParams.get('courseId');
  
  const [course, setCourse] = useState<Course | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Course fee (in a real app, this would come from the database course.fee)
  const COURSE_FEE = 4999;

  useEffect(() => {
    if (!courseId) {
      navigate('/student/enrollment');
      return;
    }
    fetchCourseDetails();
  }, [courseId, user]);

  const fetchCourseDetails = async () => {
    if (!user || !courseId) return;
    setIsLoading(true);

    // Live Mode
    const { data: courseData } = await supabase.from('courses').select('*').eq('id', courseId).single();
    if (courseData) setCourse(courseData);
    
    const { data: enrollData } = await supabase.from('enrollments').select('id').eq('student_id', user.id).eq('course_id', courseId);
    if (enrollData && enrollData.length > 0) {
      setIsEnrolled(true);
    }
    
    setIsLoading(false);
  };

  const handlePayNow = async () => {
    if (!user || !course) return;
    setIsProcessing(true);
    setErrorMsg('');

    try {
      // 1. Create order on the backend
      const orderRes = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          amount: COURSE_FEE,
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
        description: `Enrollment for ${course.title}`,
        order_id: orderData.id,
        handler: async function (response: any) {
          await verifyPayment(response, orderData);
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: user.phone || '9999999999'
        },
        theme: {
          color: "#2563eb" // blue-600
        }
      };

      const rzp = new window.Razorpay(options);
      
      rzp.on('payment.failed', function (response: any) {
        setIsProcessing(false);
        setPaymentStatus('failed');
        setErrorMsg(response.error.description || 'Payment failed. Please try again.');
      });
      
      rzp.open();

    } catch (err: any) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      setErrorMsg(err.message || 'Network error while initiating payment.');
    }
  };

  const verifyPayment = async (response: any, _orderData: any) => {
    try {
      // 3. Verify signature on the backend
      const verifyRes = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          razorpay_order_id: response.razorpay_order_id,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_signature: response.razorpay_signature
        })
      });

      const verifyData = await verifyRes.json();
      
      if (verifyRes.ok && verifyData.success) {
        // 4. Verification successful, record payment and enrollment
        await completeEnrollment(response.razorpay_order_id, response.razorpay_payment_id);
      } else {
        throw new Error(verifyData.error || 'Payment verification failed');
      }
    } catch (err: any) {
      setIsProcessing(false);
      setPaymentStatus('failed');
      setErrorMsg(err.message || 'Payment verification failed.');
    }
  };

  const completeEnrollment = async (orderId: string, paymentId: string) => {
    if (!user || !course) return;

    const newPayment = {
      id: crypto.randomUUID(),
      student_id: user.id,
      course_id: course.id,
      order_id: orderId,
      payment_id: paymentId,
      amount: COURSE_FEE,
      currency: 'INR',
      status: 'successful' as const,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newEnrollment = {
      id: crypto.randomUUID(),
      student_id: user.id,
      course_id: course.id,
      enrolled_at: new Date().toISOString(),
      status: 'active' as const,
      progress: 0
    };

    await supabase.from('payments').insert([newPayment]);
    await supabase.from('enrollments').insert([newEnrollment]);

    setPaymentDetails(newPayment);
    setPaymentStatus('success');
    setIsProcessing(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-xl font-bold text-gray-900 mb-2">Course not found</h3>
        <button onClick={() => navigate('/student/enrollment')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Courses
        </button>
      </div>
    );
  }

  if (isEnrolled) {
    return (
      <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100 max-w-2xl mx-auto mt-12">
        <CheckCircle2 className="mx-auto h-16 w-16 text-green-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">You are already enrolled!</h2>
        <p className="text-gray-500 mb-8">You already have active access to {course.title}.</p>
        <button
          onClick={() => navigate(`/student/courses/${course.id}`)}
          className="px-6 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
        >
          Go to Course <ArrowRight className="ml-2" size={18} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      {paymentStatus === 'idle' || paymentStatus === 'failed' ? (
        <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 flex flex-col md:flex-row">
          {/* Order Summary */}
          <div className="bg-gray-50 p-8 md:w-1/2 border-b md:border-b-0 md:border-r border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="flex gap-4 mb-6">
              <div className="w-24 h-24 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold text-2xl">
                    {course.title.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{course.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{course.category}</p>
                <p className="text-sm text-gray-500 mt-1">Duration: {course.duration || 'Flexible'}</p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Course Fee</span>
                <span>₹{COURSE_FEE.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Discount</span>
                <span className="text-green-600">-₹0</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-gray-900 pt-4 border-t border-gray-200">
                <span>Total Payable</span>
                <span>₹{COURSE_FEE.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          {/* Checkout Info */}
          <div className="p-8 md:w-1/2 bg-white flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Student Details</h2>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm text-gray-700">
                <p><span className="font-medium text-gray-900">Name:</span> {user?.name}</p>
                <p><span className="font-medium text-gray-900">Email:</span> {user?.email}</p>
              </div>
            </div>

            {paymentStatus === 'failed' && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg flex items-start text-red-700">
                <AlertCircle className="shrink-0 mr-3 mt-0.5" size={20} />
                <p className="text-sm font-medium">{errorMsg}</p>
              </div>
            )}

            <button
              onClick={handlePayNow}
              disabled={isProcessing}
              className="w-full py-4 px-6 bg-blue-600 text-white text-lg font-bold rounded-xl shadow-lg hover:bg-blue-700 focus:ring-4 focus:ring-blue-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={24} /> Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2" size={24} /> Pay ₹{COURSE_FEE.toLocaleString('en-IN')}
                </>
              )}
            </button>
            
            <div className="mt-6 flex items-center justify-center text-sm text-gray-500 font-medium">
              <ShieldCheck size={18} className="mr-2 text-green-600" />
              Secure payment processed by Razorpay
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white py-12 px-8 shadow-xl sm:rounded-2xl border border-gray-100 text-center max-w-2xl mx-auto">
          <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="text-green-600" size={56} />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Payment Successful!</h2>
          <p className="text-gray-500 mb-8 text-lg">
            You are now enrolled in <span className="font-bold text-gray-900">{course.title}</span>
          </p>

          {paymentDetails && (
            <div className="bg-gray-50 rounded-xl p-6 text-left mb-8 max-w-md mx-auto space-y-3 border border-gray-100">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Payment ID</span>
                <span className="font-medium text-gray-900">{paymentDetails.payment_id}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount Paid</span>
                <span className="font-bold text-gray-900">₹{paymentDetails.amount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Date</span>
                <span className="font-medium text-gray-900">{new Date(paymentDetails.created_at).toLocaleString()}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate('/student/payments')}
              className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors"
            >
              View Receipt
            </button>
            <button
              onClick={() => navigate(`/student/courses/${course.id}`)}
              className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/30 flex items-center justify-center"
            >
              Go to My Course <ArrowRight className="ml-2" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
