import { Wrench, LayoutGrid, ListOrdered, HeartHandshake } from 'lucide-react'

const items = [
  {
    title: 'Practical, real-world skills',
    description: 'Lessons tie to tasks you would actually do at work or in client projects, not abstract theory alone.',
    icon: Wrench,
  },
  {
    title: 'Beginner-friendly structure',
    description: 'Concepts are introduced in order, with space to practice before moving on.',
    icon: LayoutGrid,
  },
  {
    title: 'Step-by-step guidance',
    description: 'Clear milestones so you always know what to do next and how it fits the bigger picture.',
    icon: ListOrdered,
  },
  {
    title: 'Confidence, not just theory',
    description: 'We focus on helping you feel ready to try real tools and speak about what you have learned.',
    icon: HeartHandshake,
  },
]

export default function HomeOurApproach() {
  return (
    <section id="our-approach" className="py-20 md:py-28 bg-surface">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">Our Approach to Learning</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            How we structure programs so you can learn without feeling lost or overwhelmed.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map(({ title, description, icon: Icon }) => (
            <article
              key={title}
              className="rounded-card border border-slate-200/90 bg-white p-7 shadow-sm hover:border-primary-200 hover:shadow-md transition-all duration-300 h-full flex flex-col"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-card bg-primary-600/10 text-primary-600">
                <Icon className="w-6 h-6" strokeWidth={2} aria-hidden />
              </div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">{title}</h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed flex-1">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
