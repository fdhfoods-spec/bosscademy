import { Link } from 'react-router-dom'
import { Laptop, BarChart3, Megaphone } from 'lucide-react'
import MediaImage from '@/components/public/MediaImage'
import { siteImages } from '@/lib/site-images'

const courses = [
  {
    id: 'office',
    headline: 'Walk into any workplace ready to contribute from week one.',
    title: 'AI-Powered Office Professional',
    bullets: [
      'Documents, spreadsheets, and professional email: the daily toolkit',
      'Templates and workflows you can reuse on the job',
      'Clear communication for teams and managers',
    ],
    duration: '2-3 weeks',
    icon: Laptop,
    cta: 'Start Learning Now',
    ctaHref: '/programs/office',
    imageKey: 'office' as const,
  },
  {
    id: 'data',
    headline: 'Turn raw data into clear answers hiring teams understand.',
    title: 'Data Analytics & Business Intelligence',
    bullets: [
      'Clean data, spot patterns, and explain what matters',
      'Dashboards and reports that look like real work samples',
      'Practice with questions similar to actual business decisions',
    ],
    duration: '60-90 days',
    icon: BarChart3,
    cta: 'Start Learning Now',
    ctaHref: '/programs/data',
    imageKey: 'data' as const,
  },
  {
    id: 'marketing',
    headline: 'Channel skills for a job or your first online income.',
    title: 'Digital Marketing & Freelancing',
    bullets: [
      'Campaigns and channels in plain, practical language',
      'Work you can show in interviews or to your first clients',
      'Freelance basics so you can start small and grow confidently',
    ],
    duration: 'Flexible pace',
    icon: Megaphone,
    cta: 'Start Learning Now',
    ctaHref: '/programs/marketing',
    imageKey: 'marketing' as const,
  },
]

export default function HomeCoreCourses() {
  return (
    <section id="courses" className="py-20 md:py-28 bg-surface">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-10 md:mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">Core programs</h2>
          <p className="text-lg text-slate-600 leading-relaxed mb-3">
            Tracks built around skills you use on the job: short bursts of learning, then practice.
          </p>
          <p className="text-sm text-slate-500">
            Limited seats per batch · New batches starting regularly
          </p>
        </div>

        <div className="max-w-3xl mx-auto mb-12 md:mb-14">
          <div className="rounded-card border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm">
            <h3 className="font-heading text-lg md:text-xl font-semibold text-slate-900 mb-3 text-center sm:text-left">
              What to start first
            </h3>
            <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-6 text-center sm:text-left">
              New to workplace tools? Start with <strong className="font-semibold text-slate-800">Office</strong>. It is
              the shortest track and gives you a practical base for almost any path. Then add{' '}
              <strong className="font-semibold text-slate-800">Data</strong> if you want analyst-style roles, or{' '}
              <strong className="font-semibold text-slate-800">Marketing</strong> if you want campaigns or online income.
              You can always come back for another track; there is no single “right” order for everyone.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-card border border-primary-100 bg-primary-50/40 p-4 md:p-5">
                <p className="font-heading text-sm font-semibold text-primary-800 mb-2">Aiming for a job</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Office plus Data or Marketing helps you build real tasks and samples you can talk about in interviews,
                  not just a list of course names on your CV.
                </p>
              </div>
              <div className="rounded-card border border-accent-100 bg-accent-50/30 p-4 md:p-5">
                <p className="font-heading text-sm font-semibold text-slate-900 mb-2">Working on your own</p>
                <p className="text-sm text-slate-600 leading-relaxed">
                  Marketing includes channels and freelance basics so you can start small. Office skills still help you
                  stay organized with clients, files, and follow-ups.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-10">
          {courses.map((course) => {
            const Icon = course.icon
            const { src, alt } = siteImages.courses[course.imageKey]
            return (
              <article
                key={course.id}
                className="group rounded-card border border-slate-200/90 bg-white flex flex-col h-full shadow-sm hover:shadow-lg hover:border-primary-200/80 hover:-translate-y-1 transition-all duration-300 overflow-hidden"
              >
                <div className="relative">
                  <MediaImage
                    src={src}
                    alt={alt}
                    aspect="card"
                    corners="top"
                    hoverZoom
                    sizes="(max-width: 768px) 100vw, (max-width:1200px) 50vw, 33vw"
                  />
                  <span
                    className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-card bg-white/95 text-primary-600 shadow-sm ring-1 ring-slate-200/80 backdrop-blur-sm"
                    aria-hidden
                  >
                    <Icon className="w-5 h-5" strokeWidth={2} />
                  </span>
                </div>

                <div className="p-8 flex flex-col flex-1 pt-7">
                  <p className="text-primary-700 font-semibold text-base leading-snug mb-2">{course.headline}</p>
                  <h3 className="font-heading text-lg font-bold text-slate-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-1">Duration: {course.duration}</p>
                  <p className="text-xs text-slate-500 mb-6">Limited seats per batch · New batches starting regularly</p>
                  <ul className="mb-8 space-y-3 text-sm text-slate-600 flex-1">
                    {course.bullets.map((line) => (
                      <li key={line} className="flex gap-3 leading-relaxed">
                        <span className="text-accent-500 font-bold shrink-0 mt-0.5" aria-hidden>
                          ·
                        </span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <Link to={course.ctaHref} className="btn-cta w-full text-center px-6 py-3.5 text-base">
                    {course.cta}
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
