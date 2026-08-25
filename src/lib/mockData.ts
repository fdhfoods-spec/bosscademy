import type { Course, User, Enrollment } from '../types';

export const initializeMockData = () => {
  let courses: Course[] = JSON.parse(localStorage.getItem('mock_courses') || 'null');
  let users: User[] = JSON.parse(localStorage.getItem('mock_users') || 'null');
  let enrollments: Enrollment[] = JSON.parse(localStorage.getItem('mock_enrollments') || 'null');

  if (!courses) {
    courses = [
      {
        id: '1',
        title: 'PCB Design',
        description: 'Learn the fundamentals of PCB Design...',
        category: 'Electronics',
        status: 'Published',
        video_url: '',
        mentor_id: 'mentor-1',
        duration: '6 Weeks',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '2',
        title: 'SAP',
        description: 'Comprehensive SAP training...',
        category: 'Business',
        status: 'Published',
        video_url: '',
        mentor_id: 'mentor-2',
        duration: '8 Weeks',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      {
        id: '3',
        title: 'Cyber Security',
        description: 'Master Cyber Security concepts...',
        category: 'IT',
        status: 'Published',
        video_url: '',
        mentor_id: 'mentor-3',
        duration: '10 Weeks',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];
    localStorage.setItem('mock_courses', JSON.stringify(courses));
  }

  if (!users) {
    users = [
      {
        id: 'mentor-1',
        name: 'John Doe',
        username: 'MTR1001',
        employee_id: 'MTR1001',
        email: 'mentor@bossacademy.com',
        role: 'Mentor',
        status: 'active',
        assigned_courses: ['1'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password: 'password123'
      },
      {
        id: 'student-1',
        name: 'Jane Smith',
        username: 'student01',
        email: 'student01@example.com',
        role: 'Student',
        status: 'active',
        assigned_courses: ['1', '2'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password: 'password123'
      },
      {
        id: 'admin-1',
        name: 'Admin Boss',
        username: 'admin',
        email: 'admin@bossacademy.com',
        role: 'Admin',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        password: 'password123'
      }
    ];
    localStorage.setItem('mock_users', JSON.stringify(users));
  }

  if (!enrollments) {
    enrollments = [
      {
        id: 'enr-1',
        student_id: 'student-1',
        course_id: '1',
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 25
      },
      {
        id: 'enr-2',
        student_id: 'student-1',
        course_id: '2',
        enrolled_at: new Date().toISOString(),
        status: 'active',
        progress: 10
      }
    ];
    localStorage.setItem('mock_enrollments', JSON.stringify(enrollments));
  }

  return { courses, users, enrollments };
};

// Helper functions to get/set lists easily
export const getMockCourses = (): Course[] => JSON.parse(localStorage.getItem('mock_courses') || '[]');
export const setMockCourses = (courses: Course[]) => localStorage.setItem('mock_courses', JSON.stringify(courses));

export const getMockUsers = (): User[] => JSON.parse(localStorage.getItem('mock_users') || '[]');
export const setMockUsers = (users: User[]) => localStorage.setItem('mock_users', JSON.stringify(users));

export const getMockEnrollments = (): Enrollment[] => JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
export const setMockEnrollments = (enr: Enrollment[]) => localStorage.setItem('mock_enrollments', JSON.stringify(enr));

export type CurriculumItem = {
  id: string;
  course_id: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'PPT';
  duration?: string;
};

export const getMockCurriculum = (): CurriculumItem[] => JSON.parse(localStorage.getItem('mock_curriculum') || '[]');
export const setMockCurriculum = (items: CurriculumItem[]) => localStorage.setItem('mock_curriculum', JSON.stringify(items));

// Helper to auto-sync student enrollments based on their assigned_courses
export const syncStudentEnrollments = (studentId: string, assignedCourseIds: string[]) => {
  let enrollments = getMockEnrollments();
  // Remove enrollments for courses they are no longer assigned to
  enrollments = enrollments.filter(e => e.student_id !== studentId || assignedCourseIds.includes(e.course_id));
  
  // Add missing enrollments
  const existingEnrolledIds = enrollments.filter(e => e.student_id === studentId).map(e => e.course_id);
  const newCourseIds = assignedCourseIds.filter(id => !existingEnrolledIds.includes(id));
  
  for (const cid of newCourseIds) {
    enrollments.push({
      id: crypto.randomUUID(),
      student_id: studentId,
      course_id: cid,
      enrolled_at: new Date().toISOString(),
      status: 'active',
      progress: 0
    });
  }
  setMockEnrollments(enrollments);
};
