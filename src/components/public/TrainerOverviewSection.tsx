import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'

export default function TrainerOverviewSection() {
  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Join BOSS Academy as a trainer
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            We collaborate with professionals who want to teach hands-on, high-impact programs, part-time or full-time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-14 max-w-5xl mx-auto">
          <div className="card-elevated p-8 md:p-10 hover:-translate-y-0.5">
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Part-time trainers</h3>
            <p className="text-slate-600 mb-5 leading-relaxed">
              Deliver sessions on weekends or specific modules alongside your day job.
            </p>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Flexible scheduling around your commitments.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Mentor students and working professionals.</span>
              </li>
            </ul>
          </div>

          <div className="card-elevated p-8 md:p-10 hover:-translate-y-0.5">
            <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">Full-time trainers</h3>
            <p className="text-slate-600 mb-5 leading-relaxed">
              Lead ongoing programs and institutional partnerships with dedicated assignments.
            </p>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Structured work across multiple programs.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Help shape curriculum and new initiatives.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mb-12">
          <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4 text-center md:text-left">
            Areas of expertise
          </h3>
          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
            {[
              'Healthcare & hospital administration',
              'Electric vehicle (EV) technology',
              'AI & data science',
              'Cybersecurity',
              'Electronics & mobile repair',
              'Solar & electrical systems',
              'Soft skills & communication',
              'Corporate training & leadership',
            ].map((area) => (
              <span
                key={area}
                className="inline-flex items-center px-4 py-2 rounded-full bg-primary-600/10 text-primary-800 text-xs font-semibold border border-primary-600/15"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="/trainers" className="btn-cta px-8 py-3.5 inline-flex justify-center">
            Apply as trainer
          </Link>
        </div>
      </div>
    </section>
  )
}
