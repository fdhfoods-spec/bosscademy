import { Link } from 'react-router-dom'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

export default function HomeFinalCTA() {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden bg-primary-600 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_100%_0%,rgba(249,115,22,0.2),transparent)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_0%_100%,rgba(255,255,255,0.08),transparent)]" />

      <div className="section-container relative z-10 text-center max-w-3xl mx-auto">
        <h2 className="font-heading text-3xl md:text-4xl lg:text-[2.5rem] font-bold mb-10 leading-tight text-balance">
          Start Your Learning Journey Today
        </h2>
        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center w-full max-w-xl">
            <Link to="/programs" className="btn-cta px-8 py-4 text-base md:text-lg justify-center shadow-lg shadow-black/10">
              Start Learning Now
            </Link>
            <a
              href={WHATSAPP_ADVISOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-8 py-4 text-base md:text-lg justify-center"
            >
              Get Free Guidance
            </a>
          </div>
          <Link
            to="/contact"
            className="text-base font-semibold text-white/95 hover:text-white underline underline-offset-4 decoration-white/50 hover:decoration-white transition-colors"
          >
            Talk to Advisor
          </Link>
        </div>
      </div>
    </section>
  )
}
