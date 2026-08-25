import { ListChecks, BookOpen, Hammer, TrendingUp } from 'lucide-react'

const steps = [
  {
    title: 'Choose course',
    text: 'Pick the track that matches your goal: office work, data, or online income.',
    icon: ListChecks,
    accent: 'primary' as const,
  },
  {
    title: 'Learn',
    text: 'Short lessons and clear explanations so ideas stick without overwhelm.',
    icon: BookOpen,
    accent: 'accent' as const,
  },
  {
    title: 'Practice',
    text: 'Apply what you learn on tasks and projects that feel like real work.',
    icon: Hammer,
    accent: 'primary' as const,
  },
  {
    title: 'Grow',
    text: 'Build confidence and skills you can show in interviews, on the job, or with clients.',
    icon: TrendingUp,
    accent: 'accent' as const,
  },
]

export default function HomeHowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">How it works</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Four simple steps from choosing a program to growing your career.
          </p>
        </div>

        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon
            const iconWrap =
              step.accent === 'accent'
                ? 'bg-accent-500/10 text-accent-600 ring-accent-500/20'
                : 'bg-primary-600/10 text-primary-600 ring-primary-600/20'
            return (
              <li key={step.title} className="relative">
                <div className="rounded-card border border-slate-200/90 bg-white p-8 h-full shadow-sm hover:shadow-md hover:border-primary-200/70 transition-all duration-300 text-center lg:text-left">
                  <div className="flex justify-center lg:justify-start mb-5">
                    <span
                      className={`inline-flex h-14 w-14 items-center justify-center rounded-card ring-1 ${iconWrap}`}
                    >
                      <Icon className="w-7 h-7" strokeWidth={1.75} aria-hidden />
                    </span>
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                    Step {index + 1}
                  </p>
                  <h3 className="font-heading font-semibold text-slate-900 text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.text}</p>
                </div>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}
