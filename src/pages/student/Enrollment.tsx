import { useState, useEffect } from 'react';
import { Loader2, PlayCircle, BookOpen, Award } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Course, Enrollment, Certificate } from '../../types';
import { getMockCourses, getMockEnrollments, setMockEnrollments } from '../../lib/mockData';
import CertificateModal from '../../components/CertificateModal';

export default function StudentEnrollment() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null);
  
  useEffect(() => {
    fetchCoursesAndEnrollments();
  }, [user]);

  const fetchCoursesAndEnrollments = async () => {
    if (!user) return;
    setIsLoading(true);

    if (IS_MOCK_SUPABASE) {
      const allCourses = getMockCourses();
      const allEnrollments = getMockEnrollments();
      const allCertificates = JSON.parse(localStorage.getItem('mock_certificates') || '[]');

      const assignedIds = user.assigned_courses || [];

      setCourses(allCourses.filter(c => c.status === 'Published' && assignedIds.includes(c.id)));
      setEnrollments(allEnrollments.filter(e => e.student_id === user.id));
      setCertificates(allCertificates.filter((c: any) => c.student_id === user.id));

      setIsLoading(false);
      return;
    }

    // Live mode
    const [coursesRes, enrollmentsRes, certsRes] = await Promise.all([
      supabase.from('courses').select('*').eq('status', 'Published'),
      supabase.from('enrollments').select('*').eq('student_id', user.id),
      supabase.from('certificates').select('*').eq('student_id', user.id)
    ]);

    if (!coursesRes.error) setCourses(coursesRes.data as Course[]);
    if (!enrollmentsRes.error) setEnrollments(enrollmentsRes.data as Enrollment[]);
    if (!certsRes.error) setCertificates(certsRes.data as Certificate[]);

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
      status: 'active' as 'active'|'completed',
      progress: 0
    };

    if (IS_MOCK_SUPABASE) {
      const allEnrollments = getMockEnrollments();
      const updated = [...allEnrollments, newEnrollment];
      setMockEnrollments(updated);
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
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Courses</h1>
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
      ) : (
        <div className="space-y-12">
          
          {certificates.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 border-gray-200">My Earned Certificates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map(cert => (
                  <div key={cert.id || cert.certificate_id} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl shadow-sm border border-yellow-200 p-6 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4 text-yellow-600">
                      <Award size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{cert.program}</h3>
                    <p className="text-sm text-gray-500 mb-4">Issued on {new Date(cert.issued_at).toLocaleDateString()}</p>
                    <button 
                      onClick={() => setSelectedCert(cert)}
                      className="mt-auto px-4 py-2 bg-yellow-600 text-white rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors w-full"
                    >
                      View Certificate
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {filteredCourses.length > 0 ? (
            Array.from(new Set(filteredCourses.map(c => c.category || 'Uncategorized'))).map(category => (
              <div key={category}>
              <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2 border-gray-200">{category}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCourses.filter(c => (c.category || 'Uncategorized') === category).map(course => {
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
                              className="px-4 py-2 bg-green-50 text-green-700 rounded-lg text-sm font-medium border border-green-200 hover:bg-green-100 flex items-center gap-2 transition-colors"
                            >
                              <PlayCircle size={16} /> Resume
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEnroll(course.id)}
                              disabled={isEnrolling === course.id}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
                            >
                              {isEnrolling === course.id ? <Loader2 size={16} className="animate-spin" /> : null}
                              Enroll Now
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-100">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Courses Found</h3>
              <p className="text-gray-500">You haven't been assigned any courses yet, or they are not published.</p>
            </div>
          )}
        </div>
      )}
      
      <CertificateModal 
        certificate={selectedCert} 
        onClose={() => setSelectedCert(null)} 
      />
    </div>
  );
}
