import React, { useState, useEffect, useRef } from 'react';
import { Upload, Award, Search, X, Loader2, CheckCircle, Download } from 'lucide-react';
import { supabase, IS_MOCK_SUPABASE } from '../../lib/supabase';
import type { Certificate } from '../../types';
import CertificateModal from '../../components/CertificateModal';

export default function AdminCertificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCert, setNewCert] = useState({ recipientName: '', recipientEmail: '', type: 'PROJECT', program: '' });

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null);
  const [verifyingCert, setVerifyingCert] = useState<Certificate | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCertificates = async () => {
    setIsLoading(true);
    
    if (IS_MOCK_SUPABASE) {
      const stored = localStorage.getItem('mock_certificates');
      if (stored) {
        setCertificates(JSON.parse(stored));
      } else {
        setCertificates([]);
      }
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/get-certificates');
      if (res.ok) {
        const data = await res.json();
        setCertificates(data.certificates || []);
      } else {
        console.error('Failed to fetch certificates via API');
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchCertificates();
  }, []);

  const filteredCertificates = certificates.filter(cert => {
    const name = cert.recipient_name || '';
    const certId = cert.certificate_id || '';
    const program = cert.program || '';
    return name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           certId.toLowerCase().includes(searchQuery.toLowerCase()) ||
           program.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    const randomId = Math.random().toString(16).substring(2, 6).toUpperCase();
    const certId = `CERT-${newCert.type.substring(0,2)}-${randomId}-NEW`;
    
    const newCertificate = {
      certificate_id: certId,
      recipient_name: newCert.recipientName,
      recipient_email: newCert.recipientEmail || 'No LMS account',
      type: newCert.type,
      program: newCert.program,
      verification_status: 'valid'
    };

    if (IS_MOCK_SUPABASE) {
      const mockCert = { ...newCertificate, id: Math.random().toString(), issued_at: new Date().toISOString() };
      setCertificates(prev => {
        const updated = [mockCert as any, ...prev];
        localStorage.setItem('mock_certificates', JSON.stringify(updated));
        return updated;
      });
      setIsModalOpen(false);
      setNewCert({ recipientName: '', recipientEmail: '', type: 'PROJECT', program: '' });
      setIsUpdating(false);
      return;
    }

    try {
      const res = await fetch('/api/manage-certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'insert', certificates: [newCertificate] })
      });
      
      if (!res.ok) throw new Error('Failed to issue certificate');
      
      setIsModalOpen(false);
      setNewCert({ recipientName: '', recipientEmail: '', type: 'PROJECT', program: '' });
      fetchCertificates();
    } catch (error: any) {
      alert('Failed to issue certificate: ' + error.message);
    }
    setIsUpdating(false);
  };

  const handleView = (cert: Certificate) => {
    setSelectedCert(cert);
  };

  const handleVerify = (cert: Certificate) => {
    setVerifyingCert(cert);
  };

  const handleDownloadCertificate = (cert: Certificate) => {
    // To properly "download" the visual certificate, we open the view modal and trigger print
    setSelectedCert(cert);
    setVerifyingCert(null);
    
    // Add a slight delay to allow the modal to render before printing
    setTimeout(() => {
      window.print();
    }, 500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvData = event.target?.result as string;
      const rows = csvData.split('\n').filter(row => row.trim().length > 0);
      
      const isHeader = rows[0].toLowerCase().includes('name') || rows[0].toLowerCase().includes('email');
      const dataRows = isHeader ? rows.slice(1) : rows;

      const newCertificates = dataRows.map(row => {
        const cols = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));
        const type = cols[2]?.toUpperCase() || 'PROJECT';
        const validTypes = ['PROJECT', 'INTERNSHIP', 'PARTICIPATION'];
        const finalType = validTypes.includes(type) ? type : 'PROJECT';
        
        const randomId = Math.random().toString(16).substring(2, 6).toUpperCase() + Math.random().toString(16).substring(2, 6).toUpperCase();
        
        return {
          recipient_name: cols[0] || 'Unknown',
          recipient_email: cols[1] || 'No email',
          type: finalType,
          program: cols[3] || 'General Program',
          certificate_id: `CERT-${finalType.substring(0,2)}-${randomId.substring(0,4)}`,
          verification_status: 'valid'
        };
      });

      if (newCertificates.length > 0) {
        setIsUpdating(true);
        if (IS_MOCK_SUPABASE) {
          const mockCerts = newCertificates.map(cert => ({ ...cert, id: Math.random().toString(), issued_at: new Date().toISOString() }));
          setCertificates(prev => {
            const updated = [...mockCerts as any, ...prev];
            localStorage.setItem('mock_certificates', JSON.stringify(updated));
            return updated;
          });
          alert(`Successfully issued ${newCertificates.length} certificates from CSV (Mock)!`);
          setIsUpdating(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
          return;
        }

        try {
          const res = await fetch('/api/manage-certificates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'bulk_insert', certificates: newCertificates })
          });
          
          if (!res.ok) throw new Error('Failed to bulk issue certificates');
          
          alert(`Successfully issued ${newCertificates.length} certificates from CSV!`);
          fetchCertificates();
        } catch (error: any) {
          alert('Failed to bulk issue certificates: ' + error.message);
        }
        setIsUpdating(false);
      } else {
        alert("No valid rows found in the CSV.");
      }
      
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Certificate Management</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Issue Internship, Project and Participation certificates to existing users or to a recipient with no account. Course Completion certificates are still issued automatically from Course Management.
          </p>
        </div>
        <div className="flex flex-col gap-3 min-w-[240px]">
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            className="hidden" 
          />
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={isUpdating}
            className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 px-4 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50"
          >
            {isUpdating ? <Loader2 size={18} className="animate-spin" /> : <Upload size={18} />}
            Bulk Issue (CSV)
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-md text-sm font-medium transition-colors shadow-sm"
          >
            <Award size={18} />
            Issue Certificate
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by ID, Name or Program..." 
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
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipient</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program / Project / Event</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Issued</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Certificate ID</th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    <Loader2 className="animate-spin mx-auto text-blue-500 mb-2" size={24} />
                    Loading certificates from Supabase...
                  </td>
                </tr>
              ) : filteredCertificates.length > 0 ? (
                filteredCertificates.map((cert) => (
                  <tr key={cert.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{cert.recipient_name}</div>
                      <div className="text-gray-500 text-xs mt-1">{cert.recipient_email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {cert.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {cert.program}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(cert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 font-mono">
                      {cert.certificate_id}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3 text-sm font-medium">
                      <button onClick={() => handleView(cert)} className="text-blue-600 hover:text-blue-900 transition-colors">
                        View
                      </button>
                      <button onClick={() => handleVerify(cert)} className="text-gray-400 hover:text-gray-600 transition-colors">
                        Verify
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                    No certificates found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Issue Certificate Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Issue New Certificate</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors" disabled={isUpdating}>
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleIssue} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Name</label>
                <input 
                  type="text" 
                  required
                  value={newCert.recipientName}
                  onChange={(e) => setNewCert({...newCert, recipientName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Recipient Email (Optional)</label>
                <input 
                  type="email" 
                  value={newCert.recipientEmail}
                  onChange={(e) => setNewCert({...newCert, recipientEmail: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select 
                  value={newCert.type}
                  onChange={(e) => setNewCert({...newCert, type: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                >
                  <option value="PROJECT">Project</option>
                  <option value="INTERNSHIP">Internship</option>
                  <option value="PARTICIPATION">Participation</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                <input 
                  type="text" 
                  required
                  value={newCert.program}
                  onChange={(e) => setNewCert({...newCert, program: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  disabled={isUpdating}
                />
              </div>
              <div className="pt-4 flex justify-end space-x-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  disabled={isUpdating}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
                  disabled={isUpdating}
                >
                  {isUpdating && <Loader2 size={16} className="mr-2 animate-spin" />}
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <CertificateModal 
        certificate={selectedCert} 
        onClose={() => setSelectedCert(null)} 
      />
      {verifyingCert && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[70]">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full overflow-hidden">
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="text-green-600" size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Certificate Valid</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg text-left mb-6 space-y-2 border border-gray-100 shadow-sm">
                <p className="text-sm"><span className="text-gray-500 font-medium inline-block w-20">Recipient:</span> <span className="font-semibold text-gray-900">{verifyingCert.recipient_name}</span></p>
                <p className="text-sm"><span className="text-gray-500 font-medium inline-block w-20">Program:</span> <span className="font-semibold text-gray-900">{verifyingCert.program}</span></p>
                <p className="text-sm"><span className="text-gray-500 font-medium inline-block w-20">Type:</span> <span className="font-semibold text-gray-900 capitalize">{verifyingCert?.type?.toLowerCase()}</span></p>
                <p className="text-sm"><span className="text-gray-500 font-medium inline-block w-20">Issued On:</span> <span className="font-semibold text-gray-900">{new Date(verifyingCert.issued_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span></p>
              </div>
              
              <p className="text-gray-500 mb-6 font-mono text-xs">
                ID: {verifyingCert.certificate_id}
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => handleDownloadCertificate(verifyingCert)}
                  className="w-full bg-indigo-50 border border-indigo-200 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-md transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>
                <button 
                  onClick={() => setVerifyingCert(null)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
