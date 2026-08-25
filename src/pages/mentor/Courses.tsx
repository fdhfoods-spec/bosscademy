import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X, ChevronDown, ChevronRight, Video, Upload, Edit, Trash, PlayCircle, Folder, ArrowLeft, FileText, Monitor, Eye } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { saveFile } from '../../lib/storage';
import LocalMediaRenderer from '../../components/LocalMediaRenderer';
import type { Course, Module, Lesson } from '../../types';
import { getMockCourses } from '../../lib/mockData';

export default function MentorCourses() {
  const { user } = useAuth();

  // View State
  const [viewMode, setViewMode] = useState<'list' | 'builder'>('list');
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // Builder Data State
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);

  // UI State
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  // Modals
  const [isCreateModuleModalOpen, setIsCreateModuleModalOpen] = useState(false);
  const [newModule, setNewModule] = useState({ title: '', description: '' });

  const [isVideoUploadModalOpen, setIsVideoUploadModalOpen] = useState(false);
  const [targetModuleId, setTargetModuleId] = useState<string | null>(null);
  const [newVideo, setNewVideo] = useState({ title: '', description: '' });
  const [uploadProgress, setUploadProgress] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preview Modal
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewActiveLesson, setPreviewActiveLesson] = useState<Lesson | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // -----------------------------------------------------
  // DATA FETCHING
  // -----------------------------------------------------

  const fetchCourses = async () => {
    if (!user) return;
    setIsLoading(true);

    if (IS_MOCK_SUPABASE) {
      const allCourses = getMockCourses();
      const assignedIds = user.assigned_courses || [];
      setCourses(allCourses.filter(c => assignedIds.includes(c.id)));
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .in('id', user.assigned_courses || [])
      .order('created_at', { ascending: false });

    if (error) {
      showNotification('Failed to fetch courses: ' + error.message, 'error');
    } else {
      setCourses(data as Course[] || []);
    }
    setIsLoading(false);
  };

  const fetchCourseContent = async (courseId: string) => {
    setIsLoading(true);

    if (IS_MOCK_SUPABASE) {
      const storedModules = localStorage.getItem('mock_modules');
      const storedLessons = localStorage.getItem('mock_lessons');

      let courseModules: Module[] = [];
      let courseLessons: Lesson[] = [];

      if (storedModules) {
        courseModules = (JSON.parse(storedModules) as Module[]).filter(m => m.course_id === courseId);
      }
      if (storedLessons) {
        const moduleIds = courseModules.map(m => m.id);
        courseLessons = (JSON.parse(storedLessons) as Lesson[]).filter(l => moduleIds.includes(l.module_id));
      }

      setModules(courseModules.sort((a, b) => a.sort_order - b.sort_order));
      setLessons(courseLessons.sort((a, b) => a.sort_order - b.sort_order));

      // Auto-expand all modules
      const expanded: Record<string, boolean> = {};
      courseModules.forEach(m => { expanded[m.id] = true; });
      setExpandedModules(expanded);

      setIsLoading(false);
      return;
    }

    // Fetch Modules
    const { data: moduleData, error: moduleError } = await supabase
      .from('modules')
      .select('*')
      .eq('course_id', courseId)
      .order('sort_order', { ascending: true });

    if (moduleError) {
      showNotification('Failed to fetch modules: ' + moduleError.message, 'error');
      setIsLoading(false);
      return;
    }

    setModules(moduleData as Module[] || []);

    // Auto-expand all
    const expanded: Record<string, boolean> = {};
    (moduleData || []).forEach(m => { expanded[m.id] = true; });
    setExpandedModules(expanded);

    // Fetch Lessons for these modules
    if (moduleData && moduleData.length > 0) {
      const moduleIds = moduleData.map(m => m.id);
      const { data: lessonData, error: lessonError } = await supabase
        .from('lessons')
        .select('*')
        .in('module_id', moduleIds)
        .order('sort_order', { ascending: true });

      if (lessonError) {
        showNotification('Failed to fetch lessons: ' + lessonError.message, 'error');
      } else {
        setLessons(lessonData as Lesson[] || []);
      }
    } else {
      setLessons([]);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (viewMode === 'list') {
      fetchCourses();
    } else if (viewMode === 'builder' && selectedCourse) {
      fetchCourseContent(selectedCourse.id);
    }
  }, [viewMode, selectedCourse]);

  // Course creation removed: Admin is the single source of truth

  // -----------------------------------------------------
  // ACTIONS: BUILDER (MODULES & LESSONS)
  // -----------------------------------------------------

  const handleCreateModule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;
    if (!newModule.title.trim()) {
      showNotification('Module title is required.', 'error');
      return;
    }

    setIsUpdating(true);
    const sortOrder = modules.length;
    const moduleToInsert = {
      id: crypto.randomUUID(),
      course_id: selectedCourse.id,
      title: newModule.title,
      description: newModule.description,
      sort_order: sortOrder,
      created_at: new Date().toISOString(),
    };

    if (IS_MOCK_SUPABASE) {
      const allModules: Module[] = JSON.parse(localStorage.getItem('mock_modules') || '[]');
      const updated = [...allModules, moduleToInsert as Module];
      localStorage.setItem('mock_modules', JSON.stringify(updated));
      setModules([...modules, moduleToInsert as Module]);
      setExpandedModules(prev => ({ ...prev, [moduleToInsert.id]: true }));
      setIsCreateModuleModalOpen(false);
      setNewModule({ title: '', description: '' });
      showNotification('Module added successfully!', 'success');
      setIsUpdating(false);
      return;
    }

    const { error } = await supabase.from('modules').insert([moduleToInsert]);
    if (error) {
      showNotification('Failed to create module: ' + error.message, 'error');
    } else {
      setIsCreateModuleModalOpen(false);
      setNewModule({ title: '', description: '' });
      fetchCourseContent(selectedCourse.id);
      showNotification('Module added successfully!', 'success');
    }
    setIsUpdating(false);
  };

  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleId || !selectedCourse) return;

    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      showNotification('Please select a video file.', 'error');
      return;
    }

    if (!file.type.startsWith('video/')) {
      showNotification('Invalid file format. Please select a video file.', 'error');
      return;
    }

    setIsUpdating(true);
    setUploadProgress(0);

    // Simulate upload progress
    const simulateProgress = () => {
      return new Promise<void>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            resolve();
          }
        }, 300);
      });
    };

    try {
      await simulateProgress();

      const newId = crypto.randomUUID();
      
      // Save actual file to IndexedDB for persistent storage
      await saveFile(newId, file);

      const moduleLessons = lessons.filter(l => l.module_id === targetModuleId);
      const lessonToInsert = {
        id: newId,
        module_id: targetModuleId,
        title: newVideo.title || file.name,
        description: newVideo.description,
        video_url: '', // Local Media Renderer handles fetching from IndexedDB
        duration: '10:00', // Mock duration
        sort_order: moduleLessons.length,
        created_at: new Date().toISOString(),
      };

      if (IS_MOCK_SUPABASE) {
        const allLessons: Lesson[] = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
        const updated = [...allLessons, lessonToInsert as Lesson];
        localStorage.setItem('mock_lessons', JSON.stringify(updated));
        setLessons([...lessons, lessonToInsert as Lesson]);

        setIsVideoUploadModalOpen(false);
        setNewVideo({ title: '', description: '' });
        setTargetModuleId(null);
        setUploadProgress(-1);
        if (fileInputRef.current) fileInputRef.current.value = '';
        showNotification('Video uploaded and saved to database successfully!', 'success');
        setIsUpdating(false);
        return;
      }

      // Live Supabase Insert
      const { error } = await supabase.from('lessons').insert([lessonToInsert]);

      if (error) {
        throw new Error(error.message);
      }

      setIsVideoUploadModalOpen(false);
      setNewVideo({ title: '', description: '' });
      setTargetModuleId(null);
      setUploadProgress(-1);
      if (fileInputRef.current) fileInputRef.current.value = '';
      fetchCourseContent(selectedCourse.id);
      showNotification('Video uploaded successfully!', 'success');

    } catch (err: any) {
      showNotification('Upload failed: ' + err.message, 'error');
      setUploadProgress(-1);
    }

    setIsUpdating(false);
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({
      ...prev,
      [moduleId]: !prev[moduleId]
    }));
  };

  // -----------------------------------------------------
  // RENDER HELPERS
  // -----------------------------------------------------

  const filteredCourses = courses.filter(c =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 relative">
      {notification && (
        <div className={`fixed top-4 right-4 z-[100] p-4 rounded-md shadow-lg border-l-4 font-medium transition-all ${notification.type === 'success' ? 'bg-green-50 border-green-500 text-green-800' : 'bg-red-50 border-red-500 text-red-800'
          }`}>
          {notification.message}
        </div>
      )}

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {viewMode === 'builder' && (
            <button
              onClick={() => { setViewMode('list'); setSelectedCourse(null); }}
              className="text-sm text-gray-500 hover:text-blue-600 flex items-center mb-2 font-medium"
            >
              <ArrowLeft size={16} className="mr-1" /> Back to My Courses
            </button>
          )}
          <h1 className="text-2xl font-bold text-gray-900">
            {viewMode === 'list' ? 'My Assigned Courses' : `Course Builder: ${selectedCourse?.title}`}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {viewMode === 'list' ? 'Manage the courses you own and upload new lessons.' : 'Organize modules and upload give it content.'}
          </p>
        </div>

        {/* Removed Create Course Button */}
      </div>

      {/* ----------------------------------------------------- */}
      {/* LIST VIEW */}
      {/* ----------------------------------------------------- */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search my courses..."
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">video</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                      Loading your courses...
                    </td>
                  </tr>
                ) : filteredCourses.length > 0 ? (
                  filteredCourses.map(course => (
                    <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{course.title}</div>
                        <div className="text-xs text-gray-500 mt-1 line-clamp-1">{course.description || 'No description'}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800">
                          {course.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {course.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.video_url || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={async () => { 
                            if (user?.role !== 'Mentor') return;
                            setSelectedCourse(course); 
                            await fetchCourseContent(course.id);
                            setIsPreviewModalOpen(true);
                          }}
                          className="bg-orange-50 text-orange-600 hover:bg-orange-100 px-3 py-1.5 rounded-md transition-colors mr-2 inline-flex items-center"
                        >
                          <Eye size={16} className="mr-1" /> Preview
                        </button>
                        <button
                          onClick={() => { setSelectedCourse(course); setViewMode('builder'); }}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-1.5 rounded-md transition-colors inline-flex items-center"
                        >
                          Manage Content
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                      You haven't been assigned any courses yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* BUILDER VIEW */}
      {/* ----------------------------------------------------- */}
      {viewMode === 'builder' && selectedCourse && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Modules & Lessons */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <h2 className="font-bold text-gray-900 flex items-center">
                <Folder className="mr-2 text-blue-500" size={20} />
                Course Curriculum
              </h2>
              <button
                onClick={() => setIsCreateModuleModalOpen(true)}
                className="text-sm bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors flex items-center"
              >
                <Plus size={16} className="mr-1" /> Add Chapter
              </button>
            </div>

            {isLoading ? (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                <p className="text-gray-500 text-sm">Loading curriculum...</p>
              </div>
            ) : modules.length > 0 ? (
              modules.map((module, index) => {
                const moduleLessons = lessons.filter(l => l.module_id === module.id);
                const isExpanded = expandedModules[module.id];

                return (
                  <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all">
                    {/* Module Header */}
                    <div
                      className="p-4 bg-gray-50/80 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleModule(module.id)}
                    >
                      <div className="flex items-center">
                        {isExpanded ? <ChevronDown size={18} className="text-gray-400 mr-2" /> : <ChevronRight size={18} className="text-gray-400 mr-2" />}
                        <span className="font-semibold text-gray-900">Chapter {index + 1}: {module.title}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className="text-xs text-gray-500 font-medium">{moduleLessons.length} lessons</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); setTargetModuleId(module.id); setIsVideoUploadModalOpen(true); }}
                          className="flex items-center text-xs bg-white border border-gray-200 text-gray-700 hover:border-blue-300 hover:text-blue-600 px-2 py-1 rounded transition-colors"
                        >
                          <Upload size={14} className="mr-1" /> give it
                        </button>
                      </div>
                    </div>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="p-2">
                        {moduleLessons.length > 0 ? (
                          <div className="space-y-1">
                            {moduleLessons.map((lesson, lIndex) => (
                              <div key={lesson.id} className="flex items-center justify-between p-3 hover:bg-blue-50/50 rounded-lg group transition-colors">
                                <div className="flex items-center">
                                  <div className="w-6 text-xs text-gray-400 text-right mr-3">{lIndex + 1}.</div>
                                  <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 mr-3">
                                    <PlayCircle size={16} />
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-gray-900">{lesson.title}</p>
                                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                                      <Video size={12} className="mr-1" /> video • {lesson.duration || '0:00'}
                                    </p>
                                  </div>
                                </div>
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                                  <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50">
                                    <Edit size={14} />
                                  </button>
                                  <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50">
                                    <Trash size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="p-6 text-center text-sm text-gray-500 italic bg-gray-50/30 rounded-lg m-2 border border-dashed border-gray-200">
                            No give it in this chapter yet. Click "give it" to add one.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                <Folder className="mx-auto text-gray-300 mb-3" size={32} />
                <h3 className="text-gray-900 font-medium mb-1">Empty Curriculum</h3>
                <p className="text-gray-500 text-sm mb-4">Start by adding your first chapter to this course.</p>
                <button
                  onClick={() => setIsCreateModuleModalOpen(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 inline-flex items-center"
                >
                  <Plus size={16} className="mr-2" /> Add Chapter
                </button>
              </div>
            )}
          </div>

          {/* Right Column: Course Info */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Course Overview</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Status</p>
                  <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedCourse.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                    {selectedCourse.status}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Category</p>
                  <p className="text-sm text-gray-900 font-medium">{selectedCourse.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Description</p>
                  <p className="text-sm text-gray-600 leading-relaxed">{selectedCourse.description || 'No description provided.'}</p>
                </div>
                <div className="pt-4 border-t border-gray-100">
                  <button className="w-full bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md font-medium text-sm hover:bg-gray-50 transition-colors">
                    Edit Course Details
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-5 rounded-xl border border-blue-100">
              <h3 className="font-bold text-blue-900 mb-2">Publishing</h3>
              <p className="text-sm text-blue-700 mb-4">
                Once you have uploaded all your give it, you can publish the course to make it visible to enrolled students.
              </p>
              <button className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-md font-medium text-sm hover:bg-blue-700 transition-colors shadow-sm">
                Publish Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------------------------------- */}
      {/* MODALS */}
      {/* ----------------------------------------------------- */}



      {/* Add Module Modal */}
      {isCreateModuleModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Add Chapter</h2>
              <button onClick={() => setIsCreateModuleModalOpen(false)} className="text-gray-400 hover:text-gray-600" disabled={isUpdating}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateModule} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chapter Title *</label>
                <input
                  type="text" required
                  value={newModule.title}
                  onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                  placeholder="e.g. Introduction to React"
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCreateModuleModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50" disabled={isUpdating}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium" disabled={isUpdating}>
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Save Chapter
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Video Modal */}
      {isVideoUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Upload give it Lesson</h2>
              <button onClick={() => { setIsVideoUploadModalOpen(false); setUploadProgress(-1); }} className="text-gray-400 hover:text-gray-600" disabled={isUpdating}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUploadVideo} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">give it Title</label>
                <input
                  type="text"
                  value={newVideo.title}
                  onChange={(e) => setNewVideo({ ...newVideo, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                  placeholder="Optional (will use file name if empty)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Select give it File *</label>
                <div className={`border-2 border-dashed rounded-lg p-6 text-center ${uploadProgress > -1 ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'} transition-colors relative`}>
                  {uploadProgress > -1 ? (
                    <div className="space-y-3">
                      <Loader2 className="animate-spin mx-auto text-blue-500" size={32} />
                      <p className="text-sm font-medium text-blue-700">Uploading give it...</p>
                      <div className="w-full bg-blue-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                      <p className="text-xs text-blue-600">{uploadProgress}%</p>
                    </div>
                  ) : (
                    <>
                      <input
                        type="file"
                        accept="video/*"
                        required
                        ref={fileInputRef}
                        disabled={isUpdating}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="mx-auto text-gray-400 mb-2" size={32} />
                      <p className="text-sm font-medium text-gray-900">Click to browse or drag give it here</p>
                      <p className="text-xs text-gray-500 mt-1">MP4, WebM up to 2GB</p>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsVideoUploadModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50" disabled={isUpdating}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium" disabled={isUpdating}>
                  {isUpdating ? 'Uploading...' : 'Upload & Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Course Preview Modal */}
      {isPreviewModalOpen && selectedCourse && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex flex-col p-4 sm:p-6 lg:p-8 overflow-hidden">
          <div className="bg-white flex-1 rounded-xl shadow-2xl flex flex-col overflow-hidden max-w-7xl mx-auto w-full">
            
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setIsPreviewModalOpen(false)}
                  className="flex items-center text-gray-500 hover:text-orange-500 transition-colors font-bold text-sm uppercase tracking-wider"
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Close Preview
                </button>
                <div className="h-4 w-px bg-gray-300"></div>
                <h2 className="font-extrabold text-black uppercase">{selectedCourse.title}</h2>
              </div>
              <div className="bg-orange-100 text-orange-600 border border-orange-200 px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider">
                Mentor Preview
              </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 overflow-hidden">
              
              {/* Left Column: Media Player */}
              <div className="lg:col-span-2 bg-gray-50 p-6 flex flex-col overflow-y-auto border-r border-gray-200">
                {previewActiveLesson ? (
                  <>
                    <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center shadow-md border border-gray-200 overflow-hidden relative mb-4">
                      {previewActiveLesson.video_url || IS_MOCK_SUPABASE ? (
                        <div className="w-full h-full">
                          <LocalMediaRenderer id={previewActiveLesson.id} type={previewActiveLesson.title.toLowerCase().includes('pdf') ? 'PDF' : previewActiveLesson.title.toLowerCase().includes('ppt') ? 'PPT' : 'VIDEO'} fallbackUrl={previewActiveLesson.video_url || undefined} />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          {previewActiveLesson.title.toLowerCase().includes('pdf') ? (
                            <FileText size={64} className="mb-2" />
                          ) : previewActiveLesson.title.toLowerCase().includes('ppt') || previewActiveLesson.title.toLowerCase().includes('presentation') ? (
                            <Monitor size={64} className="mb-2" />
                          ) : (
                            <PlayCircle size={64} className="mb-2" />
                          )}
                          <span className="text-sm uppercase tracking-wider font-bold">No Media File Uploaded</span>
                        </div>
                      )}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                      <div className="inline-block bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded mb-3 uppercase tracking-wider">
                        {previewActiveLesson.title.toLowerCase().includes('pdf') ? 'PDF' 
                          : previewActiveLesson.title.toLowerCase().includes('ppt') ? 'PPT' 
                          : 'VIDEO'}
                      </div>
                      <h2 className="text-2xl font-extrabold text-black uppercase tracking-wide">
                        {previewActiveLesson.title}
                      </h2>
                      {previewActiveLesson.description && (
                        <p className="text-gray-600 mt-2 text-sm">{previewActiveLesson.description}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-gray-400 h-full">
                    <Folder size={48} className="mb-4 text-gray-300" />
                    <p className="text-sm font-bold uppercase tracking-wider text-gray-400">Select a lesson from the curriculum</p>
                  </div>
                )}
              </div>

              {/* Right Column: Course Curriculum */}
              <div className="lg:col-span-1 bg-white flex flex-col overflow-hidden">
                <div className="p-5 border-b border-gray-200 bg-gray-50/50">
                  <h3 className="text-lg font-black text-black uppercase tracking-wider">Course Curriculum</h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {modules.length > 0 ? modules.map((module, mIndex) => {
                    const moduleLessons = lessons.filter(l => l.module_id === module.id);
                    return (
                      <div key={module.id} className="space-y-2">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Chapter {mIndex + 1}: {module.title}</h4>
                        {moduleLessons.length > 0 ? moduleLessons.map((lesson, lIndex) => {
                          const isPdf = lesson.title.toLowerCase().includes('pdf');
                          const isPpt = lesson.title.toLowerCase().includes('ppt');
                          const isVideo = !isPdf && !isPpt;
                          
                          return (
                            <button
                              key={lesson.id}
                              onClick={() => setPreviewActiveLesson(lesson)}
                              className={`w-full text-left p-3 rounded-md border transition-all ${
                                previewActiveLesson?.id === lesson.id 
                                  ? 'bg-orange-50 border-orange-500 shadow-sm' 
                                  : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="mt-0.5">
                                  {isPdf && <FileText size={16} className={previewActiveLesson?.id === lesson.id ? 'text-orange-500' : 'text-gray-400'} />}
                                  {isVideo && <PlayCircle size={16} className={previewActiveLesson?.id === lesson.id ? 'text-orange-500' : 'text-gray-400'} />}
                                  {isPpt && <Monitor size={16} className={previewActiveLesson?.id === lesson.id ? 'text-orange-500' : 'text-gray-400'} />}
                                </div>
                                <div>
                                  <h4 className={`text-sm font-bold leading-snug mb-1 ${previewActiveLesson?.id === lesson.id ? 'text-orange-700' : 'text-black'}`}>
                                    {lIndex + 1}. {lesson.title}
                                  </h4>
                                  <p className={`text-[10px] uppercase font-bold tracking-wider ${previewActiveLesson?.id === lesson.id ? 'text-orange-600' : 'text-gray-500'}`}>
                                    {isPdf ? 'PDF' : isPpt ? 'PPT' : 'VIDEO'} {lesson.duration && `• ${lesson.duration}`}
                                  </p>
                                </div>
                              </div>
                            </button>
                          );
                        }) : (
                          <div className="text-xs text-gray-400 italic p-2 border border-dashed border-gray-200 rounded">No content in this chapter</div>
                        )}
                      </div>
                    );
                  }) : (
                    <div className="text-center py-8 text-sm text-gray-500 italic">
                      No curriculum available for this course yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

