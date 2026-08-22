

export default function StudentCertificates() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-center">
        <div className="bg-gray-100 w-24 h-24 rounded-full flex items-center justify-center mb-4">
          <span className="text-gray-400 font-bold">CERT</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">No certificates yet</h3>
        <p className="text-gray-500 mt-2 max-w-md">
          Complete a course 100% to earn your certificate. Your earned certificates will appear here.
        </p>
      </div>
    </div>
  );
}
