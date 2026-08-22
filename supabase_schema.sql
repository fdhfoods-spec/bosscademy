-- BOSS Academy Supabase Schema

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Mentor', 'Student')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  avatar TEXT,
  phone TEXT,
  department TEXT,
  course TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Courses Table
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  video_url TEXT,
  category TEXT,
  duration TEXT,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Draft' CHECK (status IN ('Draft', 'Published', 'Archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Modules Table
CREATE TABLE modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Lessons Table
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  module_id UUID REFERENCES modules(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  video_url TEXT,
  duration TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Create Enrollments Table
CREATE TABLE enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, course_id) -- Prevent duplicate enrollments
);

-- 6. Create Lesson Progress Table
CREATE TABLE lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, lesson_id)
);

-- 7. Create Certificates Table
CREATE TABLE certificates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  certificate_id TEXT UNIQUE NOT NULL,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_name TEXT,
  recipient_email TEXT,
  type TEXT,
  program TEXT,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  verification_status TEXT DEFAULT 'valid' CHECK (verification_status IN ('valid', 'revoked'))
);

-------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;


-- PROFILES RLS
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (get_user_role() = 'Admin');
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- COURSES RLS
CREATE POLICY "Admins can manage all courses" ON courses FOR ALL USING (get_user_role() = 'Admin');
CREATE POLICY "Mentors can manage own courses" ON courses FOR ALL USING (get_user_role() = 'Mentor' AND mentor_id = auth.uid());
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (status = 'Published');

-- MODULES RLS
CREATE POLICY "Admins can manage all modules" ON modules FOR ALL USING (get_user_role() = 'Admin');
CREATE POLICY "Mentors can manage modules of their courses" ON modules FOR ALL USING (
  get_user_role() = 'Mentor' AND 
  EXISTS (SELECT 1 FROM courses WHERE id = modules.course_id AND mentor_id = auth.uid())
);
CREATE POLICY "Students can view modules of enrolled courses" ON modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM enrollments WHERE course_id = modules.course_id AND student_id = auth.uid())
);

-- LESSONS RLS
CREATE POLICY "Admins can manage all lessons" ON lessons FOR ALL USING (get_user_role() = 'Admin');
CREATE POLICY "Mentors can manage lessons of their courses" ON lessons FOR ALL USING (
  get_user_role() = 'Mentor' AND 
  EXISTS (SELECT 1 FROM modules JOIN courses ON modules.course_id = courses.id WHERE modules.id = lessons.module_id AND courses.mentor_id = auth.uid())
);
CREATE POLICY "Students can view lessons of enrolled courses" ON lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM modules JOIN enrollments ON modules.course_id = enrollments.course_id WHERE modules.id = lessons.module_id AND enrollments.student_id = auth.uid())
);

-- ENROLLMENTS RLS
CREATE POLICY "Admins can manage all enrollments" ON enrollments FOR ALL USING (get_user_role() = 'Admin');
CREATE POLICY "Mentors can view enrollments for their courses" ON enrollments FOR SELECT USING (
  get_user_role() = 'Mentor' AND 
  EXISTS (SELECT 1 FROM courses WHERE id = enrollments.course_id AND mentor_id = auth.uid())
);
CREATE POLICY "Students can manage own enrollments" ON enrollments FOR ALL USING (student_id = auth.uid());

-- LESSON PROGRESS RLS
CREATE POLICY "Admins can manage all lesson progress" ON lesson_progress FOR ALL USING (get_user_role() = 'Admin');
CREATE POLICY "Students can manage own lesson progress" ON lesson_progress FOR ALL USING (student_id = auth.uid());

-- CERTIFICATES RLS
CREATE POLICY "Admins can manage all certificates" ON certificates FOR ALL USING (get_user_role() = 'Admin');
CREATE POLICY "Mentors can view certificates for their courses" ON certificates FOR SELECT USING (
  get_user_role() = 'Mentor' AND mentor_id = auth.uid()
);
CREATE POLICY "Students can view own certificates" ON certificates FOR SELECT USING (student_id = auth.uid());

-------------------------------------------------------------------
-- TRIGGER FOR UPDATING 'updated_at' COLUMNS
-------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_courses_modtime BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
