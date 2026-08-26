'use client'

import { Link } from 'react-router-dom'
import { useState } from 'react'
import BrandLogo from '@/components/public/BrandLogo'

const navLink =
  'text-slate-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors duration-200'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm shadow-slate-900/[0.06]">
      <div className="section-container">
        <div className="flex justify-between items-center min-h-[4rem] md:min-h-[4.5rem] py-2 md:py-2.5">
          <Link
            to="/"
            className="flex-shrink-0 group py-1"
            aria-label="BOSS Global Academy of Technology, home"
          >
            <BrandLogo variant="light" size="lg" interactive />
          </Link>

          <div className="hidden md:flex md:items-center md:gap-1 lg:gap-2">
            <Link to="/" className={navLink}>
              Home
            </Link>
            <Link to="/programs" className={navLink}>
              Programs
            </Link>
            <Link to="/partnerships" className={navLink}>
              Partnerships
            </Link>

            <Link to="/contact" className={`${navLink} text-primary-600 font-semibold`}>
              Talk to Advisor
            </Link>
            <Link to="/programs" className="btn-cta-nav ml-1">
              Start Learning Now
            </Link>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <Link to="/programs" className="btn-cta-nav hidden sm:inline-flex text-[0.6875rem] sm:text-xs px-2.5 sm:px-3 py-1.5 whitespace-nowrap leading-tight">
              Start Learning Now
            </Link>
            <button
              type="button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-card text-slate-700 hover:bg-slate-100 transition-colors"
              aria-expanded={isOpen}
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white">
          <div className="px-4 py-4 space-y-1">
            {[
              ['/', 'Home'],
              ['/programs', 'Programs'],
              ['/partnerships', 'Partnerships'],
            ].map(([href, label]) => (
              <Link
                key={href}
                to={href}
                className="block rounded-card px-3 py-2.5 text-base font-medium text-slate-700 hover:bg-surface transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="block rounded-card px-3 py-2.5 text-base font-semibold text-primary-600 hover:bg-surface transition-colors"
              onClick={() => setIsOpen(false)}
            >
              Talk to Advisor
            </Link>
            <Link
              to="/programs"
              className="btn-cta block w-full text-center py-3 mt-2"
              onClick={() => setIsOpen(false)}
            >
              Start Learning Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
