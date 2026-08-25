import { Link } from 'react-router-dom'
import { Landmark, Handshake, Users } from 'lucide-react'

interface ProgramCard {
  title: string
  description: string
  buttonText: string
  icon: React.ReactNode
}

export default function GovernmentCSRPrograms() {
  const programs: ProgramCard[] = [
    {
      title: 'Government skill programs',
      description:
        'Support for national skill initiatives: healthcare training, digital literacy, and youth employability.',
      buttonText: 'Discuss partnership',
      icon: <Landmark className="w-10 h-10" strokeWidth={1.5} />,
    },
    {
      title: 'CSR skill development',
      description:
        'CSR programs focused on job-ready skills, digital education, and workforce development.',
      buttonText: 'Discuss partnership',
      icon: <Handshake className="w-10 h-10" strokeWidth={1.5} />,
    },
    {
      title: 'NGO & social impact',
      description:
        'Youth and community training aligned with empowerment and livelihood outcomes.',
      buttonText: 'Start Learning Now',
      icon: <Users className="w-10 h-10" strokeWidth={1.5} />,
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-white border-t border-slate-100">
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center mb-14 md:mb-16">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 mb-4">
            Government &amp; CSR programs
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            We work with government bodies, CSR funds, and NGOs to deliver training that scales, with practical
            delivery, not slide-only workshops. Share your mandate and timeline, and we&apos;ll respond with a realistic
            scope.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {programs.map((program, index) => (
            <article
              key={index}
              className="card-elevated p-8 flex flex-col h-full hover:-translate-y-1"
            >
              <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-card bg-primary-600/10 text-primary-600">
                {program.icon}
              </div>
              <h3 className="font-heading text-xl font-bold text-slate-900 mb-3">{program.title}</h3>
              <p className="text-slate-600 mb-8 flex-1 leading-relaxed">{program.description}</p>
              <Link to="/contact" className="btn-cta px-6 py-3 text-center justify-center">
                {program.buttonText}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
