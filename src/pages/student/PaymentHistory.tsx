import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, Receipt, Search, Download } from 'lucide-react';
import type { Payment } from '../../types';

export default function StudentPaymentHistory() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<(Payment & { course_title?: string })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchPayments();
  }, [user]);

  const fetchPayments = async () => {
    if (!user) return;
    setIsLoading(true);

    // Live Supabase
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments')
      .select('*, courses(title)')
      .eq('student_id', user.id)
      .order('created_at', { ascending: false });

    if (!paymentsError && paymentsData) {
      const formatted = paymentsData.map((p: any) => ({
        ...p,
        course_title: p.courses?.title || 'Unknown Course'
      }));
      setPayments(formatted);
    }
    
    setIsLoading(false);
  };

  const handleDownloadReceipt = (payment: Payment & { course_title?: string }) => {
    const receiptContent = `
BOSS Academy - Payment Receipt
--------------------------------
Receipt ID: ${payment.order_id}
Date: ${new Date(payment.created_at).toLocaleString()}

Student: ${user?.name} (${user?.email})
Course: ${payment.course_title}

Amount Paid: ${(payment.amount).toLocaleString('en-IN', { style: 'currency', currency: payment.currency })}
Status: ${payment.status.toUpperCase()}
Payment ID: ${payment.payment_id || 'N/A'}
Method: ${payment.payment_method || 'Online'}

Thank you for learning with BOSS Academy!
    `;

    const blob = new Blob([receiptContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Receipt_${payment.order_id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredPayments = payments.filter(p => 
    p.course_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.order_id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
          <p className="text-sm text-gray-500 mt-1">View your past transactions and download receipts.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search by course or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : filteredPayments.length > 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Course / Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Receipt className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{payment.course_title}</div>
                          <div className="text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {(payment.amount).toLocaleString('en-IN', { style: 'currency', currency: payment.currency })}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'successful' ? 'bg-green-100 text-green-800' :
                        payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.payment_id || payment.order_id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {payment.status === 'successful' && (
                        <button
                          onClick={() => handleDownloadReceipt(payment)}
                          className="text-blue-600 hover:text-blue-900 flex items-center justify-end gap-1 w-full"
                          title="Download Receipt"
                        >
                          <Download size={16} /> Receipt
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
          <Receipt className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Payments Found</h3>
          <p className="text-gray-500">You haven't made any course payments yet.</p>
        </div>
      )}
    </div>
  );
}
