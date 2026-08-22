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
        {/* Search */}
        <div className="hidden md:flex relative text-gray-400 focus-within:text-gray-600">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all"
            placeholder="Search..."
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="text-gray-400 hover:text-gray-500 relative p-2">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white" />
        </button>
        
        <div className="flex items-center space-x-3 border-l pl-4 border-gray-200">
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
