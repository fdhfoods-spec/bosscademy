import { Link } from 'react-router-dom'
import BrandLogo from '@/components/public/BrandLogo'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

const linkClass = 'text-slate-400 hover:text-white transition-colors duration-200 text-sm'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="section-container py-14 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <Link to="/" className="inline-block mb-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 rounded-sm">
              <BrandLogo variant="dark" size="sm" />
            </Link>
            <p className="text-sm leading-relaxed max-w-xs">
              Practical training for careers in the office, in data, and online, built for beginners who want real
              skills.
            </p>
          </div>

          <div>
            <h3 className="font-heading text-white font-semibold text-sm uppercase tracking-wider mb-4">Programs</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/programs/pcb-design" className={linkClass}>
                  PCB Design
                </Link>
              </li>
              <li>
                <Link to="/programs/cyber-security" className={linkClass}>
                  Cyber Security
                </Link>
              </li>
              <li>
                <Link to="/programs/sap" className={linkClass}>
                  SAP
                </Link>
              </li>
              <li>
                <Link to="/programs" className={linkClass}>
                  All programs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-white font-semibold text-sm uppercase tracking-wider mb-4">Company</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/" className={linkClass}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/partnerships" className={linkClass}>
                  Partnerships
                </Link>
              </li>
              <li>
                <Link to="/contact" className={linkClass}>
                  Contact
                </Link>
              </li>
              <li>
                <Link to="/student/register" className={linkClass}>
                  Student Registration
                </Link>
              </li>
              <li>
                <Link to="/mentor/register" className={linkClass}>
                  Become a Mentor
                </Link>
              </li>
              <li>
                <Link to="/login" className={linkClass}>
                  Login Portal
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-heading text-white font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <a href="tel:9916800685" className={linkClass}>
                  9916 800 685
                </a>
              </li>
              <li>
                <a href="mailto:info@bossacademy.org" className={linkClass}>
                  info@bossacademy.org
                </a>
              </li>
              <li>
                <a
                  href={WHATSAPP_ADVISOR_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`${linkClass} inline-flex items-center gap-2`}
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} BOSS Global Academy of Technology. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
