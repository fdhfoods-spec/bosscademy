import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PlayCircle, ArrowLeft, Loader2, CheckCircle2, ChevronLeft, ChevronRight, FileText, Monitor, Check } from 'lucide-react';
import { IS_MOCK_SUPABASE } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { Course, Module, Lesson, Enrollment } from '../../types';
import { getMockCurriculum } from '../../lib/mockData';
import LocalMediaRenderer from '../../components/LocalMediaRenderer';

type CourseStep = {
  id: string;
  title: string;
  description?: string;
  type: string; // 'VIDEO', 'PDF', 'IMAGE', 'TEXT', etc.
  video_url?: string;
  moduleId?: string;
};

export default function StudentCourseView() {
  const { courseId } = useParams<{ courseId: string }>();
  const { user } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [courseItems, setCourseItems] = useState<CourseStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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
        
        const steps: CourseStep[] = [];
        courseModules.forEach(module => {
          const modLessons = courseLessons.filter(l => l.module_id === module.id);
          modLessons.forEach(l => {
            steps.push({
              id: l.id,
              title: l.title,
              description: l.description,
              type: l.video_url ? 'VIDEO' : 'TEXT',
              video_url: l.video_url,
              moduleId: module.id
            });
          });
        });

        // Append Curriculum Items (uploaded files like PDF/Videos)
        const courseCurriculum = getMockCurriculum().filter(c => c.course_id === courseId);
        courseCurriculum.forEach(c => {
          steps.push({
            id: c.id,
            title: c.title,
            type: c.type, // 'PDF', 'VIDEO', 'IMAGE', etc.
          });
        });

        setCourse(foundCourse);
        setEnrollment(foundEnrollment);
        setCourseItems(steps);
        
        const mockCompleted = JSON.parse(localStorage.getItem(`mock_completed_${user.id}_${courseId}`) || '{}');
        setCompletedLessons(mockCompleted);

        // Find first incomplete step to resume
        if (steps.length > 0) {
          const firstIncompleteIdx = steps.findIndex(step => !mockCompleted[step.id]);
          if (firstIncompleteIdx !== -1) {
            setCurrentIndex(firstIncompleteIdx);
          }
        }

        setIsLoading(false);
        return;
      }

      // Live Supabase Fetch (omitted for brevity, assume similar structure extraction)
      throw new Error("Live Supabase fetch not fully implemented for unified sequence.");
      
    } catch (err: any) {
      setError(err.message);
    }
    
    setIsLoading(false);
  };

  const updateProgress = async (newCompletedState: Record<string, boolean>) => {
    if (!course || !enrollment || !user) return;

    const totalSteps = courseItems.length;
    const completedCount = Object.keys(newCompletedState).filter(k => newCompletedState[k]).length;
    const progress = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;
    const status = progress === 100 ? 'completed' : 'active';
    
    if (IS_MOCK_SUPABASE) {
      localStorage.setItem(`mock_completed_${user.id}_${course.id}`, JSON.stringify(newCompletedState));
      
      const allEnrollments: Enrollment[] = JSON.parse(localStorage.getItem('mock_enrollments') || '[]');
      const updatedEnrollments = allEnrollments.map(e => {
        if (e.id === enrollment.id) {
          return { ...e, progress, status };
        }
        return e;
      });
      localStorage.setItem('mock_enrollments', JSON.stringify(updatedEnrollments));
      setEnrollment({ ...enrollment, progress, status } as Enrollment);
    }
  };

  const handleNextComplete = () => {
    const currentStep = courseItems[currentIndex];
    if (!currentStep) return;

    const isCurrentlyComplete = completedLessons[currentStep.id];
    
    if (!isCurrentlyComplete) {
      const newCompletedState = { ...completedLessons, [currentStep.id]: true };
      setCompletedLessons(newCompletedState);
      updateProgress(newCompletedState);
    }

    if (currentIndex < courseItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <div className="max-w-md mx-auto p-8 bg-white rounded-xl shadow-sm text-center">
          <ArrowLeft className="mx-auto text-red-400 mb-4" size={48} />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">{error || 'Course not found.'}</p>
          <Link to="/student/enrollment" className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 font-medium">
            Back to Courses
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = courseItems[currentIndex];
  const isLastStep = currentIndex === courseItems.length - 1;
  const isCurrentCompleted = currentStep ? completedLessons[currentStep.id] : false;

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
        <div className="flex items-center">
          <Link to="/student/enrollment" className="text-gray-500 hover:text-gray-900 mr-4 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="font-bold text-gray-900 text-lg leading-tight">{course.title}</h1>
            <p className="text-xs text-gray-500">{enrollment?.progress || 0}% Completed</p>
          </div>
        </div>
        <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden hidden sm:block">
          <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${enrollment?.progress || 0}%` }}></div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar / Drawer */}
        <aside className="w-80 bg-white border-r border-gray-200 overflow-y-auto hidden md:flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100 bg-gray-50 shrink-0">
            <h2 className="font-bold text-sm uppercase text-gray-500 tracking-wider">Course Content</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {courseItems.length === 0 ? (
               <div className="p-6 text-center text-gray-500 text-sm">No content available.</div>
            ) : (
               <div className="py-2">
                 {courseItems.map((item, idx) => {
                   const isCompleted = completedLessons[item.id];
                   const isActive = currentIndex === idx;
                   
                   return (
                     <button
                       key={item.id}
                       onClick={() => setCurrentIndex(idx)}
                       className={`w-full text-left px-4 py-3 flex items-start space-x-3 transition-colors ${
                         isActive ? 'bg-blue-50 border-l-4 border-blue-600' : 'hover:bg-gray-50 border-l-4 border-transparent'
                       }`}
                     >
                       <div className="mt-0.5 shrink-0">
                         {isCompleted ? (
                           <CheckCircle2 size={16} className="text-green-500" />
                         ) : (
                           <div className={`w-4 h-4 rounded-full border-2 ${isActive ? 'border-blue-600' : 'border-gray-300'}`} />
                         )}
                       </div>
                       <div>
                         <p className={`text-sm font-medium leading-tight ${isActive ? 'text-blue-900' : 'text-gray-900'}`}>
                           {idx + 1}. {item.title}
                         </p>
                         <div className="flex items-center mt-1 space-x-1 opacity-70">
                           {item.type === 'VIDEO' && <PlayCircle size={12} className={isActive ? 'text-blue-600' : 'text-gray-500'} />}
                           {item.type === 'PDF' && <FileText size={12} className={isActive ? 'text-blue-600' : 'text-gray-500'} />}
                           {item.type !== 'VIDEO' && item.type !== 'PDF' && <Monitor size={12} className={isActive ? 'text-blue-600' : 'text-gray-500'} />}
                           <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-500">{item.type}</span>
                         </div>
                       </div>
                     </button>
                   );
                 })}
               </div>
            )}
          </div>
        </aside>

        {/* Main Viewer Area */}
        <main className="flex-1 flex flex-col bg-gray-50 overflow-hidden relative">
          <div className="flex-1 overflow-y-auto flex flex-col">
            {!currentStep ? (
               <div className="m-auto text-center p-8">
                 <h2 className="text-xl font-bold text-gray-900 mb-2">No Content</h2>
                 <p className="text-gray-500">This course doesn't have any lessons yet.</p>
               </div>
            ) : (
               <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col p-4 md:p-8">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col">
                    <div className="p-6 border-b border-gray-100 flex-shrink-0">
                      <h2 className="text-2xl font-bold text-gray-900">{currentStep.title}</h2>
                      {currentStep.description && (
                        <p className="text-gray-600 mt-2">{currentStep.description}</p>
                      )}
                    </div>
                    
                    <div className="flex-1 bg-gray-100 relative min-h-[400px]">
                      {currentStep.video_url ? (
                        <div className="absolute inset-0 bg-black flex items-center justify-center">
                           <video 
                             controls 
                             className="max-w-full max-h-full object-contain"
                             src={currentStep.video_url}
                           />
                        </div>
                      ) : currentStep.type === 'TEXT' ? (
                        <div className="absolute inset-0 p-8 bg-white overflow-y-auto">
                          <p className="text-gray-700 leading-relaxed">
                            {currentStep.description || "Please review the text material for this lesson."}
                          </p>
                        </div>
                      ) : (
                        <div className="absolute inset-0">
                          <LocalMediaRenderer id={currentStep.id} type={currentStep.type} />
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            )}
          </div>
          
          {/* Footer Controls */}
          {courseItems.length > 0 && currentStep && (
            <div className="bg-white border-t border-gray-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <div className="max-w-5xl mx-auto w-full flex items-center justify-between">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={18} className="mr-1" /> Previous
                </button>
                
                <button
                  onClick={handleNextComplete}
                  className={`flex items-center px-6 py-2.5 text-sm font-medium text-white rounded-md transition-colors shadow-sm ${
                    isCurrentCompleted && !isLastStep
                      ? 'bg-gray-800 hover:bg-gray-900' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isCurrentCompleted ? (
                    isLastStep ? <><Check size={18} className="mr-2" /> Course Completed</> : <>Next <ChevronRight size={18} className="ml-1" /></>
                  ) : (
                    <><Check size={18} className="mr-2" /> Mark as Complete & Continue</>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
