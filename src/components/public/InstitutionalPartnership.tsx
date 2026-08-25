'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'
import {
  Building2,
  GraduationCap,
  Users,
  Lightbulb,
  CircuitBoard,
  Car,
  CheckCircle2,
  MessageCircle,
} from 'lucide-react'

type Card = {
  id: string
  title: string
  label: string
  description: string
  cta: string
  /** Enterprise: contact. Trainers: /trainers */
  href: string
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const primaryCards: Card[] = [
  {
    id: 'education',
    title: 'Educational Institutions',
    label: 'Schools & Colleges',
    description:
      'Equip students with industry-ready skills, future technologies, and career-focused training that improves placement outcomes.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: GraduationCap,
  },
  {
    id: 'hospitals',
    title: 'Healthcare Organizations',
    label: 'Hospitals',
    description:
      'Train staff in patient care, hospital administration, billing, and digital systems to reduce errors and improve patient experience.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: MessageCircle,
  },
  {
    id: 'corporate',
    title: 'Corporate & Business Teams',
    label: 'Corporate Organizations',
    description:
      'Upskill employees in digital tools, leadership, and emerging technologies to boost productivity and business growth.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: Building2,
  },
  {
    id: 'industrial',
    title: 'Industrial & Manufacturing Units',
    label: 'Industrial & Manufacturing',
    description:
      'Develop skilled technicians in EV, electrical systems, safety, and operations to improve throughput and reduce downtime.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: Car,
  },
  {
    id: 'government',
    title: 'Government & Skill Development Bodies',
    label: 'Government & Missions',
    description:
      'Collaborate on large-scale skill development, employment programs, and workforce initiatives that deliver measurable impact.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: CheckCircle2,
  },
  {
    id: 'trainers',
    title: 'Trainers & Industry Experts',
    label: 'Trainers / Partners',
    description:
      'Join as a trainer or partner to deliver high-impact training programs across industries.',
    cta: 'Apply as trainer',
    href: '/trainers',
    icon: Users,
  },
]

const moreCards: Card[] = [
  {
    id: 'startups',
    title: 'Startups & SMEs',
    label: 'Startups & Small Businesses',
    description:
      'Support lean teams with practical training that accelerates product delivery, customer acquisition, and market readiness.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: Lightbulb,
  },
  {
    id: 'it-tech',
    title: 'IT & Technology Companies',
    label: 'IT & Tech',
    description:
      'Build strong engineering and operations teams with upskilling in modern stacks, tools, and delivery practices.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: CircuitBoard,
  },
  {
    id: 'ev-auto',
    title: 'EV & Automotive Sector',
    label: 'EV & Automotive',
    description:
      'Create EV-ready technicians and engineers through hands-on training in EV systems and diagnostics that improves service quality.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: Car,
  },
  {
    id: 'ngos',
    title: 'NGOs & Social Organizations',
    label: 'NGOs & Impact Orgs',
    description:
      'Partner on community-focused skilling, employability, and livelihood programs that increase long-term impact.',
    cta: 'Discuss partnership',
    href: '/contact',
    icon: CheckCircle2,
  },
]

const containerVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      staggerChildren: 0.12,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

export default function IndustryPartnershipsSection() {
  const [showMore, setShowMore] = useState(false)

  return (
    <section id="industry-partnerships" className="bg-surface py-20 md:py-28">
      <div className="section-container">
        <motion.div
          className="mx-auto max-w-3xl text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary-600 sm:text-sm">
            Flexible training for modern organizations
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
            Industry partnerships that deliver real results
          </h2>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Custom training aligned to your teams, with practical delivery and measurable outcomes. Tell us your sector
            and goals, and we&apos;ll suggest a format that fits (on-site, cohort, or hybrid).
          </p>
        </motion.div>

        {/* Primary cards */}
        <motion.div
          className="mt-12 grid gap-6 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
        >
          {primaryCards.map((card) => (
            <Card key={card.id} card={card} />
          ))}
        </motion.div>

        {/* Micro-conversion strip */}
        <motion.div
          className="mt-10 rounded-card bg-white px-5 py-6 text-center shadow-sm border border-slate-200/90 sm:px-8 md:flex md:items-center md:justify-between md:text-left"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <div>
            <p className="text-sm font-semibold text-slate-900 sm:text-base">Not sure where to start?</p>
            <p className="mt-1 text-xs text-slate-600 sm:text-sm">
              Talk to our team to find the right training solution for your organization.
            </p>
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-center gap-3 md:mt-0 md:justify-end">
            <Link to="/contact" className="btn-outline px-5 py-2.5 text-sm justify-center">
              Contact us
            </Link>
            <a
              href={WHATSAPP_ADVISOR_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline px-5 py-2.5 text-sm justify-center"
            >
              Get Free Guidance
            </a>
          </div>
        </motion.div>

        <div className="mt-10 flex flex-col items-center">
          <p className="text-xs text-slate-500 sm:text-sm">
            We support multiple industries across sectors and organization sizes.
          </p>
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            className="mt-6 btn-cta inline-flex items-center gap-2 px-6 py-2.5 text-sm"
          >
            {showMore ? 'Show less' : 'More industries'}
            <span className={`transition-transform ${showMore ? 'rotate-180' : ''}`}>{showMore ? '↑' : '↓'}</span>
          </button>
        </div>

        {/* Expandable cards */}
        <motion.div
          initial={false}
          animate={showMore ? 'open' : 'collapsed'}
          variants={{
            open: { opacity: 1, height: 'auto', marginTop: 24 },
            collapsed: { opacity: 0, height: 0, marginTop: 0 },
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          {showMore && (
            <motion.div
              className="mt-4 grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {moreCards.map((card) => (
                <Card key={card.id} card={card} />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Trust strip */}
        <motion.div
          className="mt-12 rounded-card bg-white px-5 py-4 text-center text-xs font-medium text-slate-600 border border-slate-200/90 shadow-sm sm:text-sm"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          Industry-focused · Practical learning · Scalable delivery
        </motion.div>
      </div>
    </section>
  )
}

function Card({ card }: { card: Card }) {
  const Icon = card.icon
  return (
    <motion.article
      variants={cardVariants}
      className="group relative flex h-full flex-col rounded-card bg-white p-6 shadow-sm border border-slate-200/90 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary-200/80"
    >
      <div className="pointer-events-none absolute inset-0 rounded-card opacity-0 group-hover:opacity-100 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.06),_transparent_60%)] transition-opacity duration-300" />

      <div className="relative z-10 flex flex-1 flex-col">
        <div className="mb-4 flex items-center gap-3">
          <motion.div
            className="flex h-11 w-11 items-center justify-center rounded-card bg-primary-600/10 text-primary-600"
            whileHover={{ scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
          <span className="text-xs font-semibold uppercase tracking-wide text-primary-600">{card.label}</span>
        </div>

        <h3 className="font-heading text-lg font-semibold text-slate-900 sm:text-xl">{card.title}</h3>
        <p className="mt-3 text-sm text-slate-600 leading-relaxed">{card.description}</p>

        <div className="mt-6">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link to={card.href} className="btn-cta block w-full text-center px-4 py-2.5 text-sm">
              {card.cta}
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.article>
  )
}
