import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Loader2, X, ChevronDown, ChevronRight, Video, Upload, Edit, Trash, PlayCircle, Folder, ArrowLeft } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Course, Module, Lesson } from '../../types';

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
      const stored = localStorage.getItem('mock_courses');
      if (stored) {
        // Filter by assigned courses
        const allCourses: Course[] = JSON.parse(stored);
        const assignedIds = user.assigned_courses || [];
        setCourses(allCourses.filter(c => assignedIds.includes(c.id)));
      } else {
        setCourses([]);
      }
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
      return new Promise<string>((resolve) => {
        let progress = 0;
        const interval = setInterval(() => {
          progress += 20;
          setUploadProgress(progress);
          if (progress >= 100) {
            clearInterval(interval);
            // In a real app, this would be the Supabase Storage public URL
            // Here, we generate a mock local object URL for demonstration
            resolve(URL.createObjectURL(file));
          }
        }, 300);
      });
    };

    try {
      const mockVideoUrl = await simulateProgress();

      const moduleLessons = lessons.filter(l => l.module_id === targetModuleId);
      const lessonToInsert = {
        id: crypto.randomUUID(),
        module_id: targetModuleId,
        title: newVideo.title || file.name,
        description: newVideo.description,
        video_url: mockVideoUrl,
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
                          onClick={() => { setSelectedCourse(course); setViewMode('builder'); }}
                          className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-4 py-2 rounded-md transition-colors"
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

      {/* Add Course Modal */}
      {isCreateCourseModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Create New Course</h2>
              <button onClick={() => setIsCreateCourseModalOpen(false)} className="text-gray-400 hover:text-gray-600" disabled={isUpdating}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Title *</label>
                <input
                  type="text" required
                  value={newCourse.title}
                  onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                  placeholder="e.g. Master Full Stack Web Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newCourse.description}
                  onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-24 resize-none"
                  disabled={isUpdating}
                  placeholder="Provide a brief overview of what students will learn..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Thumbnail (Optional)</label>
                <div className="flex items-center space-x-4">
                  {newCourse.thumbnail ? (
                    <div className="relative w-24 h-16 rounded-md overflow-hidden border border-gray-200">
                      <img src={newCourse.thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setNewCourse({ ...newCourse, thumbnail: '' })}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-red-500 hover:text-red-700 shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 bg-gray-100 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Folder size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewCourse({ ...newCourse, thumbnail: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    value={newCourse.category}
                    onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={isUpdating}
                  >
                    <option value="Development">Development</option>
                    <option value="Business">Business</option>
                    <option value="IT & Software">IT & Software</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (Optional)</label>
                  <input
                    type="text"
                    value={newCourse.duration}
                    onChange={(e) => setNewCourse({ ...newCourse, duration: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    disabled={isUpdating}
                    placeholder="e.g. 10 hours"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">give it</label>
                <div className="flex items-center space-x-4">
                  {newCourse.video_url ? (
                    <div className="relative w-24 h-16 rounded-md overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center">
                      <span className="text-xs text-gray-500 truncate px-2">Video Selected</span>
                      <button
                        type="button"
                        onClick={() => setNewCourse({ ...newCourse, video_url: '' })}
                        className="absolute top-1 right-1 bg-white rounded-full p-0.5 text-red-500 hover:text-red-700 shadow-sm"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-16 bg-gray-100 rounded-md border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
                      <Folder size={20} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setNewCourse({ ...newCourse, video_url: reader.result as string });
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button type="button" onClick={() => setIsCreateCourseModalOpen(false)} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50" disabled={isUpdating}>
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center font-medium" disabled={isUpdating}>
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

    </div>
  );
}

