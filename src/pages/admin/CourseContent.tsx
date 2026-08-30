import React, { useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, UploadCloud, Check, File, Loader2 } from 'lucide-react';
import { getMockCurriculum, setMockCurriculum } from '../../lib/mockData';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import { saveFile } from '../../lib/storage';

export default function CourseContent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const course = location.state?.course;
  
  const [isSequential, setIsSequential] = useState(false);
  const [isAssessment, setIsAssessment] = useState(false);
  const [contentTitle, setContentTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // File upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const courseName = course?.title || "UNKNOWN COURSE";

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!contentTitle.trim()) {
      alert("Please enter a Content Title.");
      return;
    }
    if (!selectedFile) {
      alert("Please select a media file to upload.");
      return;
    }

    setIsUploading(true);
    
    try {
      if (IS_MOCK_SUPABASE && id) {
        let type: 'VIDEO' | 'PDF' | 'PPT' = 'PDF';
        if (selectedFile.type.includes('video') || selectedFile.name.endsWith('.mp4')) type = 'VIDEO';
        else if (selectedFile.type.includes('powerpoint') || selectedFile.name.endsWith('.ppt') || selectedFile.name.endsWith('.pptx')) type = 'PPT';

        const newItem = {
          id: crypto.randomUUID(),
          course_id: id,
          title: contentTitle,
          type,
          duration: type === 'VIDEO' ? '05:00' : undefined // Mock duration
        };

        // Save actual file to IndexedDB
        await saveFile(newItem.id, selectedFile);

        const current = getMockCurriculum();
        setMockCurriculum([...current, newItem]);
      } else if (id) {
        let type: 'VIDEO' | 'PDF' | 'PPT' = 'PDF';
        if (selectedFile.type.includes('video') || selectedFile.name.endsWith('.mp4')) type = 'VIDEO';
        else if (selectedFile.type.includes('powerpoint') || selectedFile.name.endsWith('.ppt') || selectedFile.name.endsWith('.pptx')) type = 'PPT';

        const newId = crypto.randomUUID();
        await saveFile(newId, selectedFile);

        // Find or create default module
        let moduleId = '';
        const { data: existingModules } = await supabase.from('modules').select('id').eq('course_id', id).limit(1);
        
        if (existingModules && existingModules.length > 0) {
          moduleId = existingModules[0].id;
        } else {
          const { data: newMod } = await supabase.from('modules').insert([{
            course_id: id,
            title: 'Main Content',
            description: 'Default module for content',
            sort_order: 0
          }]).select();
          if (newMod && newMod.length > 0) moduleId = newMod[0].id;
        }

        if (moduleId) {
          const { error: lessonError } = await supabase.from('lessons').insert([{
            id: newId,
            module_id: moduleId,
            title: contentTitle,
            description: description,
            video_url: '',
            duration: type === 'VIDEO' ? '05:00' : null,
            sort_order: 99
          }]);
          if (lessonError) throw lessonError;
        }
      }

      alert("Content Uploaded Successfully!");
      // Reset form
      setContentTitle('');
      setDescription('');
      setIsAssessment(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Upload failed:', error);
      alert('Failed to upload content. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen -m-4 sm:-m-6 lg:-m-8 p-4 sm:p-6 lg:p-8 text-black font-sans">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate('/admin/courses')}
          className="flex items-center text-gray-500 hover:text-orange-500 transition-colors font-bold text-sm uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="mr-2" />
          Back to Courses
        </button>

        {/* Quick Settings Box */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-orange-600 font-extrabold uppercase tracking-wide text-sm mb-4">Quick Course Settings</h2>
          <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-md">
            <input
              type="checkbox"
              id="sequential"
              checked={isSequential}
              onChange={e => setIsSequential(e.target.checked)}
              className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
            />
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
              <label htmlFor="sequential" className="font-bold text-black text-base cursor-pointer">
                Enforce Sequential Learning
              </label>
              <span className="text-xs text-gray-500 uppercase tracking-wide">
                (Students must complete contents in order)
              </span>
            </div>
          </div>
        </div>

        {/* Upload Content Box */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <h2 className="text-orange-600 font-extrabold uppercase tracking-wide text-sm mb-2">Upload New Content</h2>
          <h3 className="text-black font-extrabold uppercase tracking-wider text-xl mb-8">{courseName}</h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Left Column: Form */}
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">Content Title</label>
                <input
                  type="text"
                  placeholder="e.g. Introduction to Advanced Metrics"
                  value={contentTitle}
                  onChange={e => setContentTitle(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-black placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">Description (Optional)</label>
                <textarea
                  placeholder="Provide a brief overview of this content..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-md text-black placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-colors resize-none"
                />
              </div>

              <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-4 rounded-md mt-2">
                <input
                  type="checkbox"
                  id="assessment"
                  checked={isAssessment}
                  onChange={e => setIsAssessment(e.target.checked)}
                  className="w-5 h-5 text-orange-500 rounded border-gray-300 focus:ring-orange-500 cursor-pointer"
                />
                <label htmlFor="assessment" className="font-bold text-black text-base cursor-pointer">
                  This is an Assessment
                </label>
              </div>
            </div>

            {/* Right Column: Upload Area */}
            <div className="flex flex-col">
              <label className="block text-xs font-bold text-orange-600 mb-2 uppercase tracking-wide">Media File (MP4, PDF, or PPT)</label>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept=".mp4,.pdf,.ppt,.pptx"
              />

              <div 
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                className="flex-1 min-h-[250px] border-2 border-dashed border-gray-300 hover:border-orange-500 bg-gray-50 rounded-lg flex flex-col items-center justify-center p-8 transition-colors cursor-pointer group relative"
              >
                {selectedFile ? (
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center shadow-sm mb-4">
                      <File size={32} className="text-orange-500" />
                    </div>
                    <h4 className="text-lg font-extrabold text-black mb-1 line-clamp-1 break-all px-4">{selectedFile.name}</h4>
                    <p className="text-sm text-gray-500 mb-4">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</p>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
                      className="text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-wider bg-red-50 px-3 py-1.5 rounded"
                    >
                      Remove File
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4 group-hover:scale-110 transition-transform">
                      <UploadCloud size={32} className="text-orange-500" />
                    </div>
                    <h4 className="text-lg font-extrabold text-black mb-2">Drag & Drop file here</h4>
                    <p className="text-sm text-gray-500 mb-6 text-center">or click to browse (.mp4, .pdf, .ppt, .pptx)</p>
                    <div className="bg-gray-200 px-4 py-1.5 rounded-full text-xs font-bold text-gray-600 tracking-wider">
                      STRICTLY MAX 500MB
                    </div>
                  </>
                )}
              </div>
            </div>

          </div>

          <div className="flex justify-end mt-10 border-t border-gray-200 pt-6">
            <button 
              onClick={handleUpload}
              disabled={isUploading}
              className="bg-orange-500 disabled:opacity-70 disabled:cursor-not-allowed text-white hover:bg-orange-600 px-8 py-3.5 rounded-md font-extrabold tracking-wider text-sm uppercase flex items-center transition-colors shadow-sm"
            >
              {isUploading ? (
                <>
                  <Loader2 size={18} className="mr-2 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  Upload & Save Content
                  <Check size={18} className="ml-2" strokeWidth={3} />
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
