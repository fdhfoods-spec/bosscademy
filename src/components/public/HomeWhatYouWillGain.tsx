import { CheckCircle2 } from 'lucide-react'

const gains = [
  'Practical skills you can apply in real tasks and conversations',
  'Confidence to take the next step toward work or freelance projects',
  'Understanding of real tools and workflows teams use today',
  'Clear direction on what to learn or practice next',
]

export default function HomeWhatYouWillGain() {
  return (
    <section className="py-20 md:py-28 bg-white">
      <div className="section-container">
        <div className="max-w-2xl mx-auto text-center mb-14 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">What You Will Gain</h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Outcomes we design for, without promising unrealistic job guarantees or inflated stats.
          </p>
        </div>

        <ul className="max-w-2xl mx-auto space-y-4">
          {gains.map((line) => (
            <li key={line} className="flex gap-4 items-start rounded-card border border-slate-200/90 bg-surface/50 px-5 py-4">
              <CheckCircle2 className="w-6 h-6 text-primary-600 shrink-0 mt-0.5" aria-hidden />
              <span className="text-slate-700 leading-relaxed">{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
