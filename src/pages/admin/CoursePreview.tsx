import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, FileText, PlayCircle, Monitor } from 'lucide-react';
import { getMockCurriculum } from '../../lib/mockData';
import type { CurriculumItem } from '../../lib/mockData';
import { IS_MOCK_SUPABASE } from '../../lib/supabase';
import { getFile } from '../../lib/storage';

export default function CoursePreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;

  const [curriculum, setCurriculum] = useState<CurriculumItem[]>([]);
  const [activeItem, setActiveItem] = useState<CurriculumItem | undefined>(undefined);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  useEffect(() => {
    if (IS_MOCK_SUPABASE && id) {
      const allCurriculum = getMockCurriculum();
      const courseCurriculum = allCurriculum.filter(c => c.course_id === id);
      setCurriculum(courseCurriculum);
      if (courseCurriculum.length > 0) {
        setActiveItem(courseCurriculum[0]);
      }
    }
  }, [id]);

  useEffect(() => {
    let objectUrl = '';
    const loadFile = async () => {
      if (activeItem) {
        setIsLoadingFile(true);
        try {
          const file = await getFile(activeItem.id);
          if (file) {
            objectUrl = URL.createObjectURL(file);
            setFileUrl(objectUrl);
          } else {
            setFileUrl(null);
          }
        } catch (e) {
          console.error("Failed to load file from storage", e);
          setFileUrl(null);
        } finally {
          setIsLoadingFile(false);
        }
      }
    };
    
    loadFile();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [activeItem]);

  return (
    <div className="bg-white min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 text-black font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-200 pb-4">
          <button 
            onClick={() => navigate('/admin/courses')}
            className="flex items-center text-gray-500 hover:text-orange-500 transition-colors font-bold text-sm uppercase tracking-wider"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Manage Content
          </button>

          <div className="bg-orange-100 text-orange-600 border border-orange-200 px-4 py-1.5 rounded text-xs font-black uppercase tracking-wider">
            Preview Mode
          </div>
        </div>

        {/* Main Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: Media Player */}
          <div className="lg:col-span-2 space-y-4">
            <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center shadow-md border border-gray-200 overflow-hidden relative">
              {isLoadingFile ? (
                <div className="text-gray-500 flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
                  <p className="font-bold uppercase tracking-wider text-sm">Loading Content...</p>
                </div>
              ) : !activeItem ? (
                <div className="text-gray-500 flex flex-col items-center">
                  <PlayCircle size={64} className="mb-4 opacity-50" />
                  <p className="font-bold uppercase tracking-wider text-sm">No Preview Available</p>
                </div>
              ) : activeItem.type === 'VIDEO' ? (
                <video 
                  controls 
                  className="w-full h-full object-cover bg-black"
                  src={fileUrl || "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"} 
                />
              ) : activeItem.type === 'PDF' ? (
                <iframe 
                  src={fileUrl || "https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf"}
                  className="w-full h-full bg-white"
                  title="PDF Viewer"
                />
              ) : (
                <div className="text-gray-400 flex flex-col items-center">
                  <Monitor size={64} className="mb-4 opacity-50" />
                  <p className="font-bold uppercase tracking-wider text-sm text-center px-4">
                    Presentation Viewer<br />
                    <span className="text-xs font-normal mt-2 block">Download required to view PPT files</span>
                  </p>
                </div>
              )}
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
              <div className="inline-block bg-orange-500 text-white text-[10px] font-black px-2 py-1 rounded mb-3 uppercase tracking-wider">
                {activeItem ? activeItem.type : 'EMPTY'}
              </div>
              <h2 className="text-2xl font-extrabold text-black uppercase tracking-wide">
                {activeItem ? activeItem.title.replace(/^\d+\.\s*/, '') : 'No Content Available'}
              </h2>
            </div>
          </div>

          {/* Right Column: Course Curriculum */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-lg shadow-sm flex flex-col h-[calc(100vh-140px)] min-h-[500px]">
            <div className="p-5 border-b border-gray-200">
              <h3 className="text-lg font-black text-black uppercase tracking-wider">Course Curriculum</h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {curriculum.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <p className="font-bold uppercase tracking-wider text-sm mb-2">No Content Yet</p>
                  <p className="text-xs">Add modules and lessons to build out the curriculum.</p>
                </div>
              ) : (
                curriculum.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveItem(item)}
                    className={`w-full text-left p-4 rounded-md border transition-all ${
                      activeItem?.id === item.id 
                        ? 'bg-orange-50 border-orange-500 shadow-sm' 
                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {item.type === 'PDF' && <FileText size={16} className={activeItem?.id === item.id ? 'text-orange-500' : 'text-gray-400'} />}
                        {item.type === 'VIDEO' && <PlayCircle size={16} className={activeItem?.id === item.id ? 'text-orange-500' : 'text-gray-400'} />}
                        {item.type === 'PPT' && <Monitor size={16} className={activeItem?.id === item.id ? 'text-orange-500' : 'text-gray-400'} />}
                      </div>
                      <div>
                        <h4 className={`text-sm font-bold leading-snug mb-1 ${activeItem?.id === item.id ? 'text-orange-700' : 'text-black'}`}>
                          {item.title}
                        </h4>
                        <p className={`text-[10px] uppercase font-bold tracking-wider ${activeItem?.id === item.id ? 'text-orange-600' : 'text-gray-500'}`}>
                          {item.type} {item.duration && `• ${item.duration}`}
                        </p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
