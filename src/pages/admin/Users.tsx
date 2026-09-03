import React, { useState, useEffect } from 'react';
import { Search, X, Loader2, Plus, Edit3, Mail, Trash2, ChevronDown, User as UserIcon } from 'lucide-react';
import { IS_MOCK_SUPABASE, supabaseAdmin } from '../../lib/supabase';

// Helper to create Auth user directly via REST to bypass SDK "Forbidden" error for Service Role Key in browser
const createAuthUser = async (email: string, password?: string) => {
  const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
  const baseUrl = import.meta.env.VITE_SUPABASE_URL;
  
  if (!serviceRoleKey || !baseUrl) {
    throw new Error("Missing Supabase credentials in environment variables.");
  }

  const authRes = await fetch(`${baseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'apikey': serviceRoleKey,
      'Authorization': `Bearer ${serviceRoleKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      password: password || `${email.split('@')[0]}@1001`,
      email_confirm: true
    })
  });

  const authData = await authRes.json();
  if (!authRes.ok) {
    throw new Error(authData.msg || authData.message || 'Failed to create auth user');
  }

  return authData.id;
};
import type { User, Course } from '../../types';
import { getMockUsers, setMockUsers, getMockCourses, syncStudentEnrollments } from '../../lib/mockData';

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filterRole, setFilterRole] = useState<'All' | 'Mentor' | 'Student'>('All');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'Mentor' | 'Student'>('Student');
  
  // Student fields
  const [newStudent, setNewStudent] = useState({ 
    name: '', email: '', phone: '', course: '', password: '', status: 'active' as 'active' | 'inactive' 
  });
  
  // Mentor fields
  const [newMentor, setNewMentor] = useState({
    name: '', email: '', phone: '', employee_id: '', major_course: '', password: '', assigned_courses: [] as string[], status: 'active' as 'active' | 'inactive'
  });
  const [isSavingMentor, setIsSavingMentor] = useState(false);
  const [isSavingStudent, setIsSavingStudent] = useState(false);
  
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success'|'error'} | null>(null);

  const [passwordResetUser, setPasswordResetUser] = useState<User | null>(null);
  const [newGeneratedPassword, setNewGeneratedPassword] = useState<string>('');
  const [emailSendingUser, setEmailSendingUser] = useState<string | null>(null);
  const [emailPreviewUser, setEmailPreviewUser] = useState<User | null>(null);
  const [viewingUser, setViewingUser] = useState<User | null>(null);
  
  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const sendRegistrationEmail = async (profile: User) => {
    const subject = 'Your Boss Academy Account Created';
    const text = `HELLO ${profile.name.toUpperCase()},

An administrator has created an account for you on the Boss Academy LMS.
Your assigned role is: ${profile.role.toUpperCase()} .

YOUR LOGIN DETAILS
Email: ${profile.email}

To access your account, you need to set up a secure password. Click the link below to get started:
${window.location.origin}/reset-password?token=${profile.reset_token}

Note: This link will expire in 24 hours. If it expires, please contact your administrator.

CONFIDENTIAL & PROPRIETARY
© 2026 BOSS ACADEMY. ALL RIGHTS RESERVED.`;
    
    try {
      // Mocking email send
      console.log('Sending email:', { to: profile.email, subject, text });
      showNotification(`${profile.role} created successfully! Registration email sent (Mocked).`, 'success');
    } catch (err: any) {
      console.error(err);
      showNotification(`${profile.role} created, but error connecting to email service.`, 'error');
    }
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
      setCourses(getMockCourses());
      setUsers(getMockUsers());
      setIsLoading(false);
      return;
    }

    try {
      const { data: profilesData, error: profilesError } = await supabaseAdmin.from('profiles').select('*');
      if (profilesError) throw profilesError;
      
      const { data: coursesData, error: coursesError } = await supabaseAdmin.from('courses').select('*');
      if (coursesError) throw coursesError;
      
      setCourses(coursesData || []);
      
      if (profilesData) {
        const mappedProfiles = (profilesData as User[]).map(user => {
          if (user.role === 'Mentor') {
             user.assigned_courses = (coursesData || []).filter(c => c.mentor_id === user.id).map(c => c.id);
          }
          return user;
        });
        setUsers(mappedProfiles);
      }
    } catch (err: any) {
      showNotification(err.message || 'Failed to fetch data from database.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  
  useEffect(() => {
    fetchData();
  }, []);

  const filteredUsers = users.filter(u => 
    (filterRole === 'All' || u.role === filterRole) &&
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
     (u.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
     (u.employee_id || '').toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingStudent) return;
    
    // Validate required fields
    if (!newStudent.name.trim() || !newStudent.email.trim()) {
      showNotification('Name and Email are required.', 'error');
      return;
    }

    setIsSavingStudent(true);
    
    if (!IS_MOCK_SUPABASE) {
      try {
        // 1. Create Auth User via REST first to get an ID
        const userId = await createAuthUser(newStudent.email.trim(), newStudent.password);

        // 2. Insert into Profiles with the new ID
        const profileData = {
          id: userId,
          name: newStudent.name.trim(),
          username: newStudent.email.trim(),
          email: newStudent.email.trim(),
          phone: newStudent.phone || null,
          course: newStudent.course || null,
          role: 'Student',
          status: newStudent.status
        };

        const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
        const baseUrl = import.meta.env.VITE_SUPABASE_URL;
        
        const profileRes = await fetch(`${baseUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': serviceRoleKey,
            'Authorization': `Bearer ${serviceRoleKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation'
          },
          body: JSON.stringify(profileData)
        });

        if (!profileRes.ok) {
          const err = await profileRes.json().catch(()=>({}));
          throw new Error(err.message || err.details || 'Failed to create student profile');
        }

        const [newUser] = await profileRes.json();

        // Add to enrollments if course selected
        if (newStudent.course && newUser) {
          await fetch(`${baseUrl}/rest/v1/enrollments`, {
            method: 'POST',
            headers: {
              'apikey': serviceRoleKey,
              'Authorization': `Bearer ${serviceRoleKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              student_id: newUser.id,
              course_id: newStudent.course,
              status: 'active'
            })
          });
        }

        showNotification('Student created successfully!', 'success');
        
        await fetchData();
        setIsAddModalOpen(false);
        setNewStudent({ name: '', email: '', phone: '', course: '', password: '', status: 'active' });
      } catch (err: any) {
        showNotification(err.message || 'Failed to insert data into Supabase.', 'error');
      } finally {
        setIsSavingStudent(false);
      }
    } else {
      // Mock logic
      const token = crypto.randomUUID();
      const newProfile = {
        id: crypto.randomUUID(), 
        name: newStudent.name,
        username: newStudent.email,
        email: newStudent.email,
        phone: newStudent.phone || undefined,
        password: null,
        reset_token: token,
        course: newStudent.course,
        assigned_courses: newStudent.course ? [newStudent.course] : [],
        role: 'Student' as any,
        status: newStudent.status,
        payment_status: 'verified' as any,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      const currentUsers = getMockUsers();
      const updated = [newProfile, ...currentUsers];
      setMockUsers(updated);
      setUsers(updated);
      
      if (newProfile.assigned_courses?.length) {
        syncStudentEnrollments(newProfile.id, newProfile.assigned_courses);
      }
      
      setIsAddModalOpen(false);
      setNewStudent({ name: '', email: '', phone: '', course: '', password: '', status: 'active' });
      await sendRegistrationEmail(newProfile);
      setIsSavingStudent(false);
    }
  };

  const handleAddMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSavingMentor) return;
    
    // Validate required fields
    if (!newMentor.name.trim() || !newMentor.email.trim() || !newMentor.major_course?.trim()) {
      showNotification('Name, Email, and Major Course are required.', 'error');
      return;
    }

    setIsSavingMentor(true);
    
    const token = crypto.randomUUID();
    const newProfile: User = {
      id: crypto.randomUUID(),
      name: newMentor.name,
      username: newMentor.email || `${newMentor.employee_id.toLowerCase()}@bossacademy.com`,
      employee_id: newMentor.employee_id,
      email: newMentor.email || `${newMentor.employee_id.toLowerCase()}@bossacademy.com`,
      phone: newMentor.phone || undefined,
      password: null, 
      reset_token: token,
      major_course: newMentor.major_course,
      assigned_courses: newMentor.assigned_courses,
      role: 'Mentor',
      status: newMentor.status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (!IS_MOCK_SUPABASE) {
      try {
        const email = newMentor.email;
        if (!email) throw new Error("Email is required");

        // 1. Create Auth User via REST first to get an ID
        const userId = await createAuthUser(email, newMentor.password);

        // 2. Insert into Profiles with the new ID
        const profileData = {
          id: userId,
          name: newMentor.name,
          username: email,
          email: email,
          phone: newMentor.phone || null,
        setNewMentor({ name: '', email: '', phone: '', employee_id: '', major_course: '', password: '', assigned_courses: [], status: 'active' });
      } catch (err: any) {
        const errorMsg = err?.message || err?.error_description || (typeof err === 'string' ? err : 'Failed to connect to the database. Please check your network or Supabase configuration.');
        if (errorMsg === 'Failed to fetch') {
          showNotification('Network error (Failed to fetch). Please check your internet connection, AdBlocker, or Supabase URL configuration.', 'error');
        } else {
          showNotification(errorMsg, 'error');
        }
      } finally {
        setIsSavingMentor(false);
      }
    } else {
      try {
        const currentUsers = getMockUsers();
        const updated = [newProfile, ...currentUsers];
        setMockUsers(updated);
        setUsers(updated);
        setIsAddModalOpen(false);
        setNewMentor({ name: '', email: '', phone: '', employee_id: '', major_course: '', password: '', assigned_courses: [], status: 'active' });
        await sendRegistrationEmail(newProfile);
      } finally {
        setIsSavingMentor(false);
      }
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (IS_MOCK_SUPABASE) {
      // Sync student assignments specifically if they changed
      if (editingUser.role === 'Student' && editingUser.course) {
        editingUser.assigned_courses = [editingUser.course];
        syncStudentEnrollments(editingUser.id, editingUser.assigned_courses);
      }
      const currentUsers = getMockUsers();
      const updated = currentUsers.map(u => u.id === editingUser.id ? { ...editingUser, updated_at: new Date().toISOString() } : u);
      setMockUsers(updated);
      setUsers(updated);
      setEditingUser(null);
      showNotification(`${editingUser.role} updated successfully!`, 'success');
    } else {
      try {
        const updateData = {
          name: editingUser.name,
          phone: editingUser.phone,
          status: editingUser.status,
          department: editingUser.department,
          course: editingUser.course,
          major_course: editingUser.major_course,
          employee_id: editingUser.employee_id,
        };

        const { error: updateError } = await supabaseAdmin.from('profiles').update(updateData).eq('id', editingUser.id);
        
        if (updateError) {
          throw new Error(updateError.message || 'Update failed');
        }
        
        if (editingUser.role === 'Student' && editingUser.course) {
          await supabaseAdmin.from('enrollments').upsert({
            student_id: editingUser.id,
            course_id: editingUser.course,
            status: 'active'
          }, { onConflict: 'student_id, course_id' });
        }
        
        if (editingUser.role === 'Mentor' && editingUser.assigned_courses) {
            for (const courseId of editingUser.assigned_courses) {
                await supabaseAdmin.from('courses').update({ mentor_id: editingUser.id }).eq('id', courseId);
            }
        }

        await fetchData();
        setEditingUser(null);
        showNotification(`${editingUser.role} updated successfully!`, 'success');
      } catch (err: any) {
        showNotification(err.message || 'Failed to update user.', 'error');
      }
    }
  };

  const confirmDelete = async () => {
    if (deletingUserId) {
      if (IS_MOCK_SUPABASE) {
        const currentUsers = getMockUsers();
        const updated = currentUsers.filter(u => u.id !== deletingUserId);
        setMockUsers(updated);
        setUsers(updated);
        setDeletingUserId(null);
        showNotification('User deleted successfully!', 'success');
      } else {
        try {
          const { error: deleteError } = await supabaseAdmin.from('profiles').delete().eq('id', deletingUserId);
          
          if (deleteError) {
            throw new Error(deleteError.message || 'Failed to delete user');
          }

          await fetchData();
          setDeletingUserId(null);
          showNotification('User deleted successfully!', 'success');
        } catch (err: any) {
          showNotification(err.message || 'Failed to delete user.', 'error');
        }
      }
    }
  };

  
  const confirmPasswordReset = () => {
    if (!passwordResetUser) return;
    showNotification(`Password for ${passwordResetUser.name} reset successfully!`, 'success');
    setPasswordResetUser(null);
  };

  
  const handleSendCredentials = (user: User) => {
    if (!user.email) {
      showNotification(`Cannot send email. No email address registered for ${user.name}.`, 'error');
      return;
    }
    setEmailPreviewUser(user);
  };

  const confirmSendEmail = async () => {
    if (!emailPreviewUser) return;
    
    setEmailSendingUser(emailPreviewUser.id);
    
    if (IS_MOCK_SUPABASE) {
      const currentUsers = getMockUsers();
      const dbUser = currentUsers.find(u => u.id === emailPreviewUser.id);
      
      // Reuse existing token if it hasn't been used yet, so all emails in the inbox will work.
      // If it is null (already used), generate a fresh one.
      const token = dbUser?.reset_token || crypto.randomUUID();
      
      const updatedUser = { ...emailPreviewUser, reset_token: token };
      const updatedUsers = currentUsers.map(u => u.id === emailPreviewUser.id ? updatedUser : u);
      setMockUsers(updatedUsers);
      setUsers(updatedUsers);
      
      const subject = 'Your Boss LMS Account Setup';
      const text = `HELLO ${emailPreviewUser.name.toUpperCase()},\n\nAn administrator has requested a password setup link for your Boss Academy LMS account.\nYour assigned role is: ${emailPreviewUser.role.toUpperCase()} .\n\nYOUR LOGIN DETAILS\nEmail: ${emailPreviewUser.email}\n\nTo access your account, you need to set up a secure password. Click the link below to get started:\n${window.location.origin}/reset-password?token=${token}\n\nNote: This link will expire in 24 hours. If it expires, please contact your administrator.\n\nCONFIDENTIAL & PROPRIETARY\n© 2026 BOSS ACADEMY. ALL RIGHTS RESERVED.`;
      
      try {
        await fetch('/api/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ to: emailPreviewUser.email, subject, text })
        });
        showNotification(`Credential email sent to ${emailPreviewUser.email}`, 'success');
      } catch (err) {
        showNotification('Failed to send email. Check your SMTP configuration.', 'error');
      }
    } else {
      try {
        const { error } = await supabaseAdmin.auth.resetPasswordForEmail(emailPreviewUser.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) {
          throw new Error(error.message || 'Failed to generate secure reset link');
        }

        showNotification(`Credential reset email sent to ${emailPreviewUser.email} via Supabase`, 'success');
      } catch (err: any) {
        showNotification(err.message, 'error');
      }
    }
    
    setEmailSendingUser(null);
    setEmailPreviewUser(null);
  };

  const handleViewUser = (user: User) => {
    setViewingUser(user);
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

      {/* Unified Header matching screenshot */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-black text-black uppercase tracking-wider">User Management</h1>
          <p className="text-sm text-gray-500 mt-1 font-medium">Manage mentors and students across the platform.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          {/* Search Bar */}
          <div className="relative flex-grow max-w-md">
            <input 
              type="text" 
              placeholder="Search users by name, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" 
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
          </div>
          
          {/* Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center justify-between bg-white border border-gray-300 text-black px-4 py-2.5 rounded-md text-sm font-bold min-w-[140px]"
            >
              {filterRole === 'All' ? 'All Roles' : filterRole === 'Mentor' ? 'Mentors' : 'Students'}
              <ChevronDown size={16} className="ml-2 text-gray-500" />
            </button>
            
            {isDropdownOpen && (
              <div className="absolute top-full mt-1 right-0 w-full bg-white border border-gray-200 shadow-lg rounded-md z-10 py-1">
                <button onClick={() => { setFilterRole('All'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 font-medium">All Roles</button>
                <button onClick={() => { setFilterRole('Mentor'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 font-medium">Mentors</button>
                <button onClick={() => { setFilterRole('Student'); setIsDropdownOpen(false); }} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-50 hover:text-blue-600 font-medium">Students</button>
              </div>
            )}
          </div>

          <button 
            onClick={() => { setModalType('Student'); setIsAddModalOpen(true); }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-md flex items-center hover:bg-blue-700 transition-colors shadow-sm font-black uppercase text-xs tracking-wider"
          >
            <Plus size={16} className="mr-2" />
            Add Student
          </button>
          
          <button 
            onClick={() => { 
              setModalType('Mentor');
              setNewMentor({ name: '', email: '', phone: '', employee_id: generateEmployeeId(users), major_course: '', password: '', assigned_courses: [], status: 'active' });
              setIsAddModalOpen(true); 
            }}
            className="bg-blue-600 text-white px-5 py-2.5 rounded-md flex items-center hover:bg-blue-700 transition-colors shadow-sm font-black uppercase text-xs tracking-wider"
          >
            <Plus size={16} className="mr-2" />
            Add Mentor
          </button>
        </div>
      </div>

      {/* Unified Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 border-b-2 border-blue-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-black text-blue-600 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-black text-blue-600 uppercase tracking-wider">Contact Information</th>
                <th className="px-6 py-4 text-left text-xs font-black text-blue-600 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-left text-xs font-black text-blue-600 uppercase tracking-wider">Course / Assignment</th>
                <th className="px-6 py-4 text-left text-xs font-black text-blue-600 uppercase tracking-wider">Onboarded</th>
                <th className="px-6 py-4 text-right text-xs font-black text-blue-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Loading...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded border-2 border-blue-400 bg-blue-50 text-blue-600 flex items-center justify-center font-black text-lg">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="text-sm font-bold text-black">{user.name}</div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 font-medium">{user.email || 'N/A'}</div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 inline-flex text-[10px] leading-5 font-black uppercase tracking-wider rounded border ${
                        user.role === 'Student' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 font-medium line-clamp-1">
                        {user.role === 'Mentor' 
                          ? getCourseNames(user.assigned_courses)
                          : user.course ? getCourseName(user.course) : 'N/A'
                        }
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {new Date(user.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-4 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditingUser(user)} className="text-green-500 hover:text-green-700 transition-colors" title="Edit User">
                          <Edit3 size={18} />
                        </button>

                        <button onClick={() => handleSendCredentials(user)} disabled={emailSendingUser === user.id} className="text-purple-500 hover:text-purple-700 transition-colors disabled:opacity-50" title="Send Email">
                          {emailSendingUser === user.id ? <Loader2 size={18} className="animate-spin" /> : <Mail size={18} />}
                        </button>
                        <button onClick={() => handleViewUser(user)} className="text-blue-500 hover:text-blue-700 transition-colors" title="View Details">
                          <UserIcon size={18} />
                        </button>
                        <button onClick={() => setDeletingUserId(user.id)} className="text-red-500 hover:text-red-700 transition-colors" title="Delete User">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500 font-medium italic">
                    No users found matching your criteria.
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
                {modalType === 'Mentor' ? 'Create Mentor' : 'Add New Student'}
              </h2>
              <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            
            {modalType === 'Mentor' ? (
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input type="email" required value={newMentor.email} onChange={(e) => setNewMentor({...newMentor, email: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="mentor@bossacademy.com" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={newMentor.phone} onChange={(e) => setNewMentor({...newMentor, phone: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="+1 (555) 000-0000" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input type="text" value={newMentor.password} onChange={(e) => setNewMentor({...newMentor, password: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="Leave blank to auto-generate" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major Course</label>
                  <input type="text" required value={newMentor.major_course} onChange={(e) => setNewMentor({...newMentor, major_course: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Course(s)</label>
                  <div className="border rounded-md border-gray-300 p-3 max-h-48 overflow-y-auto space-y-2 bg-gray-50">
                    {courses.map(c => (
                      <label key={c.id} className="flex items-center space-x-3 bg-white p-2 rounded border border-gray-200 cursor-pointer hover:bg-gray-50">
                        <input 
                          type="checkbox" 
                          checked={(newMentor.assigned_courses || []).includes(c.id)}
                          onChange={() => toggleCourseAssignment(c.id, false)}
                          className="h-4 w-4 text-indigo-600 rounded border-gray-300"
                        />
                        <span className="text-sm font-medium text-gray-900">{c.title}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="pt-4 flex justify-end space-x-3 border-t border-gray-100 mt-4">
                  <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 border rounded-md font-medium text-gray-700">Cancel</button>
                  <button type="submit" disabled={isSavingMentor} className="px-4 py-2 bg-indigo-600 text-white rounded-md font-medium hover:bg-indigo-700 disabled:opacity-70 flex items-center">
                    {isSavingMentor ? <><Loader2 size={16} className="animate-spin mr-2" /> Saving...</> : 'Save Mentor'}
                  </button>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={newStudent.phone} onChange={(e) => setNewStudent({...newStudent, phone: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="+1 (555) 000-0000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                  <input type="text" value={newStudent.password} onChange={(e) => setNewStudent({...newStudent, password: e.target.value})} className="w-full px-3 py-2 border rounded-md" placeholder="Leave blank to auto-generate" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course of Study *</label>
                  <select required value={newStudent.course} onChange={(e) => setNewStudent({...newStudent, course: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                    <option value="" disabled>Select a course...</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input type="email" required value={editingUser.email || ''} onChange={(e) => setEditingUser({...editingUser, email: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input type="tel" value={editingUser.phone || ''} onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})} className="w-full px-3 py-2 border rounded-md" />
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
                            <span className="text-sm font-medium text-gray-900">{c.title}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Course of Study</label>
                    <select required value={editingUser.course || ''} onChange={(e) => setEditingUser({...editingUser, course: e.target.value})} className="w-full px-3 py-2 border rounded-md">
                      <option value="" disabled>Select a course...</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
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
      {/* Password Reset Modal */}
      {passwordResetUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Reset Password</h2>
              <button onClick={() => setPasswordResetUser(null)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">Enter a new secure password for <strong>{passwordResetUser.name}</strong>.</p>
              
              <div className="mb-6">
                <input
                  type="text"
                  value={newGeneratedPassword}
                  onChange={(e) => setNewGeneratedPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              
              <div className="flex gap-3">
                <button onClick={() => setPasswordResetUser(null)} className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button 
                  onClick={confirmPasswordReset} 
                  disabled={!newGeneratedPassword.trim()} 
                  className="w-full px-4 py-2 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors disabled:opacity-50"
                >
                  Confirm Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Email Preview Modal */}
      {emailPreviewUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Mail size={20} className="text-blue-500" />
                Email Preview
              </h2>
              <button 
                onClick={() => setEmailPreviewUser(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={emailSendingUser === emailPreviewUser.id}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">To:</div>
                <div className="text-sm font-medium text-gray-900">{emailPreviewUser.email}</div>
              </div>
              
              <div className="mb-6">
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Subject:</div>
                <div className="text-sm font-medium text-gray-900">Your Boss LMS Login Credentials</div>
              </div>
              
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4 mb-6 text-sm text-gray-700 leading-relaxed font-mono whitespace-pre-wrap">
                Hello {emailPreviewUser.name},

Welcome to Boss LMS! Your account has been successfully created. You can log in to the portal using the credentials below:

Login URL: https://lms.bossacademy.com/login
Username: {emailPreviewUser.username}
Password: (Hidden for security)

Please reset your password immediately upon your first login.

Best regards,
The Boss LMS Admin Team
              </div>
              
              <div className="flex gap-3 pt-2 border-t border-gray-100">
                <button 
                  onClick={() => setEmailPreviewUser(null)} 
                  disabled={emailSendingUser === emailPreviewUser.id}
                  className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button 
                  onClick={confirmSendEmail} 
                  disabled={emailSendingUser === emailPreviewUser.id}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {emailSendingUser === emailPreviewUser.id ? (
                    <><Loader2 size={18} className="animate-spin" /> Sending Email...</>
                  ) : (
                    <><Mail size={18} /> Send Credentials</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View User Details Modal */}
      {viewingUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl border-2 border-blue-200">
                  {viewingUser.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{viewingUser.name}</h2>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{viewingUser.role}</p>
                </div>
              </div>
              <button onClick={() => setViewingUser(null)} className="text-gray-400 hover:text-gray-600 transition-colors bg-white p-2 rounded-full shadow-sm border border-gray-200">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto">
              {/* Core Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-2">Core Information</h3>
                
                <div>
                  <p className="text-xs text-gray-500 font-medium">Username</p>
                  <p className="text-sm font-semibold text-gray-900">{viewingUser.username}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-medium">Email Address</p>
                  <p className="text-sm font-semibold text-gray-900">{viewingUser.email || 'N/A'}</p>
                </div>
                
                <div>
                  <p className="text-xs text-gray-500 font-medium">Phone Number</p>
                  <p className="text-sm font-semibold text-gray-900">{viewingUser.phone || 'N/A'}</p>
                </div>
              </div>
              
              {/* System & Academic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 border-b pb-2">System & Academic</h3>
                
                <div>
                  <p className="text-xs text-gray-500 font-medium">Account Status</p>
                  <span className={`mt-1 px-2.5 py-0.5 inline-flex text-xs leading-5 font-black uppercase tracking-wider rounded border ${
                        viewingUser.status === 'active' 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                      }`}>
                    {viewingUser.status}
                  </span>
                </div>
                
                {viewingUser.role === 'Mentor' ? (
                  <>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Major Course</p>
                      <p className="text-sm font-semibold text-gray-900">{viewingUser.major_course || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Assigned Courses</p>
                      <p className="text-sm font-semibold text-gray-900">{getCourseNames(viewingUser.assigned_courses)}</p>
                    </div>
                  </>
                ) : (
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Enrolled Course</p>
                    <p className="text-sm font-semibold text-gray-900">{viewingUser.course ? getCourseName(viewingUser.course) : 'N/A'}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-xs text-gray-500 font-medium">Registration Date</p>
                  <p className="text-sm font-semibold text-gray-900">{new Date(viewingUser.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 border-t border-gray-100 flex justify-end">
              <button onClick={() => setViewingUser(null)} className="px-6 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm">
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
