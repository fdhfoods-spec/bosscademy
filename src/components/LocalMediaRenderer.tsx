import React, { useState, useEffect } from 'react';
import { getFile } from '../lib/storage';
import { FileText, Eye, Download, FileArchive } from 'lucide-react';

export default function LocalMediaRenderer({ 
  id, 
  type,
  fallbackUrl
}: { 
  id: string, 
  type: 'VIDEO' | 'PDF' | 'PPT' | string,
  fallbackUrl?: string
}) {
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [viewPdf, setViewPdf] = useState(false);

  useEffect(() => {
    let objectUrl = '';
    const loadFile = async () => {
      setIsLoading(true);
      try {
        const file = await getFile(id);
        if (file) {
          objectUrl = URL.createObjectURL(file);
          setFileUrl(objectUrl);
        } else {
          setFileUrl(fallbackUrl || null);
        }
      } catch (e) {
        console.error("Failed to load file from storage", e);
        setFileUrl(fallbackUrl || null);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadFile();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [id, fallbackUrl]);

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mb-2"></div>
      </div>
    );
  }

  if (type === 'VIDEO' || type === 'video') {
    return (
      <div className="w-full h-full bg-black flex items-center justify-center">
        <video 
          controls 
          className="max-w-full max-h-full object-contain"
          src={fileUrl || undefined} 
        />
      </div>
    );
  }

  if (type === 'IMAGE' || type === 'image' || type === 'JPG' || type === 'PNG') {
    return (
      <div className="w-full h-full bg-gray-100 flex items-center justify-center p-4">
        <img 
          src={fileUrl || undefined} 
          className="max-w-full max-h-full object-contain rounded shadow-sm"
          alt="Content Viewer"
        />
      </div>
    );
  }

  if (type === 'PDF' || type === 'pdf') {
    if (viewPdf) {
      return (
        <div className="relative w-full h-full flex flex-col">
          <div className="bg-gray-800 text-white p-2 flex justify-end shrink-0">
            <button 
              onClick={() => setViewPdf(false)} 
              className="text-sm font-medium hover:text-gray-300 px-3 py-1 bg-gray-700 rounded"
            >
              Close PDF Viewer
            </button>
          </div>
          <iframe 
            src={fileUrl || undefined}
            className="w-full flex-1 bg-white border-none"
            title="PDF Viewer"
          />
        </div>
      );
    }
    
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-lg p-6">
        <FileText size={64} className="text-red-500 mb-4" />
        <h3 className="text-lg font-bold text-gray-900 mb-2">PDF Document</h3>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-md">
          This document can be viewed directly in your browser or downloaded to your device.
        </p>
        <div className="flex gap-4">
          <button 
            onClick={() => setViewPdf(true)} 
            className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center shadow-sm transition-colors"
          >
            <Eye size={18} className="mr-2" /> View PDF
          </button>
          {fileUrl && (
            <a 
              href={fileUrl} 
              download 
              className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium text-sm flex items-center shadow-sm transition-colors"
            >
              <Download size={18} className="mr-2" /> Download
            </a>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 p-8 text-center rounded-lg border border-gray-200">
      <FileArchive size={64} className="text-gray-400 mb-4" />
      <span className="font-bold text-gray-900 mb-2 text-lg">Download required to view this file</span>
      <span className="text-sm text-gray-500 mb-6">This file type ({type}) cannot be previewed in the browser.</span>
      {fileUrl && (
        <a 
          href={fileUrl} 
          download 
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium text-sm flex items-center shadow-sm transition-colors"
        >
          <Download size={18} className="mr-2" /> Download File
        </a>
      )}
    </div>
  );
}
