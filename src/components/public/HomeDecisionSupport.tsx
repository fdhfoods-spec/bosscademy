import { Link } from 'react-router-dom'

export default function HomeDecisionSupport() {
  return (
    <section className="py-14 md:py-16 bg-white">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center rounded-2xl border border-primary-200 bg-primary-50/50 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.75)] py-10 px-6">
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-3">Not Sure Which Course to Choose?</h2>
        <p className="text-slate-600 mb-6 leading-relaxed">
          Start with the free workshop. We&apos;ll guide you based on your goals.
        </p>
        <Link to="/register" className="btn-cta px-8 py-3">
          Start Learning Now
        </Link>
      </div>
    </section>
  )
}
