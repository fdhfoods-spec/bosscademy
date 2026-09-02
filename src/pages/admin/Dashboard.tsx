import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, BookOpen, Award, TrendingUp, Loader2, DollarSign, 
  Clock, Plus, Activity, CheckCircle, XCircle, ArrowRight 
} from 'lucide-react';
import { IS_MOCK_SUPABASE, supabase } from '../../lib/supabase';
import { getMockCourses, getMockUsers, getMockEnrollments } from '../../lib/mockData';

interface DashboardData {
  totalCourses: number;
  activeCourses: number;
  completedCourses: number;
  totalStudents: number;
  totalMentors: number;
  totalEnrollments: number;
  totalRevenue: number;
  pendingPayments: number;
  recentActivity: ActivityItem[];
}

interface ActivityItem {
  id: string;
  type: 'user' | 'enrollment' | 'payment';
  title: string;
  subtitle: string;
  date: string;
  status?: string;
  amount?: number;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardData>({
    totalCourses: 0,
    activeCourses: 0,
    completedCourses: 0,
    totalStudents: 0,
    totalMentors: 0,
    totalEnrollments: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (IS_MOCK_SUPABASE) {
        const allCourses = getMockCourses();
        const allUsers = getMockUsers();
        const allEnrollments = getMockEnrollments();

        const students = allUsers.filter(u => u.role === 'Student');
        const mentors = allUsers.filter(u => u.role === 'Mentor');
        const publishedCourses = allCourses.filter(c => c.status === 'Published');
        const archivedCourses = allCourses.filter(c => c.status === 'Archived');

        const mockActivities: ActivityItem[] = [
          ...students.slice(0, 3).map(u => ({
            id: `u-${u.id}`,
            type: 'user' as const,
            title: `New Student Registered`,
            subtitle: u.name,
            date: u.created_at
          })),
          ...allEnrollments.slice(0, 3).map(e => {
            const student = allUsers.find(u => u.id === e.student_id);
            const course = allCourses.find(c => c.id === e.course_id);
            return {
              id: `e-${e.id}`,
              type: 'enrollment' as const,
              title: `New Enrollment`,
              subtitle: `${student?.name} enrolled in ${course?.title}`,
              date: e.enrolled_at,
              status: e.status
            };
          })
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        setData({
          totalCourses: allCourses.length,
          activeCourses: publishedCourses.length,
          completedCourses: archivedCourses.length,
          totalStudents: students.length,
          totalMentors: mentors.length,
          totalEnrollments: allEnrollments.length,
          totalRevenue: 15450, // Mock revenue
          pendingPayments: 2,
          recentActivity: mockActivities.slice(0, 8)
        });
        setIsLoading(false);
        return;
      }

      // Fetch from real database via Supabase
      const [
        { data: coursesData, error: coursesErr },
        { data: usersData, error: usersErr },
        { data: enrollmentsData, error: enrollErr }
      ] = await Promise.all([
        supabase.from('courses').select('*'),
        supabase.from('profiles').select('*'),
        supabase.from('enrollments').select('*')
      ]);

      if (coursesErr) throw coursesErr;
      if (usersErr) throw usersErr;
      if (enrollErr) throw enrollErr;

      const allCourses = coursesData || [];
      const allUsers = usersData || [];
      const allEnrollments = enrollmentsData || [];
      const allPayments: any[] = [];

      const students = allUsers.filter(u => u.role === 'Student');
      const mentors = allUsers.filter(u => u.role === 'Mentor');
      const publishedCourses = allCourses.filter(c => c.status === 'Published' || c.status === 'Active');
      const archivedCourses = allCourses.filter(c => c.status === 'Archived');

      let totalRevenue = 0;
      let pendingPayments = 0;

      allPayments.forEach(p => {
        if (p.status === 'successful') {
          totalRevenue += p.amount || 0;
        } else if (p.status === 'pending') {
          pendingPayments++;
        }
      });

      const activities: ActivityItem[] = [];

      allUsers.forEach(u => {
        activities.push({
          id: `u-${u.id}`,
          type: 'user',
          title: `New ${u.role} Joined`,
          subtitle: u.name,
          date: u.created_at || new Date().toISOString()
        });
      });

      allEnrollments.forEach(e => {
        const student = allUsers.find(u => u.id === e.student_id);
        const course = allCourses.find(c => c.id === e.course_id);
        activities.push({
          id: `e-${e.id}`,
          type: 'enrollment',
          title: 'Course Enrollment',
          subtitle: `${student?.name || 'A student'} enrolled in ${course?.title || 'a course'}`,
          date: e.enrolled_at || new Date().toISOString(),
          status: e.status
        });
      });

      allPayments.forEach(p => {
        activities.push({
          id: `p-${p.id}`,
          type: 'payment',
          title: 'Payment Processed',
          subtitle: `Amount: ₹${p.amount}`,
          date: p.created_at || new Date().toISOString(),
          status: p.status,
          amount: p.amount
        });
      });

      activities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      setData({
        totalCourses: allCourses.length,
        activeCourses: publishedCourses.length,
        completedCourses: archivedCourses.length,
        totalStudents: students.length,
        totalMentors: mentors.length,
        totalEnrollments: allEnrollments.length,
        totalRevenue: totalRevenue,
        pendingPayments: pendingPayments,
        recentActivity: activities.slice(0, 10)
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred loading the dashboard.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-4">
        <Loader2 className="animate-spin text-blue-600" size={64} />
        <p className="text-gray-500 font-bold uppercase tracking-wider text-sm">Aggregating Dashboard Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-[80vh] space-y-4">
        <XCircle className="text-red-500" size={64} />
        <h3 className="text-xl font-bold text-gray-900">Failed to load Dashboard</h3>
        <p className="text-red-500">{error}</p>
        <button onClick={fetchDashboardData} className="px-6 py-2 bg-blue-500 text-white rounded-md font-bold uppercase hover:bg-blue-600 transition-colors">
          Retry
        </button>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Students', value: data.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Mentors', value: data.totalMentors, icon: Award, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { label: 'Total Courses', value: data.totalCourses, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-100' },
    { label: 'Active Courses', value: data.activeCourses, icon: Activity, color: 'text-green-600', bg: 'bg-green-100' },
    { label: 'Total Enrollments', value: data.totalEnrollments, icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Total Revenue', value: `₹${data.totalRevenue.toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { label: 'Pending Payments', value: data.pendingPayments, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { label: 'Completed Courses', value: data.completedCourses, icon: CheckCircle, color: 'text-teal-600', bg: 'bg-teal-100' },
  ];

  return (
    <div className="space-y-8 bg-white min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 text-black font-sans">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-wider uppercase">Overview</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Real-time academy statistics and recent activities.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <button onClick={() => navigate('/admin/users')} className="bg-gray-100 text-gray-700 font-bold px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition-colors text-xs uppercase tracking-wider">
            <Plus size={14} className="mr-2" /> Add User
          </button>
          <button onClick={() => navigate('/admin/courses')} className="bg-blue-500 text-white font-bold px-4 py-2 rounded-md flex items-center hover:bg-blue-600 transition-colors text-xs uppercase tracking-wider shadow-sm">
            <Plus size={14} className="mr-2" /> Add Course
          </button>
        </div>
      </div>

      {/* 8-Card Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bg}`}>
                  <Icon className={stat.color} size={24} strokeWidth={2.5} />
                </div>
              </div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Charts & Activity Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CSS-based Charts Section (Takes up 2 cols) */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Revenue Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider">Revenue Growth</h2>
            </div>
            {/* Pure CSS Bar Chart */}
            <div className="h-64 flex items-end gap-2 sm:gap-6 pt-10 border-b border-gray-200 pb-2">
              {[40, 60, 30, 80, 50, 90, 75, 100, 65, 85].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-gray-900 text-white text-xs font-bold px-2 py-1 rounded transition-opacity whitespace-nowrap z-10 pointer-events-none">
                    ₹{(h * 150).toLocaleString()}
                  </div>
                  {/* Bar */}
                  <div 
                    className="w-full bg-emerald-100 group-hover:bg-emerald-500 rounded-t-md transition-all duration-300 ease-out cursor-pointer" 
                    style={{ height: `${h}%` }}
                  />
                  {/* Label */}
                  <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase block absolute -bottom-6">W{i+1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Enrollment Trend Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black uppercase tracking-wider">Course Enrollments</h2>
            </div>
            {/* Pure CSS Bar Chart */}
            <div className="h-48 flex items-end gap-2 sm:gap-6 pt-10 border-b border-gray-200 pb-2">
              {[20, 35, 55, 40, 70, 45, 90].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                   <div className="opacity-0 group-hover:opacity-100 absolute -top-10 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded transition-opacity z-10 pointer-events-none">
                    {h} Students
                  </div>
                  <div 
                    className="w-full bg-blue-100 group-hover:bg-blue-500 rounded-t-md transition-all duration-300 ease-out cursor-pointer" 
                    style={{ height: `${h}%` }}
                  />
                  <span className="text-[10px] font-bold text-gray-400 mt-2 uppercase absolute -bottom-6">D{i+1}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Recent Activity Feed (Takes 1 col) */}
        <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
            <h2 className="text-lg font-black uppercase tracking-wider">Activity Feed</h2>
            <Activity className="text-gray-400" size={20} />
          </div>
          
          <div className="space-y-6">
            {data.recentActivity.length === 0 ? (
              <p className="text-sm text-gray-500 font-medium text-center py-10">No recent activity found.</p>
            ) : (
              data.recentActivity.map((item) => (
                <div key={item.id} className="relative pl-6 border-l-2 border-gray-200 last:border-transparent">
                  {/* Timeline Dot */}
                  <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${
                    item.type === 'user' ? 'bg-blue-500' : 
                    item.type === 'payment' ? 'bg-emerald-500' : 'bg-orange-500'
                  }`} />
                  
                  <div className="-mt-1.5 mb-1 flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900">{item.title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">
                      {new Date(item.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mb-2">{item.subtitle}</p>
                  
                  {item.status && (
                    <span className={`inline-block px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider ${
                      item.status === 'successful' || item.status === 'active' ? 'bg-green-100 text-green-700' : 
                      item.status === 'failed' ? 'bg-red-100 text-red-700' : 'bg-gray-200 text-gray-700'
                    }`}>
                      {item.status}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>

          <button onClick={() => navigate('/admin/courses')} className="w-full mt-8 py-3 bg-white border border-gray-200 text-black font-bold text-xs uppercase tracking-wider rounded-md hover:bg-gray-100 transition-colors flex items-center justify-center">
            View All Data <ArrowRight size={14} className="ml-2" />
          </button>
        </div>

      </div>
    </div>
  );
}
