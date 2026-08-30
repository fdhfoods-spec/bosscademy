import { useState, useEffect } from 'react';
import { Loader2, PlayCircle, BookOpen, Award, CheckCircle } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Course, Enrollment, Certificate } from '../../types';
import { getMockCourses, getMockEnrollments } from '../../lib/mockData';
import CertificateModal from '../../components/CertificateModal';

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setIsLoading(true);

    if (IS_MOCK_SUPABASE) {
      const allCourses = getMockCourses();
      const allEnrollments = getMockEnrollments();
      const allCertificates = JSON.parse(localStorage.getItem('mock_certificates') || '[]');

      const userEnrollments = allEnrollments.filter(e => e.student_id === user.id && e.status === 'active');
      const enrolledCourseIds = userEnrollments.map(e => e.course_id);

      setCourses(allCourses.filter(c => enrolledCourseIds.includes(c.id)));
      setEnrollments(userEnrollments);
      setCertificates(allCertificates.filter((c: any) => c.student_id === user.id));

      setIsLoading(false);
      return;
    }

    // Live mode
    const [enrollmentsRes, certsRes] = await Promise.all([
      supabase.from('enrollments').select('*, courses(*)').eq('student_id', user.id).eq('status', 'active'),
      supabase.from('certificates').select('*').eq('student_id', user.id)
    ]);

    if (!enrollmentsRes.error && enrollmentsRes.data) {
      const enrData = enrollmentsRes.data as any[];
      setEnrollments(enrData);
      setCourses(enrData.map(e => e.courses).filter(Boolean));
    }
    
    if (!certsRes.error) setCertificates(certsRes.data as Certificate[]);

    setIsLoading(false);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-white opacity-10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 right-20 -mb-4 w-24 h-24 bg-blue-400 opacity-20 rounded-full blur-xl"></div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight mb-2">Welcome back, {user?.name?.split(' ')[0]}!</h1>
            <p className="text-blue-100 max-w-lg">Continue your learning journey today. You have {courses.length} active {courses.length === 1 ? 'course' : 'courses'}.</p>
          </div>
          <div className="hidden md:flex items-center space-x-4">
             <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
               <span className="block text-2xl font-bold">{courses.length}</span>
               <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Enrolled</span>
             </div>
             <div className="bg-white/20 backdrop-blur-md rounded-xl p-4 text-center border border-white/10">
               <span className="block text-2xl font-bold">{certificates.length}</span>
               <span className="text-xs uppercase tracking-wider font-semibold opacity-80">Certificates</span>
             </div>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="animate-spin text-blue-600" size={48} />
        </div>
      ) : (
        <div className="space-y-10">
          
          {/* Purchased Courses */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="mr-3 text-blue-600" size={24} />
              My Purchased Courses
            </h2>
            
            {courses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {courses.map(course => {
                  const enrollment = enrollments.find(e => e.course_id === course.id);
                  const progress = enrollment?.progress || 0;
                  const isCompleted = progress === 100;

                  return (
                    <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 group">
                      <div className="h-52 bg-gray-200 w-full relative overflow-hidden">
                        {course.thumbnail ? (
                          <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 bg-gray-100">
                            <BookOpen size={48} />
                          </div>
                        )}
                        {isCompleted && (
                          <div className="absolute top-4 right-4 bg-green-500 text-white p-1.5 rounded-full shadow-md">
                            <CheckCircle size={20} />
                          </div>
                        )}
                      </div>
                      <div className="p-6 flex-1 flex flex-col">
                        <span className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-2">{course.category || 'Course'}</span>
                        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">{course.title}</h3>
                        
                        <div className="mt-auto pt-4">
                          <div className="flex justify-between items-center text-sm mb-2">
                            <span className="font-medium text-gray-700">Course Progress</span>
                            <span className="font-bold text-blue-600">{progress}%</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2.5 mb-6 overflow-hidden">
                            <div className={`h-2.5 rounded-full ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`} style={{ width: `${progress}%` }}></div>
                          </div>

                          <button
                            onClick={() => navigate(`/student/courses/${course.id}`)}
                            className="w-full py-3 px-4 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 shadow-sm"
                          >
                            <PlayCircle size={18} /> {progress === 0 ? 'Start Learning' : isCompleted ? 'Review Course' : 'Continue Learning'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
                <BookOpen className="mx-auto h-16 w-16 text-gray-300 mb-6" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Active Courses</h3>
                <p className="text-gray-500 max-w-md mx-auto">You haven't successfully purchased any courses yet. If you recently made a payment, please wait a few moments and refresh.</p>
              </div>
            )}
          </div>

          {/* Certificates */}
          {certificates.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center border-t border-gray-200 pt-10">
                <Award className="mr-3 text-yellow-500" size={24} />
                My Earned Certificates
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {certificates.map(cert => (
                  <div key={cert.id || cert.certificate_id} className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-sm border border-yellow-200 p-8 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                    <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-5 text-yellow-600 shadow-inner">
                      <Award size={40} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{cert.program}</h3>
                    <p className="text-sm text-gray-500 mb-6 font-medium">Issued on {new Date(cert.issued_at).toLocaleDateString()}</p>
                    <button 
                      onClick={() => setSelectedCert(cert)}
                      className="mt-auto px-6 py-2.5 bg-yellow-600 text-white rounded-xl text-sm font-bold hover:bg-yellow-700 transition-colors w-full shadow-sm"
                    >
                      View Certificate
                    </button>
                  </div>
                ))}
              </div>
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
