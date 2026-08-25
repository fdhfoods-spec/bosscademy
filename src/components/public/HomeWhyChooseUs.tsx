import { Wrench, FolderKanban, HeartHandshake, HeadphonesIcon, Briefcase } from 'lucide-react'
import MediaImage from '@/components/public/MediaImage'
import { siteImages } from '@/lib/site-images'

const differentiators = [
  {
    title: 'Practical learning',
    text: 'Short explanations, then you practice, the same rhythm as real work.',
    icon: Wrench,
  },
  {
    title: 'Real-world projects',
    text: 'Assignments you can describe in interviews or add to a simple portfolio.',
    icon: FolderKanban,
  },
  {
    title: 'Beginner friendly',
    text: 'Concepts introduced step by step, with support when you get stuck.',
    icon: HeartHandshake,
  },
  {
    title: 'Career support',
    text: 'Guidance on skills, projects, and next steps, not just “finish the module.”',
    icon: HeadphonesIcon,
  },
  {
    title: 'Industry skills',
    text: 'Tools and tasks aligned with what offices, teams, and clients ask for today.',
    icon: Briefcase,
  },
]

export default function HomeWhyChooseUs() {
  const { src, alt } = siteImages.whyMentor

  return (
    <section id="why-boss" className="py-20 md:py-28 bg-white">
      <div className="section-container">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start mb-12 lg:mb-14">
          <div className="lg:sticky lg:top-28">
            <p className="text-sm font-semibold text-primary-600 uppercase tracking-wide mb-3">Why choose us</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-6 leading-tight">
              Why BOSS Academy
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed max-w-md">
              Clear paths, hands-on work, and support when you need it, not endless theory. We grow and refine our
              programs as we learn what works for beginners.
            </p>
          </div>

          <div className="w-full max-w-xl mx-auto lg:max-w-none lg:ml-auto lg:mr-0">
            <MediaImage
              src={src}
              alt={alt}
              aspect="portrait"
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="ring-1 ring-slate-200/80"
            />
          </div>
        </div>

        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {differentiators.map(({ title, text, icon: Icon }) => (
            <li key={title}>
              <div className="group rounded-card border border-slate-200/90 bg-surface/50 p-6 hover:bg-white hover:border-primary-200 hover:shadow-md transition-all duration-300 h-full">
                <div className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-white text-primary-600 ring-1 ring-slate-200/80 group-hover:ring-primary-200 transition-all">
                    <Icon className="w-5 h-5" strokeWidth={2} aria-hidden />
                  </span>
                  <div>
                    <h3 className="font-heading font-semibold text-slate-900 mb-1">{title}</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{text}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
