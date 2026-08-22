import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Plus, Users, UserCog, Phone, BookOpen, Key } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import type { User, Course } from '../../types';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [activeTab, setActiveTab] = useState<'Mentor' | 'Student'>('Mentor');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Student fields
  const [newStudent, setNewStudent] = useState({ 
    name: '', email: '', phone: '', course: '', status: 'active' as 'active' | 'inactive' 
  });
  
  // Mentor fields
  const [newMentor, setNewMentor] = useState({
    name: '', employee_id: '', major_course: '', assigned_courses: [] as string[], status: 'active' as 'active' | 'inactive'
  });
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const generateEmployeeId = (existingUsers: User[]) => {
    const mentorIds = existingUsers
      .filter(u => u.role === 'Mentor' && u.employee_id && u.employee_id.startsWith('MTR'))
      .map(u => parseInt(u.employee_id!.replace('MTR', ''), 10))
      .filter(id => !isNaN(id));
      
    const maxId = mentorIds.length > 0 ? Math.max(...mentorIds) : 1000;
    return `MTR${maxId + 1}`;
  };

  const fetchData = async () => {
    setIsLoading(true);
    
    if (IS_MOCK_SUPABASE) {
      const storedCourses = localStorage.getItem('mock_courses');
      const allCourses: Course[] = storedCourses ? JSON.parse(storedCourses) : [];
      setCourses(allCourses);

      const stored = localStorage.getItem('mock_users');
      if (stored) {
        setUsers(JSON.parse(stored));
      } else {
        const initialUsers: User[] = [
          { id: '1', name: 'John Doe', username: 'MTR1001', employee_id: 'MTR1001', major_course: 'Web Development', assigned_courses: allCourses.length > 0 ? [allCourses[0].id] : [], email: 'mentor@bossacademy.com', phone: '123-456-7890', role: 'Mentor', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
          { id: '2', name: 'Jane Smith', username: 'student01', email: 'student01@example.com', phone: '987-654-3210', course: allCourses.length > 0 ? allCourses[0].id : '', role: 'Student', status: 'active', created_at: new Date().toISOString(), updated_at: new Date().toISOString() }
        ];
        localStorage.setItem('mock_users', JSON.stringify(initialUsers));
        setUsers(initialUsers);
      }
      setIsLoading(false);
      return;
    }

    const { data: profilesData } = await supabase.from('profiles').select('*').in('role', ['Mentor', 'Student']).order('created_at', { ascending: false });
    if (profilesData) setUsers(profilesData as User[]);
    
    const { data: coursesData } = await supabase.from('courses').select('*');
    if (coursesData) setCourses(coursesData as Course[]);

    setIsLoading(false);
  };

  const handleVerifyPayment = (userId: string) => {
    if (IS_MOCK_SUPABASE) {
      const updated = users.map(u => u.id === userId ? { ...u, payment_status: 'verified' } as User : u);
      localStorage.setItem('mock_users', JSON.stringify(updated));
      setUsers(updated);
      showNotification('Payment verified successfully. Student account activated.', 'success');
      return;
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    u.role === activeTab &&
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
     (u.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    const newProfile: User = {
      id: crypto.randomUUID(), 
      name: newStudent.name,
      username: newStudent.email.split('@')[0] + Math.floor(Math.random()*1000),
      email: newStudent.email,
      phone: newStudent.phone || undefined,
      course: newStudent.course,
      role: 'Student',
      status: newStudent.status,
      payment_status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (IS_MOCK_SUPABASE) {
      const updated = [newProfile, ...users];
      setUsers(updated);
      localStorage.setItem('mock_users', JSON.stringify(updated));
      setIsAddModalOpen(false);
      setNewStudent({ name: '', email: '', phone: '', course: '', status: 'active' });
      showNotification('Student added successfully!', 'success');
    }
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMentor.assigned_courses.length === 0) {
      showNotification('Please assign at least one course.', 'error');
      return;
    }
    
    const newProfile: User = {
      id: crypto.randomUUID(),
      name: newMentor.name,
      username: newMentor.employee_id, // They log in with this
      employee_id: newMentor.employee_id,
      email: `${newMentor.employee_id.toLowerCase()}@bossacademy.com`,
      password: '123456', // Default password per specification assumption
      major_course: newMentor.major_course,
      assigned_courses: newMentor.assigned_courses,
      role: 'Mentor',
      status: newMentor.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (IS_MOCK_SUPABASE) {
      const updated = [newProfile, ...users];
      setUsers(updated);
      localStorage.setItem('mock_users', JSON.stringify(updated));
      setIsAddModalOpen(false);
      setNewMentor({ name: '', employee_id: '', major_course: '', assigned_courses: [], status: 'active' });
      showNotification('Mentor created successfully! Default password is "123456".', 'success');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (IS_MOCK_SUPABASE) {
      const updated = users.map(u => u.id === editingUser.id ? { ...editingUser, updated_at: new Date().toISOString() } : u);
      setUsers(updated);
      localStorage.setItem('mock_users', JSON.stringify(updated));
      setEditingUser(null);
      showNotification(`${editingUser.role} updated successfully!`, 'success');
    }
  };

  const confirmDelete = async () => {
    if (deletingUserId) {
      if (IS_MOCK_SUPABASE) {
        const updated = users.filter(u => u.id !== deletingUserId);
        setUsers(updated);
        localStorage.setItem('mock_users', JSON.stringify(updated));
        setDeletingUserId(null);
        showNotification('User deleted successfully!', 'success');
      }
    }
  };

  const getCourseName = (id: string) => {
    return courses.find(c => c.id === id)?.title || id;
  };
  
  const getCourseNames = (ids?: string[]) => {
    if (!ids || ids.length === 0) return 'None assigned';
    return ids.map(id => getCourseName(id)).join(', ');
  };

  const toggleCourseAssignment = (courseId: string, isEditing: boolean = false) => {
    if (isEditing && editingUser) {
      const current = editingUser.assigned_courses || [];
      const updated = current.includes(courseId) ? current.filter(id => id !== courseId) : [...current, courseId];
      setEditingUser({ ...editingUser, assigned_courses: updated });
    } else {
      const current = newMentor.assigned_courses;
      const updated = current.includes(courseId) ? current.filter(id => id !== courseId) : [...current, courseId];
      setNewMentor({ ...newMentor, assigned_courses: updated });
    }
  };

  return (
    <div className="space-y-6 relative">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] p-4 rounded-md shadow-lg border-l-4 font-medium transition-all ${
          notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage Mentors and Students within the academy.</p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'Mentor' ? (
            <button 
              onClick={() => { 
                setNewMentor({ name: '', employee_id: generateEmployeeId(users), major_course: '', assigned_courses: [], status: 'active' });
                setIsAddModalOpen(true); 
              }}
              className="bg-indigo-600 text-white px-4 py-2.5 rounded-md flex items-center hover:bg-indigo-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={18} className="mr-2" />
              Create Mentor
            </button>
          ) : (
            <button 
              onClick={() => { setIsAddModalOpen(true); }}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-md flex items-center hover:bg-blue-700 transition-colors shadow-sm font-medium"
            >
              <Plus size={18} className="mr-2" />
              Add Student
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 border-b border-gray-200">
        <button
          onClick={() => { setActiveTab('Mentor'); setSearchQuery(''); }}
          className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'Mentor' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <UserCog size={18} className="mr-2" />
          Mentor Management
        </button>
        <button
          onClick={() => { setActiveTab('Student'); setSearchQuery(''); }}
          className={`flex items-center px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'Student' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Users size={18} className="mr-2" />
          Student Course Management
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder={`Search by name, ID, or email...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 transition-colors" 
            />
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'Mentor' ? 'Mentor Details' : 'Student Details'}
                </th>
                {activeTab === 'Mentor' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Major Course</th>
                )}
                {activeTab === 'Student' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {activeTab === 'Mentor' ? 'Assigned Courses' : 'Course'}
                </th>
                {activeTab === 'Student' && (
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                )}
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold border ${
                          activeTab === 'Mentor' ? 'bg-indigo-100 text-indigo-700 border-indigo-200' : 'bg-blue-100 text-blue-700 border-blue-200'
                        }`}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500 font-mono flex items-center mt-0.5">
                            {activeTab === 'Mentor' && <Key size={12} className="mr-1 text-indigo-500" />}
                            {user.employee_id || user.username || user.id.substring(0,8)}
                          </div>
                        </div>
                      </div>
                    </td>
                    
                    {activeTab === 'Mentor' && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {user.major_course || <span className="text-gray-400 italic">Not set</span>}
                      </td>
                    )}
                    
                    {activeTab === 'Student' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.phone ? (
                          <div className="text-xs text-gray-500 flex items-center mt-0.5">
                            <Phone size={12} className="mr-1" /> {user.phone}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400 italic mt-0.5">No phone</div>
                        )}
                      </td>
                    )}
                    
                    <td className="px-6 py-4">
                      {activeTab === 'Mentor' ? (
                        <div className="flex flex-wrap gap-1">
                          {(user.assigned_courses || []).length > 0 ? (
                            (user.assigned_courses || []).map(cid => (
                              <span key={cid} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                                {getCourseName(cid)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-red-500 font-medium">No courses assigned</span>
                          )}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-900 flex items-center whitespace-nowrap">
                          <BookOpen size={16} className="mr-2 text-gray-400" />
                          {getCourseName(user.course || '')}
                        </div>
                      )}
                    </td>
                    
                    {activeTab === 'Student' && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.payment_status === 'verified' ? 'bg-green-100 text-green-800' 
                          : user.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                          {user.payment_status === 'verified' ? 'Verified' : user.payment_status === 'pending' ? 'Pending' : 'N/A'}
                        </span>
                      </td>
                    )}
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                      {activeTab === 'Student' && user.payment_status === 'pending' && (
                        <button onClick={() => handleVerifyPayment(user.id)} className="text-green-600 hover:text-green-900 transition-colors font-bold">
                          Verify
                        </button>
                      )}
                      <button onClick={() => setEditingUser(user)} className="text-blue-600 hover:text-blue-900 transition-colors">Edit</button>
                      <button onClick={() => setDeletingUserId(user.id)} className="text-red-600 hover:text-red-900 transition-colors">Delete</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                    No {activeTab.toLowerCase()}s found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">
                {activeTab === 'Mentor' ? 'Create Mentor' : 'Add New Student'}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {activeTab === 'Mentor' ? (
              <form onSubmit={handleAddMentor} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mentor Name *</label>
                    <input type="text" required value={newMentor.name} onChange={(e) => setNewMentor({...newMentor, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                    <input type="text" readOnly value={newMentor.employee_id} className="w-full px-3 py-2 border rounded-md bg-gray-50 text-gray-500 font-mono font-bold" />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major Course *</label>
                  <input type="text" required value={newMentor.major_course} onChange={(e) => setNewMentor({...newMentor, major_course: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Full Stack Development" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Course(s) *</label>
                  <div className="border rounded-md border-gray-300 p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                    {courses.filter(c => c.status === 'Active').length === 0 && <p className="text-sm text-gray-500">No active courses available.</p>}
                    {courses.filter(c => c.status === 'Active').map(c => (
                      <label key={c.id} className="flex items-center space-x-3 bg-white p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                        <input 
                          type="checkbox" 
                          checked={newMentor.assigned_courses.includes(c.id)}
                          onChange={() => toggleCourseAssignment(c.id)}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-900">{c.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={newMentor.status} onChange={(e) => setNewMentor({...newMentor, status: e.target.value as 'active' | 'inactive'})} className="w-full px-3 py-2 border rounded-md">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                
                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-4">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-md font-medium text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700">Save Mentor</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleAddStudent} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input type="text" required value={newStudent.name} onChange={(e) => setNewStudent({...newStudent, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" required value={newStudent.email} onChange={(e) => setNewStudent({...newStudent, email: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course of Study *</label>
                  <select required value={newStudent.course} onChange={(e) => setNewStudent({...newStudent, course: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="" disabled>Select a course...</option>
                    {courses.filter(c => c.status === 'Active').map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={newStudent.status} onChange={(e) => setNewStudent({...newStudent, status: e.target.value as 'active' | 'inactive'})} className="w-full px-3 py-2 border rounded-md">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-md font-medium text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700">Add Student</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-2">
               <h2 className="text-lg font-bold">Edit {editingUser.role}</h2>
               <button onClick={() => setEditingUser(null)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
             </div>
             <form onSubmit={handleUpdateUser} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" required value={editingUser.name} onChange={(e) => setEditingUser({...editingUser, name: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                
                {editingUser.role === 'Mentor' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Major Course</label>
                      <input type="text" required value={editingUser.major_course || ''} onChange={(e) => setEditingUser({...editingUser, major_course: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Course(s)</label>
                      <div className="border rounded-md border-gray-300 p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                        {courses.map(c => (
                          <label key={c.id} className="flex items-center space-x-3 bg-white p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                            <input 
                              type="checkbox" 
                              checked={(editingUser.assigned_courses || []).includes(c.id)}
                              onChange={() => toggleCourseAssignment(c.id, true)}
                              className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-900">{c.title} {c.status !== 'Active' && <span className="text-xs text-red-500 ml-1">(Inactive)</span>}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course of Study</label>
                    <select required value={editingUser.course || ''} onChange={(e) => setEditingUser({...editingUser, course: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                      {courses.filter(c => c.status === 'Active' || c.id === editingUser.course).map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={editingUser.status} onChange={(e) => setEditingUser({...editingUser, status: e.target.value as any})} className="w-full px-3 py-2 border rounded-md">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-4">
                  <button type="button" onClick={() => setEditingUser(null)} className="px-4 py-2 border rounded-md font-medium text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium">Save Changes</button>
                </div>
             </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingUserId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 text-center">
            <h2 className="text-xl font-bold mb-2">Delete User</h2>
            <p className="text-gray-500 mb-6">Are you sure you want to delete this user?</p>
            <div className="flex justify-center space-x-3">
              <button onClick={() => setDeletingUserId(null)} className="px-4 py-2 border rounded-md w-full font-medium">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md w-full font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
