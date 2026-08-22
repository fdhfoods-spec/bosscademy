import React, { useState, useEffect } from 'react';
import { Search, Loader2, PlayCircle, BookOpen } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Course, Enrollment } from '../../types';

export default function StudentEnrollment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, [user]);

  const fetchCoursesAndEnrollments = async () => {
    if (!user) return;
    setIsLoading(true);

    if (IS_MOCK_SUPABASE) {
      const storedCourses = localStorage.getItem('mock_courses');
      const storedEnrollments = localStorage.getItem('mock_enrollments');
      
      if (storedCourses) {
        const allCourses: Course[] = JSON.parse(storedCourses);
        // Students can only see published courses
        setCourses(allCourses.filter(c => c.status === 'Published'));
      }
      
      if (storedEnrollments) {
        const allEnrollments: Enrollment[] = JSON.parse(storedEnrollments);
        setEnrollments(allEnrollments.filter(e => e.student_id === user.id));
      } else {
        setEnrollments([]);
      }
      
      setIsLoading(false);
      return;
    }

    // Live mode
    const [coursesRes, enrollmentsRes] = await Promise.all([
      supabase.from('courses').select('*').eq('status', 'Published'),
      supabase.from('enrollments').select('*').eq('student_id', user.id)
    ]);

    if (!coursesRes.error) setCourses(coursesRes.data as Course[]);
    if (!enrollmentsRes.error) setEnrollments(enrollmentsRes.data as Enrollment[]);
    
    setIsLoading(false);
  };

  const handleEnroll = async (courseId: string) => {
    if (!user) return;
    setIsEnrolling(courseId);

    const newEnrollment = {
      id: crypto.randomUUID(),
      student_id: user.id,
      course_id: courseId,
      enrolled_at: new Date().toISOString(),
      status: 'active',
      progress: 0
    };

    if (IS_MOCK_SUPABASE) {
      const allEnrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const updated = [...allEnrollments, newEnrollment];
      localStorage.setItem('mock_enrollments', JSON.stringify(updated));
      setEnrollments([...enrollments, newEnrollment as Enrollment]);
      setIsEnrolling(null);
      navigate(`/student/courses/${courseId}`);
      return;
    }

    const { error } = await supabase.from('enrollments').insert([newEnrollment]);
    
    if (!error) {
      navigate(`/student/courses/${courseId}`);
    } else {
      console.error('Failed to enroll:', error);
    }
    setIsEnrolling(null);
  };

  const filteredCourses = courses.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Available Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Discover and enroll in courses published by our Mentors.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search courses..." 
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
      ) : filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const isEnrolled = enrollments.some(e => e.course_id === course.id);

            return (
              <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-200 w-full relative">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                      <BookOpen size={48} />
                    </div>
                  )}
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider mb-2">{course.category}</span>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-sm text-gray-500 flex-1 line-clamp-2">{course.description || 'No description available.'}</p>
                  
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                    <div className="text-sm text-gray-500">
                      <span className="block font-medium text-gray-900">Duration</span>
                      <span>{course.duration || 'Flexible'}</span>
                    </div>
                    
                    {isEnrolled ? (
                      <button 
                        onClick={() => navigate(`/student/courses/${course.id}`)}
                        className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-md font-medium hover:bg-green-100 transition-colors flex items-center"
                      >
                        <PlayCircle size={18} className="mr-2" />
                        Continue
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleEnroll(course.id)}
                        disabled={isEnrolling === course.id}
                        className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center disabled:opacity-70"
                      >
                        {isEnrolling === course.id ? (
                          <Loader2 size={18} className="animate-spin mr-2" />
                        ) : null}
                        Enroll Now
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-16 text-center">
          <BookOpen className="mx-auto text-gray-300 mb-4" size={48} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
          <p className="text-gray-500">There are currently no published courses available for enrollment.</p>
        </div>
      )}
    </div>
  );
}
