import { Link } from 'react-router-dom'
import MediaImage from '@/components/public/MediaImage'
import { siteImages } from '@/lib/site-images'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

export default function Hero() {
  const { src, alt } = siteImages.hero

  return (
    <section className="relative overflow-hidden bg-surface pt-12 pb-16 md:pt-16 md:pb-20 lg:pt-20 lg:pb-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(37,99,235,0.12),transparent)]" />

      <div className="section-container relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
          <div className="lg:col-span-6 text-center lg:text-left">
            <p className="inline-block text-sm font-semibold text-primary-600 tracking-wide uppercase mb-4">
              Career-ready training
            </p>
            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-bold text-slate-900 leading-[1.12] text-balance mb-6">
              Build real skills. Start your career with confidence.
            </h1>
            <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-xl mx-auto lg:mx-0 mb-3">
              Practical, hands-on programs for students, job seekers, and beginners. No prior experience required.
            </p>
            <p className="text-sm text-slate-500 max-w-xl mx-auto lg:mx-0 mb-8">
              Designed for beginners starting from zero.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start items-stretch sm:items-center">
              <Link to="/programs" className="btn-cta px-7 py-3.5 text-base md:text-lg justify-center">
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
          </div>

          <div className="lg:col-span-6 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-md lg:max-w-lg">
              <div className="absolute -inset-3 rounded-[1.25rem] bg-gradient-to-br from-primary-600/15 via-transparent to-accent-500/10 blur-2xl" />
              <MediaImage
                src={src}
                alt={alt}
                aspect="hero"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="relative z-10 ring-1 ring-slate-200/80"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
