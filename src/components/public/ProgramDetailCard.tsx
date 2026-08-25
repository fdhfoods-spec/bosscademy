import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import type { ProgramDetail } from '@/lib/programs'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

function CtaPair() {
  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Link to="/register" className="btn-cta flex-1 text-center px-4 py-3 text-sm md:text-base justify-center">
        Start Learning Now
      </Link>
      <a
        href={WHATSAPP_ADVISOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline flex-1 text-center px-4 py-3 text-sm md:text-base justify-center"
      >
        Get Free Guidance
      </a>
    </div>
  )
}

export default function ProgramDetailCard({ program }: { program: ProgramDetail }) {
  const Icon = program.icon

  return (
    <div
      id={program.id}
      className="bg-white rounded-card shadow-md border border-slate-200/90 hover:border-primary-200 hover:shadow-lg transition-all duration-300 flex flex-col scroll-mt-24 overflow-hidden"
    >
      <div className="p-8 flex flex-col flex-1">
        <div className="text-slate-400 mb-4">
          <Icon className="w-12 h-12 md:w-14 md:h-14" aria-hidden />
        </div>
        <h2 className="font-heading text-xl md:text-2xl font-bold text-slate-900 mb-2">
          <Link to={`/programs/${program.id}`} className="hover:text-primary-700 transition-colors">
            {program.title}
          </Link>
        </h2>
        <p className="mb-3">
          <Link
            to={`/programs/${program.id}`}
            className="text-sm font-semibold text-primary-600 hover:text-primary-700"
          >
            Full course details →
          </Link>
        </p>
        <p className="text-primary-700 font-semibold text-sm md:text-base mb-1">{program.outcome}</p>
        <p className="text-sm text-slate-500 mb-3">Duration: {program.duration}</p>
        <p className="text-xs sm:text-sm text-slate-600 mb-4 leading-relaxed">
          <span className="font-medium text-slate-700">Limited seats per batch.</span> New batches starting regularly.
        </p>

        <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed">{program.summary}</p>

        <div className="space-y-6 flex-1">
          {program.whatYouLearn && program.whatYouLearn.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-slate-900 mb-3 text-sm md:text-base">What you will learn</h3>
              <ul className="space-y-2">
                {program.whatYouLearn.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {program.toolsCovered && program.toolsCovered.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-slate-900 mb-3 text-sm md:text-base">Tools covered</h3>
              <ul className="space-y-2">
                {program.toolsCovered.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {program.realWorldApplication && (
            <div>
              <h3 className="font-heading font-semibold text-slate-900 mb-3 text-sm md:text-base">Real-world application</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{program.realWorldApplication}</p>
            </div>
          )}

          {program.whoFor && program.whoFor.length > 0 && (
            <div>
              <h3 className="font-heading font-semibold text-slate-900 mb-3 text-sm md:text-base">Who this course is for</h3>
              <ul className="space-y-2">
                {program.whoFor.map((line) => (
                  <li key={line} className="flex items-start gap-2 text-slate-600 text-sm">
                    <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 space-y-3">
          <CtaPair />
          <Link
            to="/contact"
            className="block w-full text-center text-sm font-semibold text-primary-600 hover:text-primary-700 py-2"
          >
            Talk to Advisor
          </Link>
        </div>
      </div>
    </div>
  )
}
