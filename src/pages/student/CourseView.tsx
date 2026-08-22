import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayCircle, ArrowLeft, Loader2, CheckCircle2, CheckCircle } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Course, Module, Lesson, Enrollment } from '../../types';

export default function StudentCourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  
  const [completedLessons, setCompletedLessons] = useState<Record<string, boolean>>({});
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (courseId && user) {
      fetchCourseData();
    }
  }, [courseId, user]);

  const fetchCourseData = async () => {
    if (!courseId || !user) return;
    setIsLoading(true);
    setError(null);

    try {
      if (IS_MOCK_SUPABASE) {
        // Mock Mode Fetch
        const allCourses: Course[] = JSON.parse(localStorage.getItem('mock_courses') || '[]');
        const allModules: Module[] = JSON.parse(localStorage.getItem('mock_modules') || '[]');
        const allLessons: Lesson[] = JSON.parse(localStorage.getItem('mock_lessons') || '[]');
        const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');

        const foundCourse = allCourses.find(c => c.id === courseId);
        if (!foundCourse || foundCourse.status !== 'Published') {
          throw new Error("Course not found or is not published.");
        }

        const foundEnrollment = allEnrollments.find(e => e.course_id === courseId && e.student_id === user.id);
        if (!foundEnrollment) {
          throw new Error("You are not enrolled in this course.");
        }

        const courseModules = allModules.filter(m => m.course_id === courseId).sort((a, b) => a.sort_order - b.sort_order);
        const moduleIds = courseModules.map(m => m.id);
        const courseLessons = allLessons.filter(l => moduleIds.includes(l.module_id)).sort((a, b) => a.sort_order - b.sort_order);

        setCourse(foundCourse);
        setEnrollment(foundEnrollment);
        setModules(courseModules);
        setLessons(courseLessons);
        
        // Expand first module by default
        if (courseModules.length > 0) {
          setExpandedModules({ [courseModules[0].id]: true });
        }
        
        // Expand first module by default
        if (courseModules.length > 0) {
          setExpandedModules({ [courseModules[0].id]: true });
        }

        // Mock completed lessons from progress (just a generic mock, normally stored per lesson)
        // For local mock, we'll just parse an array if it exists, otherwise empty
        const mockCompleted = JSON.parse(localStorage.getItem(`mock_completed_${user.id}_${courseId}`) || '{}');
        setCompletedLessons(mockCompleted);

        setIsLoading(false);
        return;
      }

      // Live Supabase Fetch
      // 1. Verify Enrollment & Course
      const { data: enrData, error: enrError } = await supabase
        .from('enrollments')
        .select('*, courses(*)')
        .eq('course_id', courseId)
        .eq('student_id', user.id)
        .single();

      if (enrError || !enrData) {
        throw new Error("You are not enrolled in this course.");
      }
      
      const courseData = enrData.courses as any;
      if (courseData.status !== 'Published') {
        throw new Error("Course is not available.");
      }

      setCourse(courseData as Course);
      setEnrollment(enrData as unknown as Enrollment);

      // 2. Fetch Modules
      const { data: modData, error: modError } = await supabase
        .from('modules')
        .select('*')
        .eq('course_id', courseId)
        .order('sort_order', { ascending: true });

      if (modError) throw modError;
      setModules(modData as Module[] || []);

      // 3. Fetch Lessons
      if (modData && modData.length > 0) {
        const modIds = modData.map(m => m.id);
        const { data: lessData, error: lessError } = await supabase
          .from('lessons')
          .select('*')
          .in('module_id', modIds)
          .order('sort_order', { ascending: true });
          
        if (lessError) throw lessError;
        setLessons(lessData as Lesson[] || []);
        
      }
    } catch (err: any) {
      setError(err.message);
    }
    
    setIsLoading(false);
  };


  const toggleLessonComplete = async (lessonId: string) => {
    if (!course || !enrollment || !user) return;
    
    const isCurrentlyComplete = completedLessons[lessonId];
    const newCompletedState = { ...completedLessons, [lessonId]: !isCurrentlyComplete };
    setCompletedLessons(newCompletedState);
    
    // Calculate new progress %
    const totalLessons = lessons.length;
    const completedCount = Object.keys(newCompletedState).filter(k => newCompletedState[k]).length;
    const progress = totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : (newCompletedState[lessonId] ? 100 : 0);
    const status = progress === 100 ? 'completed' : 'active';
    
    if (IS_MOCK_SUPABASE) {
      localStorage.setItem(`mock_completed_${user.id}_${course.id}`, JSON.stringify(newCompletedState));
      
      // Update enrollment mock
      const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const updatedEnrollments = allEnrollments.map(e => {
        if (e.id === enrollment.id) {
          return { ...e, progress, status };
        }
        return e;
      });
      localStorage.setItem('mock_enrollments', JSON.stringify(updatedEnrollments));
      setEnrollment({ ...enrollment, progress, status } as Enrollment);
      return;
    }

    // Live Supabase update
    const { error } = await supabase
      .from('enrollments')
      .update({ progress, status })
      .eq('id', enrollment.id);
      
    if (!error) {
      setEnrollment({ ...enrollment, progress, status } as Enrollment);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={48} />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="max-w-3xl mx-auto mt-12 p-8 bg-white rounded-xl shadow-sm text-center">
        <Lock className="mx-auto text-red-400 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-6">{error || 'Course not found.'}</p>
        <Link to="/student/enrollment" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
          Back to Courses
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] bg-gray-100 overflow-hidden -m-6">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center">
          <Link to="/student/dashboard" className="text-gray-500 hover:text-gray-900 mr-4 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{course.title}</h1>
            <p className="text-xs text-gray-500">{enrollment?.progress}% Completed</p>
          </div>
        </div>
        <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden hidden sm:block">
          <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${enrollment?.progress || 0}%` }}></div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-8">
          {modules.map((module, mIdx) => {
            const moduleLessons = lessons.filter(l => l.module_id === module.id);
            if (moduleLessons.length === 0) return null;
            
            return (
              <div key={module.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="bg-gray-900 px-6 py-4 border-b border-gray-800 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Chapter {mIdx + 1}: {module.title}</h2>
                    <p className="text-gray-400 text-sm mt-1">{moduleLessons.length} lessons</p>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {moduleLessons.map((lesson) => {
                      const isCompleted = completedLessons[lesson.id];
                      return (
                        <div key={lesson.id} className="bg-gray-50 rounded-lg border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                          {/* Video container */}
                          <div className="aspect-video bg-black relative flex-shrink-0">
                            {lesson.video_url ? (
                              <video 
                                src={lesson.video_url} 
                                className="w-full h-full object-contain"
                                controls
                                controlsList="nodownload"
                              />
                            ) : (
                              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                <PlayCircle size={32} className="mb-2 opacity-50" />
                                <span className="text-sm">No video</span>
                              </div>
                            )}
                          </div>
                          
                          {/* Details */}
                          <div className="p-4 flex-1 flex flex-col bg-white">
                            <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{lesson.title}</h3>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{lesson.description}</p>
                            )}
                            
                            <div className="mt-auto pt-4 border-t border-gray-100">
                              <button
                                onClick={() => toggleLessonComplete(lesson.id)}
                                className={`w-full py-2 px-4 rounded-md font-medium text-sm flex items-center justify-center transition-colors ${
                                  isCompleted 
                                    ? 'bg-green-100 text-green-700 hover:bg-green-200 border border-green-200' 
                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                }`}
                              >
                                {isCompleted ? (
                                  <><CheckCircle size={16} className="mr-2" /> Completed</>
                                ) : (
                                  <><CheckCircle2 size={16} className="mr-2 text-gray-400" /> Mark as Complete</>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
          
          {modules.length === 0 && (
             <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-200">
                <PlayCircle className="mx-auto mb-4 text-gray-300" size={64} />
                <h3 className="text-lg font-medium text-gray-900">No Content</h3>
                <p className="text-gray-500 mt-1">This course doesn't have any lessons yet.</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
