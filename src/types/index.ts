export type Role = 'Admin' | 'Mentor' | 'Student';

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: Role;
  status: 'active' | 'inactive';
  avatar?: string;
  phone?: string;
  department?: string;
  course?: string;
  major_course?: string;
  assigned_courses?: string[];
  employee_id?: string;
  payment_status?: 'pending' | 'verified' | 'failed';
  created_at: string;
  updated_at: string;
  password?: string | null;
  reset_token?: string | null;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail?: string;
  video_url?: string;
  category: string;
  duration: string;
  mentor_id?: string; // Kept optional for backward compatibility
  status: 'Active' | 'Inactive' | 'Published' | 'Draft';
  created_at: string;
  updated_at: string;
}

export interface Enrollment {
  id: string;
  student_id: string;
  course_id: string;
  enrolled_at: string;
  status: 'active' | 'completed';
  progress: number;
  completed_at?: string;
}

export interface Certificate {
  id: string;
  certificate_id: string;
  student_id?: string;
  course_id?: string;
  mentor_id?: string;
  recipient_name?: string;
  recipient_email?: string;
  type?: string;
  program?: string;
  issued_at: string;
  verification_status: 'valid' | 'revoked';
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  sort_order: number;
  created_at: string;
}

export interface Lesson {
  id: string;
  module_id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  duration?: string;
  sort_order: number;
  created_at: string;
}
