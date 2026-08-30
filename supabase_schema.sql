-- BOSS Academy Supabase Schema (Idempotent - Safe to run multiple times)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
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
  major_course TEXT,
  employee_id TEXT,
  payment_status TEXT CHECK (payment_status IN ('pending', 'verified', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  thumbnail TEXT,
  video_url TEXT,
  category TEXT,
  duration TEXT,
  mentor_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'Draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Modules Table
CREATE TABLE IF NOT EXISTS modules (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Lessons Table
CREATE TABLE IF NOT EXISTS lessons (
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
CREATE TABLE IF NOT EXISTS enrollments (
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
CREATE TABLE IF NOT EXISTS lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(student_id, lesson_id)
);

-- 7. Create Certificates Table
CREATE TABLE IF NOT EXISTS certificates (
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

-- 8. Create Payments Table
CREATE TABLE IF NOT EXISTS payments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  student_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  order_id TEXT NOT NULL UNIQUE,
  payment_id TEXT,
  signature TEXT,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'successful', 'failed', 'refunded')),
  payment_method TEXT,
  payment_gateway TEXT DEFAULT 'Razorpay',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
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
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Helper function to get current user role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS TEXT AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER;


-- PROFILES RLS
DROP POLICY IF EXISTS "Admins can manage all profiles" ON profiles;
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- COURSES RLS
DROP POLICY IF EXISTS "Admins can manage all courses" ON courses;
CREATE POLICY "Admins can manage all courses" ON courses FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Mentors can manage own courses" ON courses;
CREATE POLICY "Mentors can manage own courses" ON courses FOR ALL USING (get_user_role() = 'Mentor' AND mentor_id = auth.uid());
DROP POLICY IF EXISTS "Anyone can view published courses" ON courses;
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (status = 'Published' OR status = 'Active');

-- MODULES RLS
DROP POLICY IF EXISTS "Admins can manage all modules" ON modules;
CREATE POLICY "Admins can manage all modules" ON modules FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Mentors can manage modules of their courses" ON modules;
CREATE POLICY "Mentors can manage modules of their courses" ON modules FOR ALL USING (
  get_user_role() = 'Mentor' AND 
  EXISTS (SELECT 1 FROM courses WHERE id = modules.course_id AND mentor_id = auth.uid())
);
DROP POLICY IF EXISTS "Students can view modules of enrolled courses" ON modules;
CREATE POLICY "Students can view modules of enrolled courses" ON modules FOR SELECT USING (
  EXISTS (SELECT 1 FROM enrollments WHERE course_id = modules.course_id AND student_id = auth.uid())
);

-- LESSONS RLS
DROP POLICY IF EXISTS "Admins can manage all lessons" ON lessons;
CREATE POLICY "Admins can manage all lessons" ON lessons FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Mentors can manage lessons of their courses" ON lessons;
CREATE POLICY "Mentors can manage lessons of their courses" ON lessons FOR ALL USING (
  get_user_role() = 'Mentor' AND 
  EXISTS (SELECT 1 FROM modules JOIN courses ON modules.course_id = courses.id WHERE modules.id = lessons.module_id AND courses.mentor_id = auth.uid())
);
DROP POLICY IF EXISTS "Students can view lessons of enrolled courses" ON lessons;
CREATE POLICY "Students can view lessons of enrolled courses" ON lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM modules JOIN enrollments ON modules.course_id = enrollments.course_id WHERE modules.id = lessons.module_id AND enrollments.student_id = auth.uid())
);

-- ENROLLMENTS RLS
DROP POLICY IF EXISTS "Admins can manage all enrollments" ON enrollments;
CREATE POLICY "Admins can manage all enrollments" ON enrollments FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Mentors can view enrollments for their courses" ON enrollments;
CREATE POLICY "Mentors can view enrollments for their courses" ON enrollments FOR SELECT USING (
  get_user_role() = 'Mentor' AND 
  EXISTS (SELECT 1 FROM courses WHERE id = enrollments.course_id AND mentor_id = auth.uid())
);
DROP POLICY IF EXISTS "Students can manage own enrollments" ON enrollments;
CREATE POLICY "Students can manage own enrollments" ON enrollments FOR ALL USING (student_id = auth.uid());

-- LESSON PROGRESS RLS
DROP POLICY IF EXISTS "Admins can manage all lesson progress" ON lesson_progress;
CREATE POLICY "Admins can manage all lesson progress" ON lesson_progress FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Students can manage own lesson progress" ON lesson_progress;
CREATE POLICY "Students can manage own lesson progress" ON lesson_progress FOR ALL USING (student_id = auth.uid());

-- CERTIFICATES RLS
DROP POLICY IF EXISTS "Admins can manage all certificates" ON certificates;
CREATE POLICY "Admins can manage all certificates" ON certificates FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Mentors can view certificates for their courses" ON certificates;
CREATE POLICY "Mentors can view certificates for their courses" ON certificates FOR SELECT USING (
  get_user_role() = 'Mentor' AND mentor_id = auth.uid()
);
DROP POLICY IF EXISTS "Students can view own certificates" ON certificates;
CREATE POLICY "Students can view own certificates" ON certificates FOR SELECT USING (student_id = auth.uid());

-- PAYMENTS RLS
DROP POLICY IF EXISTS "Admins can manage all payments" ON payments;
CREATE POLICY "Admins can manage all payments" ON payments FOR ALL USING (get_user_role() = 'Admin');
DROP POLICY IF EXISTS "Students can manage own payments" ON payments;
CREATE POLICY "Students can manage own payments" ON payments FOR ALL USING (student_id = auth.uid());

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

DROP TRIGGER IF EXISTS update_profiles_modtime ON profiles;
CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_courses_modtime ON courses;
CREATE TRIGGER update_courses_modtime BEFORE UPDATE ON courses FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
DROP TRIGGER IF EXISTS update_payments_modtime ON payments;
CREATE TRIGGER update_payments_modtime BEFORE UPDATE ON payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-------------------------------------------------------------------
-- PUBLIC FORMS (Registrations & Trainer Applications)
-------------------------------------------------------------------

-- 9. Create Registrations Table (Public Applications)
CREATE TABLE IF NOT EXISTS registrations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT NOT NULL,
  education_profession TEXT NOT NULL,
  program_interested TEXT NOT NULL,
  organization TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. Create Trainer Applications Table
CREATE TABLE IF NOT EXISTS trainer_applications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT NOT NULL,
  experience_years INTEGER NOT NULL DEFAULT 0,
  area_of_expertise TEXT NOT NULL,
  preferred_type TEXT NOT NULL,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Security for Public Forms
ALTER TABLE registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainer_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit registration" ON registrations;
CREATE POLICY "Anyone can submit registration" ON registrations FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view registrations" ON registrations;
CREATE POLICY "Admins can view registrations" ON registrations FOR SELECT USING (get_user_role() = 'Admin');

DROP POLICY IF EXISTS "Anyone can submit trainer application" ON trainer_applications;
CREATE POLICY "Anyone can submit trainer application" ON trainer_applications FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Admins can view trainer applications" ON trainer_applications;
CREATE POLICY "Admins can view trainer applications" ON trainer_applications FOR SELECT USING (get_user_role() = 'Admin');
