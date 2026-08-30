import { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { getMockCourses, getMockEnrollments, getMockUsers } from '../../lib/mockData';

interface EnrolledStudent {
  id: string; // enrollment id
  studentName: string;
  studentEmail: string;
  courseName: string;
  progress: number;
  lastActivity: string;
}

export default function MentorStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState<EnrolledStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchStudents() {
      if (!user?.id) return;
      
      try {
        if (IS_MOCK_SUPABASE) {
          const allCourses = getMockCourses();
          const allEnrollments = getMockEnrollments();
          const allUsers = getMockUsers();
          
          // Find mentor's courses
          const mentorCourses = allCourses.filter(c => c.mentor_id === user.id);
          const courseIds = mentorCourses.map(c => c.id);
          
          // Find enrollments for these courses
          const relevantEnrollments = allEnrollments.filter(e => courseIds.includes(e.course_id));
          
          // Map to student data
          const mappedStudents = relevantEnrollments.map(enr => {
            const studentInfo = allUsers.find(u => u.id === enr.student_id);
            const courseInfo = mentorCourses.find(c => c.id === enr.course_id);
            
            return {
              id: enr.id,
              studentName: studentInfo?.name || 'Unknown Student',
              studentEmail: studentInfo?.email || 'N/A',
              courseName: courseInfo?.title || 'Unknown Course',
              progress: enr.progress || 0,
              lastActivity: enr.enrolled_at 
            };
          });
          
          setStudents(mappedStudents);
          setIsLoading(false);
          return;
        }

        // Live Mode
        const { data: coursesData } = await supabase
          .from('courses')
          .select('id, title')
          .eq('mentor_id', user.id);
          
        const courses = coursesData || [];
        const courseIds = courses.map(c => c.id);
        
        if (courseIds.length === 0) {
          setStudents([]);
          setIsLoading(false);
          return;
        }

        const { data: enrData } = await supabase
          .from('enrollments')
          .select('id, student_id, status, enrolled_at, progress, courses(title)')
          .in('course_id', courseIds)
          .order('enrolled_at', { ascending: false });
          
        // Fetch profiles via proxy to bypass RLS for Mentors
        let allProfiles: any[] = [];
        try {
          const profilesRes = await fetch('/api/get-users');
          if (profilesRes.ok) {
            const profilesData = await profilesRes.json();
            allProfiles = profilesData.profiles || [];
          }
        } catch (e) {
          console.error("Failed to fetch profiles for names", e);
        }
        
        const profileMap = new Map(allProfiles.map(p => [p.id, p]));
          
        const mapped = (enrData || []).map((enr: any) => {
          const profile = profileMap.get(enr.student_id);
          return {
            id: enr.id,
            studentName: profile?.name || 'Unknown',
            studentEmail: profile?.email || 'N/A',
            courseName: enr.courses?.title || 'Unknown',
            progress: enr.progress || 0,
            lastActivity: enr.enrolled_at
          };
        });
        
        setStudents(mapped);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchStudents();
  }, [user?.id, user?.assigned_courses]);

  const filteredStudents = students.filter(s => 
    s.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.courseName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Enrolled Students Course</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by student name, email, or course (e.g. SAP)..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500" 
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-48">
            <Loader2 className="animate-spin text-blue-600" size={40} />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Activity</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-500">
                      No students found for the selected courses.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                        <div className="text-sm text-gray-500">{student.studentEmail}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {student.courseName}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-[100px] mb-1">
                          <div className="bg-green-600 h-2.5 rounded-full" style={{ width: `${student.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500">{student.progress}% Done</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(student.lastActivity).toLocaleDateString()}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
