import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Award, Search, Loader2 } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export default function MentorCertificates() {
  const { user } = useAuth();
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchEligibleStudents();
  }, [user?.id]);

  const fetchEligibleStudents = async () => {
    if (!user?.id) return;
    setIsLoading(true);

    try {
      if (IS_MOCK_SUPABASE) {
        // Fetch all mock data
        const allCourses = JSON.parse(localStorage.getItem('mock_courses') || '[]');
        const mentorCourses = allCourses.filter((c: any) => (user.assigned_courses || []).includes(c.id));
        const courseIds = mentorCourses.map((c: any) => c.id);

        const allEnrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
        
        // Find enrollments for mentor's courses where progress is 100
        const eligible = allEnrollments.filter((e: any) => 
          courseIds.includes(e.course_id) && 
          e.progress === 100
        );

        // Map course names and user names
        const mockUsers = JSON.parse(localStorage.getItem('mock_users') || '[]');
        
        const mappedStudents = eligible.map((e: any) => {
          const studentProfile = mockUsers.find((u: any) => u.id === e.student_id) || { name: 'Unknown Student', email: 'unknown@example.com' };
          const courseData = mentorCourses.find((c: any) => c.id === e.course_id) || { title: 'Unknown Course' };
          return {
            ...e,
            profiles: { name: studentProfile.name, email: studentProfile.email },
            courses: { title: courseData.title }
          };
        });

        setStudents(mappedStudents);
        setIsLoading(false);
        return;
      }

      // Live Supabase implementation (if applicable)
      const { data: courses } = await supabase.from('courses').select('id').eq('mentor_id', user.id);
      const courseIds = courses?.map(c => c.id) || [];

      if (courseIds.length > 0) {
        const { data } = await supabase
          .from('enrollments')
          .select('id, student_id, course_id, status, progress, completed_at, certificate_status, profiles(name, email), courses(title)')
          .in('course_id', courseIds)
          .eq('progress', 100);
          
        if (data) {
          setStudents(data);
        }
      }
    } catch (error) {
      console.error('Error fetching eligible students:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async (enrollmentId: string, action: 'approved' | 'rejected') => {
    setIsUpdating(enrollmentId);
    
    try {
      const targetStudent = students.find(s => s.id === enrollmentId);
      
      if (IS_MOCK_SUPABASE) {
        const allEnrollments = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
        const updated = allEnrollments.map((e: any) => {
          if (e.id === enrollmentId) {
            return { ...e, certificate_status: action };
          }
          return e;
        });
        localStorage.setItem('mock_enrollments', JSON.stringify(updated));
        
        if (action === 'approved' && targetStudent) {
          const mockCerts = JSON.parse(localStorage.getItem('mock_certificates') || '[]');
          const randomId = Math.random().toString(16).substring(2, 6).toUpperCase();
          const newCert = {
            id: crypto.randomUUID(),
            certificate_id: `CERT-CO-${randomId}-NEW`,
            recipient_name: targetStudent.profiles?.name || 'Unknown Student',
            recipient_email: targetStudent.profiles?.email || 'student@example.com',
            type: 'COURSE',
            program: targetStudent.courses?.title || 'Unknown Course',
            verification_status: 'valid',
            issued_at: new Date().toISOString(),
            student_id: targetStudent.student_id,
            course_id: targetStudent.course_id
          };
          localStorage.setItem('mock_certificates', JSON.stringify([newCert, ...mockCerts]));
        }
        
        // Update local state
        setStudents(students.map(s => s.id === enrollmentId ? { ...s, certificate_status: action } : s));
        setIsUpdating(null);
        return;
      }

      // Live Supabase update
      await supabase
        .from('enrollments')
        .update({ certificate_status: action })
        .eq('id', enrollmentId);
        
      if (action === 'approved' && targetStudent) {
        const randomId = Math.random().toString(16).substring(2, 6).toUpperCase();
        const newCert = {
          certificate_id: `CERT-CO-${randomId}-NEW`,
          recipient_name: targetStudent.profiles?.name || 'Unknown Student',
          recipient_email: targetStudent.profiles?.email || 'student@example.com',
          type: 'COURSE',
          program: targetStudent.courses?.title || 'Unknown Course',
          verification_status: 'valid',
          student_id: targetStudent.student_id,
          course_id: targetStudent.course_id
        };
        await supabase.from('certificates').insert([newCert]);
      }
        
      setStudents(students.map(s => s.id === enrollmentId ? { ...s, certificate_status: action } : s));
    } catch (error) {
      console.error('Error verifying certificate:', error);
    } finally {
      setIsUpdating(null);
    }
  };

  const filteredStudents = students.filter(s => 
    s.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.courses?.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Certificate Verification</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve certificates for students who have completed 100% of their course.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400" size={18} />
            </div>
            <input
              type="text"
              placeholder="Search students or courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 block w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-600" size={32} />
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
              <Award className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="mt-1 text-sm text-gray-500">No students currently require certificate verification.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-sm">
                  <th className="py-3 px-6 font-medium text-gray-500">Student Name</th>
                  <th className="py-3 px-6 font-medium text-gray-500">Course</th>
                  <th className="py-3 px-6 font-medium text-gray-500">Progress</th>
                  <th className="py-3 px-6 font-medium text-gray-500">Status</th>
                  <th className="py-3 px-6 font-medium text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">{student.profiles?.name || 'Unknown Student'}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">
                      {student.courses?.title || 'Unknown Course'}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        100% Completed
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {student.certificate_status === 'approved' ? (
                        <span className="flex items-center text-sm text-green-600 font-medium">
                          <CheckCircle size={16} className="mr-1" /> Verified
                        </span>
                      ) : student.certificate_status === 'rejected' ? (
                        <span className="flex items-center text-sm text-red-600 font-medium">
                          <XCircle size={16} className="mr-1" /> Rejected
                        </span>
                      ) : (
                        <span className="text-sm text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded-md">
                          Pending Verification
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right space-x-2">
                      {student.certificate_status !== 'approved' && student.certificate_status !== 'rejected' && (
                        <>
                          <button
                            onClick={() => handleVerify(student.id, 'rejected')}
                            disabled={isUpdating === student.id}
                            className="inline-flex items-center px-3 py-1 border border-red-300 text-sm leading-5 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleVerify(student.id, 'approved')}
                            disabled={isUpdating === student.id}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          >
                            {isUpdating === student.id ? <Loader2 size={16} className="animate-spin" /> : 'Verify'}
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
