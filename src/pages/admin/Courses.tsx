import React, { useState, useEffect } from 'react';
import { Plus, Search, Loader2, Edit, Trash2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { Course } from '../../types';

export default function AdminCourses() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [mentors, setMentors] = useState<{ id: string; name: string }[]>([]);
  const [selectedMentor, setSelectedMentor] = useState('');

  // New state variables for search, edit, and delete
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchCourses = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching courses:', error);
    } else {
      setCourses(data || []);
    }
    setIsLoading(false);
  };

  const fetchMentors = async () => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'Mentor');

    if (!error && data) {
      setMentors(data);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchMentors();
  }, []);

  const handleCreateCourse = async () => {
    if (!newCourseTitle.trim() || !selectedMentor) {
      alert('Please provide a course title and select a mentor.');
      return;
    }
    setIsCreating(true);

    const { error } = await supabase
      .from('courses')
      .insert([
        {
          title: newCourseTitle,
          video_url: videoUrl,
          mentor_id: selectedMentor,
          status: 'Draft',
          category: 'Uncategorized'
        }
      ]);

    if (error) {
      alert('Failed to create course: ' + error.message);
    } else {
      setNewCourseTitle('');
      setVideoUrl('');
      setSelectedMentor('');
      fetchCourses();
    }
    setIsCreating(false);
  };

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this course?')) return;
    setIsDeleting(id);
    const { error } = await supabase.from('courses').delete().eq('id', id);
    if (error) {
      alert('Failed to delete course: ' + error.message);
    } else {
      setCourses(courses.filter(c => c.id !== id));
    }
    setIsDeleting(null);
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;
    setIsUpdating(true);

    const { error } = await supabase
      .from('courses')
      .update({
        title: editingCourse.title,
        category: editingCourse.category,
        status: editingCourse.status,
        video_url: editingCourse.video_url,
        mentor_id: editingCourse.mentor_id
      })
      .eq('id', editingCourse.id);

    if (error) {
      alert('Failed to update course: ' + error.message);
    } else {
      setEditingCourse(null);
      fetchCourses();
    }
    setIsUpdating(false);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (course.category || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Course Management</h1>
        <div className="flex flex-wrap gap-2 justify-end">
          <input
            type="text"
            placeholder="New Course Title..."
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onloadend = () => setVideoUrl(reader.result as string);
                reader.readAsDataURL(file);
              }
            }}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm w-32 md:w-48 text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          <select
            value={selectedMentor}
            onChange={(e) => setSelectedMentor(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="">Select Mentor...</option>
            {mentors.map(mentor => (
              <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
            ))}
          </select>
          <button
            onClick={handleCreateCourse}
            disabled={isCreating || !newCourseTitle.trim() || !selectedMentor}
            className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
          >
            {isCreating ? <Loader2 size={18} className="mr-2 animate-spin" /> : <Plus size={18} className="mr-2" />}
            Create Course
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">video</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                  Loading courses from Supabase...
                </td>
              </tr>
            ) : filteredCourses.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  No courses found.
                </td>
              </tr>
            ) : (
              filteredCourses.map(course => (
                <tr key={course.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{course.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{course.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${course.status === 'Published' ? 'bg-green-100 text-green-800' :
                        course.status === 'Draft' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'}`}>
                      {course.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.video_url || 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(course.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => setEditingCourse(course)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      title="Edit Course"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourse(course.id)}
                      className="text-red-600 hover:text-red-900"
                      disabled={isDeleting === course.id}
                      title="Delete Course"
                    >
                      {isDeleting === course.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingCourse && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Edit Course</h2>
              <button onClick={() => setEditingCourse(null)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleUpdateCourse} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={editingCourse.title}
                  onChange={e => setEditingCourse({ ...editingCourse, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <input
                  type="text"
                  value={editingCourse.category || ''}
                  onChange={e => setEditingCourse({ ...editingCourse, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">give it</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => setEditingCourse({ ...editingCourse, video_url: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {editingCourse.video_url && <p className="text-xs text-gray-500 mt-1">Video is selected.</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mentor</label>
                <select
                  value={editingCourse.mentor_id}
                  onChange={e => setEditingCourse({ ...editingCourse, mentor_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select Mentor...</option>
                  {mentors.map(mentor => (
                    <option key={mentor.id} value={mentor.id}>{mentor.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingCourse.status}
                  onChange={e => setEditingCourse({ ...editingCourse, status: e.target.value as 'Draft' | 'Published' | 'Archived' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="Draft">Draft</option>
                  <option value="Published">Published</option>
                  <option value="Archived">Archived</option>
                </select>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md mr-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isUpdating ? <Loader2 size={18} className="mr-2 animate-spin" /> : null}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
