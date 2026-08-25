const steps = [
  { n: 1, text: 'Learn the basics with guided training' },
  { n: 2, text: 'Practice real tasks and assignments' },
  { n: 3, text: 'Build projects you can showcase' },
  { n: 4, text: 'Get guidance for jobs or freelancing' },
]

export default function HomeAfterJoin() {
  return (
    <section
      id="after-join"
      className="py-16 md:py-20 bg-gray-50 border-y border-gray-100 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.55)]"
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 text-center mb-3">
          What Happens After You Join
        </h2>
        <ol className="space-y-5">
          {steps.map((step) => (
            <li key={step.n} className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-9 h-9 rounded-full bg-slate-500 text-white flex items-center justify-center text-sm font-bold shadow-inner border border-white/20">
                {step.n}
              </span>
              <p className="text-slate-600 pt-1 leading-relaxed">{step.text}</p>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-center font-semibold text-slate-900">
          You won&apos;t just learn. You&apos;ll be ready to perform.
        </p>
      </div>
    </section>
  )
}
