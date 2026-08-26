import { useState, useEffect } from 'react';
import { BookOpen, Users, CheckCircle, Loader2 } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import type { Course } from '../../types';
import { getMockCourses, getMockEnrollments } from '../../lib/mockData';

interface MentorDashboardData {
  myCourses: number;
  totalStudents: number;
  completedStudents: number;
  recentEnrollments: any[];
  handlingCourses: Course[];
  totalCertificates: number;
}

export default function MentorDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<MentorDashboardData>({
    myCourses: 0,
    totalStudents: 0,
    completedStudents: 0,
    recentEnrollments: [],
    handlingCourses: [],
    totalCertificates: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMentorData() {
      if (!user?.id) return;
      
      try {
        if (IS_MOCK_SUPABASE) {
          const allCourses = getMockCourses();
          const mentorCourses = allCourses.filter(c => (user.assigned_courses || []).includes(c.id));
          
          const allEnrollments = getMockEnrollments();
          const courseIds = mentorCourses.map(c => c.id);
          
          const mentorEnrollments = allEnrollments.filter(e => courseIds.includes(e.course_id));
          const completedCount = mentorEnrollments.filter(e => e.status === 'completed').length;
          const uniqueStudentIds = new Set(mentorEnrollments.map(e => e.student_id));
          
          setData({
            myCourses: mentorCourses.length,
            totalStudents: uniqueStudentIds.size,
            completedStudents: completedCount,
            recentEnrollments: mentorEnrollments.slice(0, 5), 
            handlingCourses: mentorCourses,
            totalCertificates: completedCount // Assuming 1 certificate per completed course
          });
          
          setIsLoading(false);
          return;
        }

        // Live Mode
        // 1. Fetch mentor's courses
        const { data: coursesData } = await supabase
          .from('courses')
          .select('*')
          .in('id', user.assigned_courses || []);
          
        const courses = (coursesData as Course[]) || [];
        const courseIds = courses.map(c => c.id);
        
        // 2. Fetch enrollments for these courses
        let enrollments: any[] = [];
        let completedCount = 0;
        
        if (courseIds.length > 0) {
          const { data: enrData } = await supabase
            .from('enrollments')
            .select('id, student_id, status, enrolled_at, progress, profiles(name), courses(title)')
            .in('course_id', courseIds)
            .order('enrolled_at', { ascending: false });
            
          enrollments = enrData || [];
          completedCount = enrollments.filter(e => e.status === 'completed').length;
        }
        
        // Calculate unique students
        const uniqueStudentIds = new Set(enrollments.map(e => e.student_id));

        setData({
          myCourses: courseIds.length,
          totalStudents: uniqueStudentIds.size,
          completedStudents: completedCount,
          recentEnrollments: enrollments.slice(0, 5),
          handlingCourses: courses,
          totalCertificates: completedCount
        });
      } catch (error) {
        console.error('Error fetching mentor data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMentorData();
  }, [user?.id]);

  const stats = [
    { label: 'My Courses', value: data.myCourses, icon: <BookOpen className="text-blue-500" size={24} />, bgColor: 'bg-blue-50' },
    { label: 'Total Students', value: data.totalStudents, icon: <Users className="text-green-500" size={24} />, bgColor: 'bg-green-50' },
    { label: 'Completed Students', value: data.completedStudents, icon: <CheckCircle className="text-purple-500" size={24} />, bgColor: 'bg-purple-50' },
    { label: 'Certificates Issued', value: data.totalCertificates, icon: <CheckCircle className="text-yellow-500" size={24} />, bgColor: 'bg-yellow-50' },
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome, {user?.name}</h1>
          <p className="text-sm text-gray-500 mt-1">
            Department: <span className="font-medium text-gray-900">{user?.department || 'Not Assigned'}</span>
          </p>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        {/* Handling Courses List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-900">Handling Courses</h2>
            <Link to="/mentor/courses" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View All</Link>
          </div>
          {data.handlingCourses.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">You are not handling any courses yet.</div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {data.handlingCourses.map((course: Course) => (
                <li key={course.id} className="p-4 hover:bg-gray-50 flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 rounded bg-gray-200 shrink-0 overflow-hidden">
                      {course.thumbnail ? (
                        <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <BookOpen size={20} />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 line-clamp-1">{course.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5">{course.category}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className={`px-2 py-1 text-xs rounded-md ${course.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {course.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-bold text-gray-900">Recent Enrollments</h2>
          </div>
          {data.recentEnrollments.length === 0 ? (
            <div className="text-gray-500 text-sm text-center py-8">No students have enrolled in your courses yet.</div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {data.recentEnrollments.map((enr: any) => {
                const course = data.handlingCourses.find(c => c.id === enr.course_id);
                return (
                  <div key={enr.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          <span className="font-bold">{enr.profiles?.name || 'Student'}</span> enrolled in
                        </p>
                        <p className="text-sm text-blue-600 font-medium">
                          {course?.title || enr.courses?.title || 'Unknown Course'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(enr.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2.5 py-1 text-xs rounded-full font-medium ${enr.progress === 100 ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {enr.progress || 0}% Done
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
