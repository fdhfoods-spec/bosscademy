import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AdminLogin from './pages/admin/Login';
import MentorLogin from './pages/mentor/Login';
import MentorRegister from './pages/mentor/Register';
import StudentLogin from './pages/student/Login';
import StudentRegister from './pages/student/Register';
import StudentPayment from './pages/student/Payment';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import type { Role } from './types';
import DashboardLayout from './layouts/DashboardLayout';
import Landing from './pages/Landing';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminCourses from './pages/admin/Courses';
import AdminUsers from './pages/admin/Users';
import AdminCertificates from './pages/admin/Certificates';

// Mentor Pages
import MentorDashboard from './pages/mentor/Dashboard';
import MentorCourses from './pages/mentor/Courses';
import MentorStudents from './pages/mentor/Students';
import MentorCertificates from './pages/mentor/Certificates';

// Student Pages
import StudentDashboard from './pages/student/Dashboard';
import StudentEnrollment from './pages/student/Enrollment';
import StudentCertificates from './pages/student/Certificates';
import StudentCourseView from './pages/student/CourseView';

const ProtectedRoute = ({ children, allowedRoles }: { children: React.ReactNode, allowedRoles: Role[] }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  if (!user) {
    return <Navigate to="/student/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <div className="flex h-screen flex-col items-center justify-center">
      <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
      <p className="mt-2 text-gray-600">You do not have permission to access this page.</p>
      <button 
        onClick={() => {
          if (user.role === 'Admin') window.location.href = '/admin/dashboard';
          else if (user.role === 'Mentor') window.location.href = '/mentor/dashboard';
          else window.location.href = '/student/dashboard';
        }}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
      >
        Go to Dashboard
      </button>
    </div>;
  }

  return <>{children}</>;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Navigate to="/student/login" replace />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/mentor/login" element={<MentorLogin />} />
      <Route path="/mentor/register" element={<MentorRegister />} />
      <Route path="/student/login" element={<StudentLogin />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/payment" element={<StudentPayment />} />
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

      {/* Student Routes */}
      <Route path="/student" element={
        <ProtectedRoute allowedRoles={['Student']}>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={<StudentDashboard />} />
        <Route path="enrollment" element={<StudentEnrollment />} />
        <Route path="certificates" element={<StudentCertificates />} />
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
