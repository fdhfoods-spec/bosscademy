import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

export default function HomeNotSureSection() {
  return (
    <section className="py-16 md:py-20 bg-surface border-t border-slate-100/80">
      <div className="section-container text-center max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-heading text-2xl sm:text-3xl md:text-[2rem] font-bold text-slate-900 mb-4 text-balance">
          Not Sure Where to Start?
        </h2>
        <p className="text-lg text-slate-600 leading-relaxed mb-2">
          We&apos;ll help you choose the right course based on your background and goals.
        </p>
        <p className="text-sm text-slate-500 mb-8">Guidance provided step-by-step. Ask us anything.</p>
        <a
          href={WHATSAPP_ADVISOR_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-outline px-8 py-3.5 text-base font-semibold inline-flex justify-center"
        >
          Get Free Guidance
        </a>
      </div>
    </section>
  )
}
