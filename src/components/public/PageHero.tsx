import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

type ConversionCtas = {
  /** Primary CTA target (e.g. `#programs` on /programs, `/programs` elsewhere) */
  primaryHref: string
  primaryLabel?: string
  secondaryLabel?: string
}

type PageHeroProps = {
  /** Small uppercase line above the title (optional) */
  eyebrow?: string
  title: string
  subtitle: string
  /** Orange + blue-outline pair aligned with home hero / final CTA funnel */
  conversionCtas?: ConversionCtas
  /** e.g. back link row below subtitle */
  children?: ReactNode
}

/**
 * Shared hero block: matches home-adjacent pages (primary blue, orange glow, Poppins title, Inter body).
 */
export default function PageHero({ eyebrow, title, subtitle, conversionCtas, children }: PageHeroProps) {
  const primaryLabel = conversionCtas?.primaryLabel ?? 'Start Learning Now'
  const secondaryLabel = conversionCtas?.secondaryLabel ?? 'Get Free Guidance'

  return (
    <div className="relative overflow-hidden bg-primary-600 text-white py-14 md:py-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_80%_at_100%_0%,rgba(249,115,22,0.18),transparent)]" />
      <div className="section-container relative text-center max-w-3xl mx-auto">
        {eyebrow ? (
          <p className="text-sm font-semibold text-blue-200 uppercase tracking-wide mb-3">{eyebrow}</p>
        ) : null}
        <h1 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-balance text-white">
          {title}
        </h1>
        <p className="text-lg md:text-xl text-blue-100 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>

        {conversionCtas ? (
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center">
            <Link
              to={conversionCtas.primaryHref}
              className="btn-cta px-7 py-3.5 text-base md:text-lg justify-center shadow-lg shadow-black/15"
            >
              {primaryLabel}
            </Link>
            <a
              href={WHATSAPP_ADVISOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-7 py-3.5 text-base md:text-lg justify-center"
            >
              {secondaryLabel}
            </a>
          </div>
        ) : null}

        {children ? <div className={conversionCtas ? 'mt-6' : 'mt-8'}>{children}</div> : null}
      </div>
    </div>
  )
}
