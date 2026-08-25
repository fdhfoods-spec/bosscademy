import { Link } from 'react-router-dom'
import { Stethoscope, Zap, Brain, CheckCircle2, Clock } from 'lucide-react'

interface Program {
  title: string
  duration: string
  modules: string[]
  icon: React.ReactNode
  availability: string
  outcome: string
}

function FeaturedProgramCard({
  program,
  ctaHref,
  ctaLabel,
}: {
  program: Program
  ctaHref: string
  ctaLabel: string
}) {
  return (
    <article className="group rounded-card border border-slate-200/90 bg-white p-8 flex flex-col h-full shadow-sm hover:shadow-lg hover:border-primary-200/80 hover:-translate-y-1 transition-all duration-300">
      <div className="mb-5 text-primary-600">{program.icon}</div>

      <h3 className="font-heading text-xl md:text-2xl font-bold text-slate-900 mb-4">{program.title}</h3>

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="inline-flex items-center gap-1.5 bg-primary-600/10 text-primary-800 text-xs font-semibold px-3 py-1.5 rounded-full border border-primary-600/15">
          <Clock className="w-3.5 h-3.5 shrink-0" aria-hidden />
          <span>{program.duration}</span>
        </div>
        <div className="inline-flex items-center bg-accent-500/10 text-accent-700 text-xs font-semibold px-3 py-1.5 rounded-full border border-accent-500/20">
          {program.availability}
        </div>
      </div>

      <div className="flex-1 mb-4">
        <h4 className="font-heading font-semibold text-slate-900 mb-3 text-sm md:text-base">Modules</h4>
        <ul className="space-y-2.5">
          {program.modules.map((module, index) => (
            <li key={index} className="flex items-start gap-2 text-slate-600 text-sm">
              <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
              <span>{module}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-slate-500 text-sm mb-6 leading-relaxed">{program.outcome}</p>

      <Link to={ctaHref} className="btn-cta w-full text-center px-6 py-3.5 text-base mt-auto">
        {ctaLabel}
      </Link>
    </article>
  )
}

type FeaturedProgramsProps = {
  /** Match surrounding sections: `surface` (default) or `white` for stripe alternation on long pages */
  background?: 'surface' | 'white'
  /** Partnerships page: CTAs go to contact for org / cohort inquiries */
  enterpriseMode?: boolean
}

export default function FeaturedPrograms({ background = 'surface', enterpriseMode = false }: FeaturedProgramsProps) {
  const bgClass = background === 'white' ? 'bg-white' : 'bg-surface'

  const ctaHref = enterpriseMode ? '/contact' : '/register'
  const ctaLabel = enterpriseMode ? 'Discuss partnership' : 'Start Learning Now'

  const programs: Program[] = [
    {
      title: 'Hospital Staff Training',
      duration: '3 Months',
      modules: [
        'Patient care systems',
        'Medical computer systems',
        'Insurance handling',
        'Hospital administration',
      ],
      icon: <Stethoscope className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />,
      availability: 'Limited seats',
      outcome:
        'Ideal for hospital teams and training leads who need structured, practical programs for staff (not generic theory).',
    },
    {
      title: 'Electric Vehicle Technician',
      duration: '4 Months',
      modules: [
        'EV maintenance',
        'Battery systems',
        'Charging infrastructure',
        'Safety protocols',
      ],
      icon: <Zap className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />,
      availability: 'Limited seats',
      outcome: 'Hands-on technical training for EV maintenance careers.',
    },
    {
      title: 'Artificial Intelligence for Students',
      duration: '2 Months',
      modules: [
        'AI fundamentals',
        'Prompt engineering',
        'Automation tools',
        'AI applications',
      ],
      icon: <Brain className="w-12 h-12 md:w-14 md:h-14" strokeWidth={1.5} />,
      availability: 'Limited seats',
      outcome: 'Perfect for students interested in AI, automation, and emerging technologies.',
    },
  ]

  return (
    <section className={`py-20 md:py-28 ${bgClass}`}>
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">
            Core training programs
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Featured industry training programs
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            {enterpriseMode
              ? 'Industry-aligned tracks you can run as cohorts or sponsored programs. Use the button to scope delivery with our team.'
              : 'Designed to build practical skills aligned with industry demand.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {programs.map((program, index) => (
            <FeaturedProgramCard key={index} program={program} ctaHref={ctaHref} ctaLabel={ctaLabel} />
          ))}
        </div>
      </div>
    </section>
  )
}
