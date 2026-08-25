import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'
import { siteImages } from '@/lib/site-images'

export default function HomeTalkToUs() {
  const { src, alt } = siteImages.teamGuide

  return (
    <section className="py-14 md:py-16 bg-white border-t border-slate-100/80">
      <div className="section-container max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-10 lg:gap-12">
          {/* Portrait: visible border + neutral bg so failed loads are not a white disc on white */}
          <figure className="shrink-0 flex flex-col items-center w-full md:w-auto">
            <div className="relative mx-auto aspect-square w-[min(100%,220px)] sm:w-[220px] md:w-[260px] overflow-hidden rounded-full border-2 border-slate-200 bg-slate-100 shadow-md">
              <img
                src={src}
                alt={alt}
                className="w-full h-full object-cover object-center absolute inset-0"
              />
            </div>
            <figcaption className="text-center text-xs text-slate-500 mt-3 max-w-[260px] px-2 leading-snug">
              Your learning team · We&apos;re here to guide you
            </figcaption>
          </figure>

          <div className="flex-1 min-w-0 text-center md:text-left relative z-0">
            <h2 className="font-heading text-xl sm:text-2xl font-bold text-slate-900 mb-3">Talk to us directly</h2>
            <p className="text-slate-600 leading-relaxed mb-6">
              We&apos;re here to guide you, feel free to reach out and ask anything.
            </p>
            <a
              href={WHATSAPP_ADVISOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-8 py-3.5 text-base font-semibold inline-flex justify-center"
            >
              Get Free Guidance
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
