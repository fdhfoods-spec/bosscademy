import { Link } from 'react-router-dom'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

export default function CourseCtaBlock({ className = '' }: { className?: string }) {
  return (
    <div className={`flex flex-col sm:flex-row gap-3 justify-center items-stretch sm:items-center ${className}`}>
      <Link to="/register" className="btn-cta px-7 py-3.5 text-base md:text-lg justify-center">
        Start Learning Now
      </Link>
      <a
        href={WHATSAPP_ADVISOR_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-outline px-7 py-3.5 text-base md:text-lg justify-center"
      >
        Get Free Guidance
      </a>
    </div>
  )
}
