import { Link } from 'react-router-dom'
import { GraduationCap, Sparkles, Wrench } from 'lucide-react'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

const trustPoints = [
  { icon: GraduationCap, label: 'Beginner-friendly' },
  { icon: Sparkles, label: 'No prior experience needed' },
  { icon: Wrench, label: 'Practical training' },
] as const

type Props = {
  title: string
  outcomeSubtext: string
}

export default function CoursePageHero({ title, outcomeSubtext }: Props) {
  return (
    <div className="relative overflow-hidden bg-primary-600 text-white py-12 md:py-16 lg:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_100%_0%,rgba(249,115,22,0.15),transparent)]" />
      <div className="section-container relative z-10 max-w-3xl mx-auto text-center">
        <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-3">Course</p>
        <h1 className="font-heading text-3xl md:text-4xl lg:text-[2.75rem] font-bold text-white mb-5 text-balance leading-tight">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-blue-100 leading-relaxed max-w-2xl mx-auto mb-8">{outcomeSubtext}</p>

        <ul className="flex flex-col sm:flex-row flex-wrap justify-center gap-4 sm:gap-6 mb-10 text-sm md:text-base">
          {trustPoints.map(({ icon: Icon, label }) => (
            <li
              key={label}
              className="inline-flex items-center justify-center gap-2 rounded-card bg-white/10 px-4 py-2.5 border border-white/15 backdrop-blur-sm"
            >
              <Icon className="w-5 h-5 text-accent-400 shrink-0" strokeWidth={2} aria-hidden />
              <span className="font-medium text-white/95">{label}</span>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
          <Link to="/register" className="btn-cta px-7 py-3.5 text-base md:text-lg justify-center shadow-lg shadow-black/15">
            Start Learning Now
          </Link>
          <a
            href={WHATSAPP_ADVISOR_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline px-7 py-3.5 text-base md:text-lg justify-center"
          >
            Get Free Guidance
          </a>
        </div>

        <p className="mt-8">
          <Link
            to="/programs"
            className="text-sm font-medium text-blue-200/90 hover:text-white underline underline-offset-4 decoration-white/35 hover:decoration-white transition-colors"
          >
            ← All programs
          </Link>
        </p>
      </div>
    </div>
  )
}
