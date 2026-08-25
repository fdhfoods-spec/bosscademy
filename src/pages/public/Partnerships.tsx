import InstitutionalPartnership from '@/components/public/InstitutionalPartnership'
import FeaturedPrograms from '@/components/public/FeaturedPrograms'
import GovernmentCSRPrograms from '@/components/public/GovernmentCSRPrograms'
import TrainerOverviewSection from '@/components/public/TrainerOverviewSection'
import { Link } from 'react-router-dom'
import PageHero from '@/components/public/PageHero'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

export default function PartnershipsPage() {
  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        eyebrow="Hospitals, schools, government & enterprise"
        title="Enterprise & partnerships"
        subtitle="Industry-aligned training at scale for organizations that need real outcomes, not generic slides. We scope cohorts, on-site delivery, and CSR-style programs around your constraints."
        conversionCtas={{
          primaryHref: '/contact',
          primaryLabel: 'Discuss partnership',
          secondaryLabel: 'Get Free Guidance',
        }}
      >
        <Link
          to="/"
          className="text-sm font-medium text-white/90 hover:text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
        >
          ← Back to learner programs
        </Link>
      </PageHero>

      <InstitutionalPartnership />
      <FeaturedPrograms background="white" enterpriseMode />
      <GovernmentCSRPrograms />
      <TrainerOverviewSection />

      <section className="relative py-20 md:py-28 overflow-hidden bg-primary-600 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_100%_0%,rgba(249,115,22,0.2),transparent)]" />
        <div className="section-container relative text-center max-w-2xl mx-auto">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-5 text-balance leading-tight">
            Ready to partner?
          </h2>
          <p className="text-lg md:text-xl text-blue-100 mb-10 leading-relaxed">
            Tell us about your organization and we&apos;ll suggest a training approach that fits.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Link
              to="/contact"
              className="btn-cta px-8 py-3.5 text-base md:text-lg justify-center shadow-lg shadow-black/10"
            >
              Discuss partnership
            </Link>
            <a
              href={WHATSAPP_ADVISOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-8 py-3.5 text-base md:text-lg justify-center bg-white text-primary-600 border-primary-600"
            >
              Get Free Guidance
            </a>
          </div>
          <p className="mt-8 text-sm text-blue-100/95">
            <span className="text-blue-200/90">Individual learner? </span>
            <Link to="/programs" className="font-semibold text-white underline underline-offset-4 decoration-white/50 hover:decoration-white">
              Start Learning Now
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
