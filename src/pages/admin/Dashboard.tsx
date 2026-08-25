import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, Loader2 } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { getMockCourses, getMockUsers, getMockEnrollments } from '../../lib/mockData';

interface DashboardData {
  totalCourses: number;
  totalUsers: number;
  totalEnrollments: number;
  totalCertificates: number;
  recentUsers: any[];
  recentEnrollments: any[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData>({
    totalCourses: 0,
    totalUsers: 0,
    totalEnrollments: 0,
    totalCertificates: 0,
    recentUsers: [],
    recentEnrollments: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        if (IS_MOCK_SUPABASE) {
          const allCourses = getMockCourses();
          const allUsers = getMockUsers();
          const allEnrollments = getMockEnrollments();
          const allCertificates = JSON.parse(localStorage.getItem('mock_certificates') || '[]');

          // Sort users by created_at descending and get top 5
          const sortedUsers = [...allUsers].sort((a, b) => 
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          );
          
          // Map enrollments to include profile and course names
          const enrichedEnrollments = [...allEnrollments].sort((a, b) => 
            new Date(b.enrolled_at).getTime() - new Date(a.enrolled_at).getTime()
          ).map(enrollment => {
            const user = allUsers.find(u => u.id === enrollment.student_id);
            const course = allCourses.find(c => c.id === enrollment.course_id);
            return {
              ...enrollment,
              profiles: { name: user?.name || 'Unknown Student' },
              courses: { title: course?.title || 'Unknown Course' }
            };
          });

          setData({
            totalCourses: allCourses.length,
            totalUsers: allUsers.length,
            totalEnrollments: allEnrollments.length,
            totalCertificates: allCertificates.length,
            recentUsers: sortedUsers.slice(0, 5),
            recentEnrollments: enrichedEnrollments.slice(0, 5)
          });
          setIsLoading(false);
          return;
        }

        // Fetch counts in parallel
        const [
          { count: coursesCount },
          { count: usersCount },
          { count: enrollmentsCount },
          { count: certificatesCount },
          { data: recentUsers },
          { data: recentEnrollments }
        ] = await Promise.all([
          supabase.from('courses').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('*', { count: 'exact', head: true }),
          supabase.from('enrollments').select('*', { count: 'exact', head: true }),
          supabase.from('certificates').select('*', { count: 'exact', head: true }),
          supabase.from('profiles').select('id, name, email, role, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('enrollments').select('id, enrolled_at, profiles(name), courses(title)').order('enrolled_at', { ascending: false }).limit(5)
        ]);

        setData({
          totalCourses: coursesCount || 0,
          totalUsers: usersCount || 0,
          totalEnrollments: enrollmentsCount || 0,
          totalCertificates: certificatesCount || 0,
          recentUsers: recentUsers || [],
          recentEnrollments: recentEnrollments || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  const stats = [
    { label: 'Total Courses', value: data.totalCourses, icon: <BookOpen className="text-blue-500" size={24} />, bgColor: 'bg-blue-50' },
    { label: 'Total Users', value: data.totalUsers, icon: <Users className="text-green-500" size={24} />, bgColor: 'bg-green-50' },
    { label: 'Total Enrollments', value: data.totalEnrollments, icon: <TrendingUp className="text-purple-500" size={24} />, bgColor: 'bg-purple-50' },
    { label: 'Certificates Issued', value: data.totalCertificates, icon: <Award className="text-yellow-500" size={24} />, bgColor: 'bg-yellow-50' },
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center space-x-4">
            <div className={`p-4 rounded-full ${stat.bgColor}`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Users</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentUsers.map((user: any) => (
              <div key={user.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    {user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  user.role === 'Mentor' ? 'bg-indigo-100 text-indigo-800' : 'bg-green-100 text-green-800'
                }`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Enrollments</h2>
          </div>
          <div className="divide-y divide-gray-100">
            {data.recentEnrollments.map((enrollment: any) => (
              <div key={enrollment.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                    <TrendingUp size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-bold">{enrollment.profiles?.name}</span> enrolled in
                    </p>
                    <p className="text-sm text-blue-600 font-medium">
                      {enrollment.courses?.title}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
