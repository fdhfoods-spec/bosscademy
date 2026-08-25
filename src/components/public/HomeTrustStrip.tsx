import { ShieldCheck, Sparkles, Target, MessageCircle } from 'lucide-react'

const items = [
  { icon: ShieldCheck, label: 'Beginner-friendly paths' },
  { icon: Sparkles, label: 'Learn by doing' },
  { icon: Target, label: 'Focused on practical, real-world skills' },
  { icon: MessageCircle, label: 'Guidance provided step-by-step' },
]

export default function HomeTrustStrip() {
  return (
    <section className="bg-white py-8 md:py-10">
      <div className="section-container">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          {items.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3 text-center sm:text-left group"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-card bg-primary-600/10 text-primary-600 transition-transform duration-200 group-hover:scale-110">
                <Icon className="h-5 w-5" strokeWidth={2} aria-hidden />
              </span>
              <span className="text-sm font-medium text-slate-700 leading-snug max-w-[11rem]">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
