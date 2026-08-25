import React from 'react';
import { Award, X } from 'lucide-react';
import type { Certificate } from '../types';

interface CertificateModalProps {
  certificate: Certificate | null;
  onClose: () => void;
}

export default function CertificateModal({ certificate, onClose }: CertificateModalProps) {
  if (!certificate) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full overflow-hidden border-8 border-gray-100 relative">
        <div className="p-8 sm:p-12 text-center relative border-4 border-double border-gray-200 m-2">
          <button 
            onClick={onClose} 
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="mb-8 mt-4">
            <h1 className="text-5xl font-serif font-bold text-gray-900 tracking-wider">CERTIFICATE</h1>
            <h2 className="text-xl text-blue-600 tracking-widest mt-3 uppercase font-semibold">OF {certificate.type}</h2>
          </div>
          
          <p className="text-gray-500 mb-4 italic text-lg">This is proudly presented to</p>
          
          <h3 className="text-5xl font-serif text-gray-800 mb-6 capitalize py-2 border-b border-gray-300 inline-block px-12">{certificate.recipient_name}</h3>
          
          <p className="text-gray-600 mb-8 max-w-lg mx-auto text-lg leading-relaxed">
            For successfully completing the <span className="font-bold text-gray-900">{certificate.program}</span> program on <span className="font-bold text-gray-900">{new Date(certificate.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>.
          </p>
          
          <div className="flex justify-between items-end mt-20 px-4 sm:px-12">
            <div className="text-center">
              <div className="w-40 border-b-2 border-gray-800 mb-2"></div>
              <p className="text-sm font-bold text-gray-700 tracking-widest uppercase">Course Director</p>
            </div>
            
            <div className="text-center pb-2">
              <div className="w-24 h-24 mx-auto mb-2 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg relative">
                <div className="absolute inset-1 border border-white/50 rounded-full"></div>
                <Award size={40} className="text-white" />
              </div>
            </div>
            
            <div className="text-center">
              <div className="w-40 border-b-2 border-gray-800 mb-2"></div>
              <p className="text-sm font-bold text-gray-700 tracking-widest uppercase">Instructor</p>
            </div>
          </div>
          
          <div className="mt-16 text-left">
            <p className="text-xs text-gray-400 font-mono">ID: {certificate.certificate_id}</p>
          </div>
          
          {/* Print-only CSS to hide everything else when printing */}
          <style dangerouslySetInnerHTML={{__html: `
            @media print {
              body * { visibility: hidden; }
              .fixed.inset-0.z-\\[60\\] * { visibility: visible; }
              .fixed.inset-0.z-\\[60\\] { position: absolute; left: 0; top: 0; padding: 0; background: white; }
              button { display: none !important; }
            }
          `}} />
        </div>
      </div>
    </div>
  );
}
