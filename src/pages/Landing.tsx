import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRight, Shield, Zap, ChevronRight, CheckCircle2, Menu, X } from 'lucide-react';

export default function Landing() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const courses = [
    { title: 'PCB Design', desc: 'Master printed circuit board design from schematics to manufacturing.', icon: '🔌' },
    { title: 'SAP', desc: 'Learn enterprise resource planning and business operations with SAP.', icon: '🏢' },
    { title: 'Full Stack Development', desc: 'Build complete web applications from front-end to back-end.', icon: '💻' },
    { title: 'AI with Digital Marketing', desc: 'Leverage artificial intelligence to supercharge your marketing campaigns.', icon: '📈' },
    { title: 'AI Development', desc: 'Build the future by creating intelligent machine learning models and AI apps.', icon: '🤖' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-200 selection:text-blue-900">
      {/* Navbar */}
      <nav className="fixed w-full z-50 top-0 transition-all duration-300 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300 shadow-lg shadow-blue-600/20">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="text-2xl font-bold text-blue-900">
                BOSS Academy
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#courses" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Courses</a>
              <a href="#features" className="text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors">Features</a>
              <div className="flex items-center gap-4 ml-4 border-l border-gray-200 pl-8">
                <Link to="/student/login" className="text-sm font-bold text-blue-700 hover:text-blue-900 transition-colors">
                  Log in
                </Link>
                <Link to="/student/register" className="text-sm font-bold px-6 py-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
                  Get Started
                </Link>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
              >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-200 shadow-lg absolute w-full left-0 top-20">
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              <a href="#courses" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md">Courses</a>
              <a href="#features" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-2 text-base font-semibold text-gray-800 hover:text-blue-600 hover:bg-blue-50 rounded-md">Features</a>
              <div className="border-t border-gray-100 pt-4 mt-2 flex flex-col gap-3 px-3">
                <Link to="/student/login" className="text-center text-base font-bold text-blue-700 py-2 border border-blue-200 rounded-lg hover:bg-blue-50">
                  Log in
                </Link>
                <Link to="/student/register" className="text-center text-base font-bold bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 shadow-md">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-white">
        {/* Background Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-50 rounded-full blur-[100px] opacity-80 pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-sm font-bold text-blue-700 mb-8">
            <SparkleIcon /> Welcome to BOSS Academy 2.0
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8 text-slate-900">
            Master your skills with <br />
            <span className="text-blue-600">
              BOSS Academy
            </span>
          </h1>
          
          <p className="mt-4 text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            The ultimate premium learning platform. Connect with expert mentors, access high-quality video content, and track your progress in real-time.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="/student/register" className="px-8 py-4 rounded-full bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center">
              Start Learning Now
              <ArrowRight className="ml-2" size={20} />
            </Link>
          </div>
        </div>
      </div>



      {/* Courses Section */}
      <div id="courses" className="py-24 bg-slate-50 relative border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900">Explore Our Courses</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">Discover our most popular programs tailored for the modern industry.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {courses.map((course, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 hover:shadow-xl hover:border-blue-200 transition-all group flex flex-col h-full transform hover:-translate-y-1">
                <div className="text-4xl mb-6 bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  {course.icon}
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">{course.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6 flex-grow">{course.desc}</p>
                <Link to="/student/payment" className="inline-flex items-center font-bold text-blue-600 group-hover:text-blue-800">
                  Enroll Now <ChevronRight className="ml-1" size={18} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div id="features" className="py-24 bg-white relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-4 text-slate-900">Why choose BOSS Academy?</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">We provide a state-of-the-art environment for both students and mentors to thrive.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Shield className="text-blue-600" size={32} />,
                title: 'Premium Content',
                desc: 'Access exclusive high-quality video courses curated by industry leaders.'
              },
              {
                icon: <Users className="text-blue-600" size={32} />,
                title: 'Expert Mentorship',
                desc: 'Get assigned to dedicated mentors who guide you every step of the way.'
              },
              {
                icon: <Zap className="text-blue-600" size={32} />,
                title: 'Fast-Track Career',
                desc: 'Earn verifiable certificates upon completion and boost your resume instantly.'
              }
            ].map((feature, i) => (
              <div key={i} className="p-8 rounded-3xl bg-slate-50 border border-gray-100 hover:bg-blue-50 transition-colors group">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 bg-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-blue-700" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-white opacity-10 blur-3xl" />
        
        <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6 text-white">Ready to transform your future?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Join thousands of successful students who have upgraded their careers with BOSS Academy.</p>
          
          <Link to="/student/register" className="inline-flex items-center px-8 py-4 rounded-full bg-white text-blue-700 font-bold text-lg hover:bg-gray-50 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-1">
            Create Free Account
          </Link>
          
          <div className="mt-12 pt-8 flex flex-col sm:flex-row justify-center gap-6 sm:gap-12 text-sm text-blue-100 font-medium">
            <span className="flex items-center justify-center"><CheckCircle2 className="mr-2" size={18} /> No credit card required</span>
            <span className="flex items-center justify-center"><CheckCircle2 className="mr-2" size={18} /> 14-day free trial</span>
            <span className="flex items-center justify-center"><CheckCircle2 className="mr-2" size={18} /> Cancel anytime</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="text-blue-600" size={32} />
                <span className="text-2xl font-extrabold text-slate-900">BOSS Academy</span>
              </div>
              <p className="text-gray-600 max-w-sm leading-relaxed">
                The ultimate premium learning platform. Empowering students with cutting-edge skills and expert mentorship to fast-track your career.
              </p>
            </div>
            
            <div>
              <h3 className="text-slate-900 font-extrabold mb-4 uppercase tracking-wider text-sm">Portals</h3>
              <ul className="space-y-3">
                <li><Link to="/student/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Student Login</Link></li>
                <li><Link to="/mentor/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Mentor Login</Link></li>
                <li><Link to="/admin/login" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Admin Portal</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-slate-900 font-extrabold mb-4 uppercase tracking-wider text-sm">Legal</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-600 hover:text-blue-600 font-medium transition-colors">Contact Support</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 font-medium text-sm">© 2026 BOSS Academy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function SparkleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" fill="currentColor" />
    </svg>
  );
}
