import { Bell, Search, User, Menu } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function Header({ setSidebarOpen }: { setSidebarOpen?: (val: boolean) => void }) {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      <div className="flex items-center">
        {setSidebarOpen && (
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-4 text-gray-500 hover:text-gray-700 md:hidden focus:outline-none"
          >
            <Menu size={24} />
          </button>
        )}
        {/* Search removed per user request */}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold overflow-hidden border border-blue-200">
            {user?.name?.charAt(0).toUpperCase() || <User size={16} />}
          </div>
        </div>
      </div>
    </header>
  );
}
