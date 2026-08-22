import React, { useState, useEffect } from 'react';
import { PlayCircle, BookOpen, Award, Clock, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

interface StudentDashboardData {
  enrolledCourses: number;
  completedCourses: number;
  learningHours: number; // Placeholder calculation
  certificates: number;
  activeEnrollments: any[];
}

export default function StudentDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<StudentDashboardData>({
    enrolledCourses: 0,
    completedCourses: 0,
    learningHours: 0,
    certificates: 0,
    activeEnrollments: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentData() {
      if (!user?.id) return;
      
      try {
        // Fetch enrollments and certificates in parallel
        const [
          { data: enrollments },
          { count: certCount }
        ] = await Promise.all([
          supabase
            .from('enrollments')
            .select('id, status, progress, courses(id, title, description, thumbnail, duration)')
            .eq('student_id', user.id),
          supabase
            .from('certificates')
            .select('*', { count: 'exact', head: true })
            .eq('student_id', user.id)
        ]);

        const enrList = enrollments || [];
        const completed = enrList.filter(e => e.status === 'completed').length;
        const active = enrList.filter(e => e.status !== 'completed');
        
        // Mock learning hours calculation based on completed courses (assuming each course is ~5 hours)
        const mockHours = completed * 5;

        setData({
          enrolledCourses: enrList.length,
          completedCourses: completed,
          learningHours: mockHours,
          certificates: certCount || 0,
          activeEnrollments: active
        });
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudentData();
  }, [user?.id]);

  const stats = [
    { label: 'Enrolled Courses', value: data.enrolledCourses, icon: <BookOpen className="text-blue-500" size={24} />, bgColor: 'bg-blue-50' },
    { label: 'Completed Courses', value: data.completedCourses, icon: <Award className="text-green-500" size={24} />, bgColor: 'bg-green-50' },
    { label: 'Learning Hours', value: data.learningHours, icon: <Clock className="text-purple-500" size={24} />, bgColor: 'bg-purple-50' },
    { label: 'Certificates', value: data.certificates, icon: <Award className="text-yellow-500" size={24} />, bgColor: 'bg-yellow-50' },
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
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {user?.name.split(' ')[0] || 'Student'}!</h1>
        <Link to="/student/enrollment" className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors">
          <PlayCircle size={18} className="mr-2" />
          Browse Courses
        </Link>
      </div>
      
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

      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">My Learning</h2>
        {data.activeEnrollments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No active courses</h3>
            <p className="text-gray-500 mb-6">You haven't enrolled in any courses yet, or you've completed them all.</p>
            <Link to="/student/enrollment" className="inline-flex items-center text-blue-600 font-medium hover:text-blue-700">
              Find a course to start learning <PlayCircle size={18} className="ml-2" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.activeEnrollments.map((enr: any) => (
              <div key={enr.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-40 bg-gray-200 relative">
                  {enr.courses?.thumbnail ? (
                    <img src={enr.courses.thumbnail} alt={enr.courses?.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                      <BookOpen size={48} />
                    </div>
                  )}
                  <button className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity">
                    <PlayCircle className="text-white" size={48} />
                  </button>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-gray-900 mb-1">{enr.courses?.title}</h3>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2">{enr.courses?.description || 'No description available.'}</p>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-medium text-gray-900">{enr.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${enr.progress}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
