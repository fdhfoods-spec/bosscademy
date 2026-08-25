import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { NEXT_WORKSHOP_WHEN } from '@/lib/workshop-schedule'

const bullets = [
  'How to go from zero skills to job-ready in 60-90 days',
  'The exact skills companies expect from freshers',
  'Live demo of real tasks (Excel, marketing, reports)',
  'How to choose the right path (Job vs Freelancing)',
]

export default function HomeWorkshop() {
  return (
    <section
      id="free-workshop"
      className="py-16 md:py-20 bg-gray-50 border-y border-gray-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-3">
          What You&apos;ll Learn in the Free Workshop
        </h2>
        <ul className="text-left space-y-4 mb-10 max-w-xl mx-auto">
          {bullets.map((item) => (
            <li key={item} className="flex items-start gap-3 text-slate-600">
              <CheckCircle2 className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" aria-hidden />
              <span className="text-base leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
        <Link to="/register" className="btn-cta px-8 py-3.5 text-lg">
          Start Learning Now
        </Link>
        <div className="mt-6 space-y-2 text-sm text-slate-500">
          <p className="font-medium text-slate-900">
            <span className="mr-1.5" aria-hidden>
              📅
            </span>
            Next workshop: <span className="text-primary-700">{NEXT_WORKSHOP_WHEN}</span>
          </p>
          <p>
            <span className="mr-1.5" aria-hidden>
              ⏳
            </span>
            Limited seats, closing soon
          </p>
        </div>
        <p className="mt-6 text-sm font-medium text-slate-900 max-w-md mx-auto">
          Most students delay and miss opportunities. Don&apos;t wait.
        </p>
      </div>
    </section>
  )
}
