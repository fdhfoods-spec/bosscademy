import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './pages/auth/Login';
import MentorRegister from './pages/mentor/Register';
import StudentRegister from './pages/student/Register';
import StudentPayment from './pages/student/Payment';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import type { Role } from './types';
import DashboardLayout from './layouts/DashboardLayout';
import PublicLayout from './layouts/PublicLayout';
import Home from './pages/public/Home';
import Programs from './pages/public/Programs';
import Partnerships from './pages/public/Partnerships';
import Contact from './pages/public/Contact';
import Trainers from './pages/public/Trainers';

import AdminDashboard from './pages/admin/Dashboard';
import AdminCourses from './pages/admin/Courses';
import CourseContent from './pages/admin/CourseContent';
import CoursePreview from './pages/admin/CoursePreview';
import AdminUsers from './pages/admin/Users';
import AdminCertificates from './pages/admin/Certificates';

// Mentor Pages
import MentorDashboard from './pages/mentor/Dashboard';
import MentorCourses from './pages/mentor/Courses';
import MentorStudents from './pages/mentor/Students';
import MentorCertificates from './pages/mentor/Certificates';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentCertificates from './pages/student/Certificates';
import StudentCourseView from './pages/student/CourseView';
import StudentPaymentHistory from './pages/student/PaymentHistory';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    if (user.role === 'Admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'Mentor') return <Navigate to="/mentor/dashboard" replace />;
    return <Navigate to="/student/dashboard" replace />;
  }

  return <>{children}</>;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Pages */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/programs" element={<Programs />} />
        <Route path="/partnerships" element={<Partnerships />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/trainers" element={<Trainers />} />
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/mentor/login" element={<Navigate to="/login" replace />} />
      <Route path="/student/login" element={<Navigate to="/login" replace />} />
      <Route path="/mentor/register" element={<MentorRegister />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['Admin']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="courses" element={<AdminCourses />} />
        <Route path="courses/:id/content" element={<CourseContent />} />
        <Route path="courses/:id/preview" element={<CoursePreview />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="certificates" element={<AdminCertificates />} />
      </Route>

      {/* Mentor Routes */}
      <Route path="/mentor" element={
        <ProtectedRoute allowedRoles={['Mentor']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<MentorDashboard />} />
        <Route path="courses" element={<MentorCourses />} />
        <Route path="users" element={<MentorStudents />} />
        <Route path="certificates" element={<MentorCertificates />} />
      </Route>

      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="certificates" element={<StudentCertificates />} />
        <Route path="payment" element={<StudentPayment />} />
        <Route path="payments" element={<StudentPaymentHistory />} />
      </Route>

      {/* Student Full Screen Routes */}
      <Route path="/student/courses/:courseId" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <StudentCourseView />
        </ProtectedRoute>
      } />

      {/* Catch-all to clear console routing errors */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
