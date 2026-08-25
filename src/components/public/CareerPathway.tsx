interface StepProps {
  stepNumber: number
  title: string
  description: string
  icon: string
  isLast?: boolean
}

function Step({ stepNumber, title, description, icon, isLast = false }: StepProps) {
  return (
    <div className="flex flex-col items-center flex-1 relative">
      {/* Connector Line */}
      {!isLast && (
        <div className="hidden md:block absolute top-8 left-[60%] w-full h-0.5 bg-primary-300 z-0">
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}

      {/* Step Circle */}
      <div className="relative z-10 bg-slate-500 w-16 h-16 rounded-full flex items-center justify-center mb-4 shadow-inner border border-white/25">
        <span className="text-white text-2xl">{icon}</span>
      </div>

      {/* Step Number Badge */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -mt-2 bg-primary-700 text-white text-xs font-bold px-2 py-1 rounded-full">
        {stepNumber}
      </div>

      {/* Step Content */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
        <p className="text-slate-600 text-sm leading-relaxed">{description}</p>
      </div>
    </div>
  )
}

export default function CareerPathway() {
  const steps = [
    {
      stepNumber: 1,
      title: 'Register',
      description: 'Join a BOSS Academy training program and begin your learning journey.',
      icon: '📝',
    },
    {
      stepNumber: 2,
      title: 'Skill Training',
      description: 'Learn practical industry skills through hands-on training programs.',
      icon: '🎓',
    },
    {
      stepNumber: 3,
      title: 'Certification',
      description: 'Earn recognized certifications validating your professional skills.',
      icon: '🏆',
    },
    {
      stepNumber: 4,
      title: 'Career Opportunities',
      description: 'Access placement assistance and career opportunities.',
      icon: '💼',
    },
  ]

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Your Career Transformation Journey
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            A structured pathway designed to transform learners into industry-ready professionals.
          </p>
        </div>

        {/* Steps Timeline */}
        <div className="relative">
          {/* Desktop Horizontal Layout */}
          <div className="hidden md:flex md:items-start md:justify-between md:gap-4 relative">
            {steps.map((step, index) => (
              <Step
                key={index}
                stepNumber={step.stepNumber}
                title={step.title}
                description={step.description}
                icon={step.icon}
                isLast={index === steps.length - 1}
              />
            ))}
          </div>

          {/* Mobile Vertical Layout */}
          <div className="md:hidden space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                {/* Step Circle */}
                <div className="flex-shrink-0 relative">
                  <div className="bg-slate-500 w-16 h-16 rounded-full flex items-center justify-center shadow-inner border border-white/25">
                    <span className="text-white text-2xl">{step.icon}</span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="absolute top-16 left-1/2 transform -translate-x-1/2 w-0.5 h-8 bg-primary-300"></div>
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-2">
                  <div className="inline-block bg-primary-700 text-white text-xs font-bold px-2 py-1 rounded-full mb-2">
                    Step {step.stepNumber}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <a
            href="/register"
            className="btn-cta px-8 py-3"
          >
            Start Learning Now
          </a>
        </div>
      </div>
    </section>
  )
}
