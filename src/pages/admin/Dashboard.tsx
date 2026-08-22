import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Award, TrendingUp, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

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
          {data.recentUsers.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">No recent users found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentUsers.map((user: any) => (
                <li key={user.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <p className="text-xs text-gray-500">{user.email}</p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">{user.role}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Enrollments</h2>
          </div>
          {data.recentEnrollments.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">No recent enrollments found.</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {data.recentEnrollments.map((enr: any) => (
                <li key={enr.id} className="p-4 hover:bg-gray-50">
                  <p className="text-sm font-medium text-gray-900">{enr.profiles?.name || 'Unknown Student'}</p>
                  <p className="text-xs text-gray-500 mt-1">Enrolled in <span className="font-medium text-blue-600">{enr.courses?.title || 'Unknown Course'}</span></p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
