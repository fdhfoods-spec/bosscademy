
import { NavLink, useNavigate } from 'react-router-dom';
import { LogOut, Home, Book, Users, Award, BookOpen, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import type { Role } from '../types';

interface SidebarProps {
  role: Role;
  isOpen?: boolean;
  setIsOpen?: (isOpen: boolean) => void;
}

export default function Sidebar({ role, isOpen, setIsOpen }: SidebarProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const adminLinks = [
    { to: '/admin/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/admin/courses', icon: <Book size={20} />, label: 'Courses' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/admin/certificates', icon: <Award size={20} />, label: 'Certificates' },
  ];

  const mentorLinks = [
    { to: '/mentor/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/mentor/courses', icon: <Book size={20} />, label: 'My Courses' },
    { to: '/mentor/users', icon: <Users size={20} />, label: 'Students' },
    { to: '/mentor/certificates', icon: <Award size={20} />, label: 'Certificates' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: <Home size={20} />, label: 'Dashboard' },
    { to: '/student/enrollment', icon: <BookOpen size={20} />, label: 'Enrollment' },
    { to: '/student/certificates', icon: <Award size={20} />, label: 'Certificates' },
  ];

  const links = role === 'Admin' ? adminLinks : role === 'Mentor' ? mentorLinks : studentLinks;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/80 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsOpen && setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 bg-gray-950">
          <div className="flex items-center">
            <BookOpen className="text-blue-500 mr-2" size={24} />
            <span className="text-xl font-bold tracking-wider text-white">BOSS</span>
            <span className="text-xl text-blue-500 ml-1">Academy</span>
          </div>
          <button 
            className="md:hidden text-gray-400 hover:text-white" 
            onClick={() => setIsOpen && setIsOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen && setIsOpen(false)}
              className={({ isActive }) =>
                `group flex items-center px-3 py-2.5 text-sm font-medium rounded-md transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }`
              }
            >
              <div className="mr-3">{link.icon}</div>
              {link.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-gray-800">
        {role === 'Mentor' && user && (
          <div className="mb-4 p-3 bg-gray-800 rounded-lg">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-400 mt-1 truncate">Dept: {user.department || 'N/A'}</p>
            <p className="text-xs text-blue-400 mt-0.5 truncate">Course: {user.course || 'N/A'}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={20} className="mr-3" />
          Logout
        </button>
      </div>
      </div>
    </>
  );
}
