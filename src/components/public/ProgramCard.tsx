import { Link } from 'react-router-dom'

interface ProgramCardProps {
  title: string
  description: string
  icon: string
  href?: string
}

export default function ProgramCard({ title, description, icon, href = '/register' }: ProgramCardProps) {
  return (
    <div className="bg-background-light rounded-xl shadow-lg hover:shadow-xl transition-shadow p-6 border border-background-dark">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 mb-6">{description}</p>
      <Link
        to={href}
        className="inline-block text-primary-600 font-semibold hover:text-primary-700 transition"
      >
        Learn More →
      </Link>
    </div>
  )
}
