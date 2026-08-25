import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, Edit, Trash2, X, User, Users, Calendar, Upload, Eye, UserPlus, GitMerge } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import type { Course, User as UserType } from '../../types';
import { getMockCourses, setMockCourses, getMockUsers, setMockUsers } from '../../lib/mockData';

export default function AdminCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mentors, setMentors] = useState<{ id: string; name: string; email: string }[]>([]);
  const [allUsers, setAllUsers] = useState<UserType[]>([]);
  
  // New Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createData, setCreateData] = useState({
    title: '',
    description: '',
    sequential: false,
    mentors: [] as string[]
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [editCourseMentors, setEditCourseMentors] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  // Students Modal State
  const [isStudentsModalOpen, setIsStudentsModalOpen] = useState(false);
  const [selectedCourseForStudents, setSelectedCourseForStudents] = useState<Course | null>(null);

  // Mock Students Data (removed static mockStudents array)

  const fetchCourses = async () => {
    setIsLoading(true);
    if (IS_MOCK_SUPABASE) {
      setCourses(getMockCourses());
    } else {
      const { data } = await supabase.from('courses').select('*').order('created_at', { ascending: false });
      if (data) setCourses(data as Course[]);
    }
    setIsLoading(false);
  };

  const fetchMentorsAndUsers = async () => {
    if (IS_MOCK_SUPABASE) {
      const users = getMockUsers();
      setAllUsers(users);
      const mockMentors = users.filter(u => u.role === 'Mentor');
      setMentors(mockMentors.map(m => ({ id: m.id, name: m.name, email: m.email })));
      return;
    }

    const { data: usersData, error: usersError } = await supabase.from('profiles').select('*');
    if (!usersError && usersData) {
      setAllUsers(usersData as UserType[]);
      const dbMentors = usersData.filter(u => u.role === 'Mentor');
      setMentors(dbMentors.map(m => ({ id: m.id, name: m.name, email: m.email })));
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchMentorsAndUsers();
  }, []);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createData.title.trim()) {
      alert('Please provide a course title.');
      return;
    }
    setIsCreating(true);

    const newCourse = {
      id: crypto.randomUUID(),
      title: createData.title,
      description: createData.description,
      mentor_id: createData.mentors.length > 0 ? createData.mentors[0] : undefined,
      status: 'Draft',
      category: 'Uncategorized',
      duration: 'Flexible',
      video_url: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (IS_MOCK_SUPABASE) {
      const updatedCourses = [newCourse as unknown as Course, ...courses];
      setMockCourses(updatedCourses);
      
      // Assign the course to selected mentors
      const users = getMockUsers();
      let updatedUsers = false;
      users.forEach(u => {
        if (createData.mentors.includes(u.id)) {
          if (!u.assigned_courses) u.assigned_courses = [];
          if (!u.assigned_courses.includes(newCourse.id)) {
            u.assigned_courses.push(newCourse.id);
            updatedUsers = true;
          }
        }
      });
      if (updatedUsers) {
        setMockUsers(users);
        setAllUsers(users);
      }
      
      setCourses(updatedCourses);
      setIsCreating(false);
      setIsCreateModalOpen(false);
      setCreateData({ title: '', description: '', sequential: false, mentors: [] });
      alert('Course created successfully!');
    } else {
      await supabase.from('courses').insert([newCourse]);
      fetchCourses();
    }
    
    setCreateData({ title: '', description: '', sequential: false, mentors: [] });
    setIsCreateModalOpen(false);
    setIsCreating(false);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setIsDeleting(id);
    
    if (IS_MOCK_SUPABASE) {
      const updated = courses.filter(c => c.id !== id);
      setMockCourses(updated);
      setCourses(updated);
      setIsDeleting(null);
    } else {
      await supabase.from('courses').delete().eq('id', id);
      fetchCourses();
      setIsDeleting(null);
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setIsUpdating(true);

    if (IS_MOCK_SUPABASE) {
      const updated = courses.map(c => 
        c.id === editingCourse.id 
          ? { 
              ...c, 
              title: editingCourse.title,
              description: editingCourse.description,
              category: editingCourse.category,
              status: editingCourse.status,
              video_url: editingCourse.video_url,
              mentor_id: editingCourse.mentor_id,
              updated_at: new Date().toISOString()
            } 
          : c
      );
      setMockCourses(updated);
      setCourses(updated);

      // Manage mentor multi-assignment
      const users = getMockUsers();
      let usersUpdated = false;
      users.forEach(u => {
        if (u.role === 'Mentor') {
          const hasCourse = u.assigned_courses?.includes(editingCourse.id);
          const shouldHaveCourse = editCourseMentors.includes(u.id);
          
          if (hasCourse && !shouldHaveCourse) {
            u.assigned_courses = u.assigned_courses!.filter(id => id !== editingCourse.id);
            usersUpdated = true;
          } else if (!hasCourse && shouldHaveCourse) {
            if (!u.assigned_courses) u.assigned_courses = [];
            u.assigned_courses.push(editingCourse.id);
            usersUpdated = true;
          }
        }
      });
      if (usersUpdated) {
        setMockUsers(users);
        setAllUsers(users);
      }

      setEditingCourse(null);
      setIsUpdating(false);
      alert('Course updated successfully!');
    } else {
      await supabase.from('courses').update({
        title: editingCourse.title,
        description: editingCourse.description,
        category: editingCourse.category,
        status: editingCourse.status,
        video_url: editingCourse.video_url,
        mentor_id: editingCourse.mentor_id
      }).eq('id', editingCourse.id);
      fetchCourses();
      setEditingCourse(null);
      setIsUpdating(false);
    }
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 text-black font-sans">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 border-b border-gray-200 pb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-black tracking-wider uppercase">Course Management</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">Create, manage, and assign courses to mentors and students.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative flex-1 sm:min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-md pl-10 pr-4 py-3 text-sm text-black placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors shadow-sm"
              />
            </div>

            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="bg-blue-500 text-white font-bold px-6 py-3 rounded-md flex items-center justify-center hover:bg-blue-600 transition-colors whitespace-nowrap text-sm uppercase tracking-wider shadow-sm"
            >
              <Plus size={18} className="mr-2" strokeWidth={3} />
              Create Course
            </button>
          </div>
        </div>

        {/* Courses Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="animate-spin text-blue-500" size={48} />
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            No courses found matching your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map(course => {
              const courseMentors = allUsers.filter(u => u.role === 'Mentor' && u.assigned_courses?.includes(course.id));
              const courseStudents = allUsers.filter(u => u.role === 'Student' && u.assigned_courses?.includes(course.id));
              return (
              <div key={course.id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-5 flex flex-col hover:border-gray-300 hover:shadow-md transition-all">

                <h3 className="text-lg font-bold text-black uppercase tracking-wide mb-2 line-clamp-2">
                  {course.title}
                </h3>

                <p className="text-gray-600 text-xs leading-relaxed mb-4 line-clamp-3">
                  This course provides an introduction to the fundamentals of the subject, its applications, and its impact on the industry. It is designed to provide learners with a strong foundation and practical skills.
                </p>

                <div className="flex flex-col gap-2 mb-6">
                  <div className="flex gap-2">
                    <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2">
                      <User size={14} className="text-blue-600" />
                      <span className="text-blue-600 text-xs font-bold">{courseMentors.length} MENTOR{courseMentors.length !== 1 && 'S'}</span>
                    </div>
                    <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2">
                      <Users size={14} className="text-green-600" />
                      <span className="text-green-600 text-xs font-bold">{courseStudents.length} STUDENT{courseStudents.length !== 1 && 'S'}</span>
                    </div>
                  </div>
                  <div className="flex">
                    <div className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-2">
                      <Calendar size={14} className="text-gray-500" />
                      <span className="text-gray-600 text-xs font-bold">
                        {new Date(course.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-auto grid grid-cols-3 gap-2">
                  <button onClick={() => navigate(`/admin/courses/${course.id}/content`, { state: { course } })} className="col-span-1 bg-blue-500 hover:bg-blue-600 text-white text-[10px] sm:text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors uppercase">
                    <Upload size={14} /> Content
                  </button>
                  <button onClick={() => navigate(`/admin/courses/${course.id}/preview`, { state: { course } })} className="col-span-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-blue-600 text-[10px] sm:text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors uppercase">
                    <Eye size={14} /> Preview
                  </button>


                  <button onClick={() => {
                      setSelectedCourseForStudents(course);
                      setIsStudentsModalOpen(true);
                    }} 
                    className="col-span-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[10px] sm:text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors uppercase"
                  >
                    <Users size={14} /> Students
                  </button>
                  <button
                    onClick={() => {
                      setEditingCourse(course);
                      const currentMentors = allUsers.filter(u => u.role === 'Mentor' && u.assigned_courses?.includes(course.id)).map(u => u.id);
                      setEditCourseMentors(currentMentors.length > 0 ? currentMentors : (course.mentor_id ? [course.mentor_id] : []));
                    }}
                    className="col-span-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 text-[10px] sm:text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors uppercase"
                  >
                    <Edit size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="col-span-1 bg-[#e60000] hover:bg-red-700 text-white text-[10px] sm:text-xs font-bold py-2.5 rounded flex items-center justify-center gap-1.5 transition-colors uppercase"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>

      {/* Create Course Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-black flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-black uppercase tracking-wider">Create New Course</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleCreateCourse} className="space-y-6 overflow-y-auto pr-2">
              <div>
                <label className="block text-sm font-bold text-blue-600 mb-2 uppercase">Course Title</label>
                <input
                  type="text"
                  value={createData.title}
                  onChange={e => setCreateData({ ...createData, title: e.target.value })}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-600 mb-2 uppercase">Description (Optional)</label>
                <textarea
                  value={createData.description}
                  onChange={e => setCreateData({ ...createData, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-md text-black focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-md">
                <input
                  type="checkbox"
                  id="sequential"
                  checked={createData.sequential}
                  onChange={e => setCreateData({ ...createData, sequential: e.target.checked })}
                  className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                />
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                  <label htmlFor="sequential" className="font-bold text-black text-base cursor-pointer">
                    Enable Sequential Learning
                  </label>
                  <span className="text-xs text-gray-500 uppercase tracking-wide">
                    (Students must complete content in order)
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-blue-600 mb-3 uppercase">Assign Mentors</label>
                <div className="border border-gray-200 rounded-md bg-white overflow-hidden max-h-48 overflow-y-auto">
                  {mentors.map(mentor => {
                    const email = `${mentor.name.toLowerCase().replace(/\s+/g, '')}@gmail.com`;
                    const customEmail = mentor.name === 'Saran' ? 'sarannithish282@gmail.com' : 
                                        mentor.name === 'Dharna Ahuja' ? 'dharnaahuja123@gmail.com' :
                                        mentor.name === 'Amol B' ? 'amolbandga1996@gmail.com' :
                                        mentor.name === 'Vasu Agarwal' ? 'vasuelibrary@gmail.com' : email;
                    return (
                      <label key={mentor.id} className="flex items-center gap-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer transition-colors">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                          checked={createData.mentors.includes(mentor.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setCreateData({ ...createData, mentors: [...createData.mentors, mentor.id] });
                            } else {
                              setCreateData({ ...createData, mentors: createData.mentors.filter(id => id !== mentor.id) });
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-black">{mentor.name}</span>
                          <span className="text-gray-500 text-sm hidden sm:inline">- {customEmail}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end pt-6 border-t border-gray-200 mt-6">
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-blue-500 text-black px-8 py-3 rounded-md flex items-center hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm uppercase font-black tracking-wider shadow-sm"
                >
                  {isCreating ? <Loader2 size={16} className="mr-2 animate-spin text-black" /> : null}
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal (Keeping original functionality but styling it slightly to match) */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-md w-full p-6 text-black">
            <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
              <h2 className="text-xl font-bold uppercase tracking-wider">Edit Course</h2>
              <button onClick={() => setEditingCourse(null)} className="text-gray-500 hover:text-black transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 uppercase text-xs">Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-black focus:outline-none focus:border-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 uppercase text-xs">Description</label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-black focus:outline-none focus:border-blue-500 min-h-[80px]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 uppercase text-xs">Category</label>
                <input
                  type="text"
                  value={editingCourse.category || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-black focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1 uppercase text-xs">Assign Mentors</label>
                <div className="border border-gray-200 rounded-md bg-white overflow-hidden max-h-40 overflow-y-auto">
                  {mentors.map(mentor => (
                    <label key={mentor.id} className="flex items-center gap-3 p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                        checked={editCourseMentors.includes(mentor.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditCourseMentors([...editCourseMentors, mentor.id]);
                            if (editCourseMentors.length === 0) {
                              setEditingCourse({ ...editingCourse, mentor_id: mentor.id }); // Fallback
                            }
                          } else {
                            setEditCourseMentors(editCourseMentors.filter(id => id !== mentor.id));
                          }
                        }}
                      />
                      <span className="font-bold text-sm text-black">{mentor.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-6 gap-3 border-t border-gray-200 mt-6">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 bg-gray-100 border border-gray-200 rounded-md hover:bg-gray-200 transition-colors text-sm uppercase font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md flex items-center hover:bg-blue-600 transition-colors disabled:opacity-50 text-sm uppercase font-bold"
                >
                  {isUpdating ? <Loader2 size={16} className="mr-2 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Students Modal */}
      {isStudentsModalOpen && selectedCourseForStudents && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
              <div>
                <h2 className="text-xl font-extrabold text-black uppercase tracking-wide">
                  Enrolled Students
                </h2>
                <p className="text-sm text-gray-500 font-medium mt-1">Course: <span className="text-orange-600 font-bold">{selectedCourseForStudents.title}</span></p>
              </div>
              <button 
                onClick={() => setIsStudentsModalOpen(false)}
                className="text-gray-400 hover:text-orange-500 transition-colors p-2 rounded-full hover:bg-orange-50"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 bg-white flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-6 bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-full text-white">
                    <Users size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-blue-900">Total Assigned Students</h3>
                    <p className="text-xs text-blue-700">Currently enrolled in this course</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-blue-600">
                  {(() => {
                    const actualStudents = allUsers.filter(u => u.role === 'Student' && u.assigned_courses?.includes(selectedCourseForStudents.id));
                    return actualStudents.length;
                  })()}
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Enrolled Date</th>
                      <th className="p-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const actualStudents = allUsers.filter(u => u.role === 'Student' && u.assigned_courses?.includes(selectedCourseForStudents.id));
                      
                      if (actualStudents.length === 0) {
                        return (
                          <tr>
                            <td colSpan={4} className="p-6 text-center text-gray-500 font-medium">No students currently assigned to this course.</td>
                          </tr>
                        );
                      }

                      return actualStudents.map((student) => (
                        <tr key={student.id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors">
                          <td className="p-3 font-bold text-gray-800 text-sm">{student.name}</td>
                          <td className="p-3 text-gray-600 text-sm">{student.email}</td>
                          <td className="p-3 text-gray-500 text-sm">
                            {new Date(student.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </td>
                          <td className="p-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                              student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setIsStudentsModalOpen(false)}
                className="bg-white border border-gray-300 text-gray-700 font-bold uppercase text-xs tracking-wider px-6 py-2.5 rounded hover:bg-gray-100 transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
