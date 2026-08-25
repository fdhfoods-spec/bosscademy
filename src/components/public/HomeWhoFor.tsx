import { GraduationCap, UserSearch, RefreshCw, Sparkles } from 'lucide-react'

const audiences = [
  {
    title: 'Students & freshers',
    description: 'Build skills early so interviews and your first role feel less overwhelming.',
    icon: GraduationCap,
  },
  {
    title: 'Job seekers',
    description: 'Learn what employers expect, and prove it with practice you can explain clearly.',
    icon: UserSearch,
  },
  {
    title: 'Career switchers',
    description: 'Structured training and clear milestones when you’re starting in a new field.',
    icon: RefreshCw,
  },
  {
    title: 'Beginners with no experience',
    description: 'No background needed. We start from the basics at a steady pace so you are not left behind.',
    icon: Sparkles,
  },
]

export default function HomeWhoFor() {
  return (
    <section id="who-for" className="py-20 md:py-28 bg-white">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">Who is this for?</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Students, freshers, job seekers, career switchers, and complete beginners who want clear, practical learning
            without inflated promises. Designed for beginners starting from zero.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {audiences.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-card border border-slate-200/90 bg-white p-7 shadow-sm hover:border-primary-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-card bg-primary-600/10 text-primary-600">
                <Icon className="w-6 h-6" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
