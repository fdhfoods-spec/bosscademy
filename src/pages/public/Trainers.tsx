import { Link } from 'react-router-dom'
import TrainerJoinSection from '@/components/public/TrainerJoinSection'
import PageHero from '@/components/public/PageHero'

export default function TrainersPage() {
  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        eyebrow="Teach with us"
        title="Apply as a trainer"
        subtitle="Share your expertise through practical, high-impact programs, part-time or full-time."
      >
        <Link
          to="/partnerships"
          className="text-sm font-medium text-white/90 hover:text-white underline underline-offset-4 decoration-white/40 hover:decoration-white transition-colors"
        >
          ← Enterprise &amp; partnerships
        </Link>
      </PageHero>

      <TrainerJoinSection />
    </div>
  )
}
