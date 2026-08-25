'use client'

import { Link } from 'react-router-dom'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TrainerJoinSection() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    const formData = new FormData(e.currentTarget)

    const payload = {
      full_name: String(formData.get('trainerName') || ''),
      phone_number: String(formData.get('trainerPhone') || ''),
      email: String(formData.get('trainerEmail') || ''),
      experience_years: Number(formData.get('trainerExperience') || 0),
      area_of_expertise: String(formData.get('trainerExpertise') || ''),
      preferred_type: String(formData.get('trainerType') || ''),
      message: String(formData.get('trainerMessage') || ''),
    }

    try {
      const { error } = await supabase.from('trainer_applications').insert([payload])
      if (error) throw error

      fetch('/api/trainer-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).catch((notifyError) => {
        console.error('Error sending trainer notification email:', notifyError)
      })

      setSubmitStatus('success')
      e.currentTarget.reset()
    } catch (error) {
      console.error('Error submitting trainer application:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="section-container space-y-14 md:space-y-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="card-elevated p-8 md:p-10 hover:-translate-y-0.5">
            <h2 className="font-heading text-xl font-bold text-slate-900 mb-3">Part-time trainers</h2>
            <p className="text-slate-600 mb-5 leading-relaxed">
              Deliver sessions on weekends or specific modules alongside your professional work.
            </p>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Flexible scheduling around your commitments.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Mentor students and working professionals.</span>
              </li>
            </ul>
          </div>

          <div className="card-elevated p-8 md:p-10 hover:-translate-y-0.5">
            <h2 className="font-heading text-xl font-bold text-slate-900 mb-3">Full-time trainers</h2>
            <p className="text-slate-600 mb-5 leading-relaxed">
              Lead ongoing programs and institutional partnerships with dedicated assignments.
            </p>
            <ul className="space-y-3 text-slate-600 text-sm">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Structured work across multiple programs.</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-primary-600 shrink-0 mt-0.5" aria-hidden />
                <span>Shape curriculum and new initiatives.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <h2 className="font-heading text-lg font-semibold text-slate-900 mb-4 text-center md:text-left">
            Areas of expertise
          </h2>
          <div className="flex flex-wrap gap-2.5 justify-center md:justify-start">
            {[
              'Healthcare & hospital administration',
              'Electric vehicle (EV) technology',
              'AI & data science',
              'Cybersecurity',
              'Electronics & mobile repair',
              'Solar & electrical systems',
              'Soft skills & communication',
              'Corporate training & leadership',
            ].map((area) => (
              <span
                key={area}
                className="inline-flex items-center px-4 py-2 rounded-full bg-primary-600/10 text-primary-800 text-xs font-semibold border border-primary-600/15"
              >
                {area}
              </span>
            ))}
          </div>
        </div>

        <div className="text-center">
          <Link to="#trainer-application" className="btn-cta px-8 py-3.5 inline-flex justify-center">
            Go to application form
          </Link>
        </div>

        <div
          id="trainer-application"
          className="card-elevated max-w-3xl mx-auto p-8 md:p-10 scroll-mt-24 hover:-translate-y-0.5"
        >
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-2 text-center md:text-left">
            Trainer application
          </h2>
          <p className="text-sm md:text-base text-slate-600 mb-8 text-center md:text-left leading-relaxed">
            Share your details and we&apos;ll reach out about opportunities at BOSS Academy.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="trainerName" className="form-label">
                  Full name <span className="text-red-500">*</span>
                </label>
                <input id="trainerName" name="trainerName" type="text" required className="input-field" />
              </div>

              <div>
                <label htmlFor="trainerPhone" className="form-label">
                  Phone number <span className="text-red-500">*</span>
                </label>
                <input id="trainerPhone" name="trainerPhone" type="tel" required className="input-field" />
              </div>

              <div>
                <label htmlFor="trainerEmail" className="form-label">
                  Email <span className="text-red-500">*</span>
                </label>
                <input id="trainerEmail" name="trainerEmail" type="email" required className="input-field" />
              </div>

              <div>
                <label htmlFor="trainerExperience" className="form-label">
                  Experience (years) <span className="text-red-500">*</span>
                </label>
                <input
                  id="trainerExperience"
                  name="trainerExperience"
                  type="number"
                  min={0}
                  required
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label htmlFor="trainerExpertise" className="form-label">
                Area of expertise <span className="text-red-500">*</span>
              </label>
              <select id="trainerExpertise" name="trainerExpertise" required className="input-field">
                <option value="">Select an area</option>
                <option value="Healthcare & Hospital Administration">Healthcare &amp; hospital administration</option>
                <option value="Electric Vehicle (EV) Technology">Electric vehicle (EV) technology</option>
                <option value="Artificial Intelligence & Data Science">AI &amp; data science</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Electronics & Mobile Repair">Electronics &amp; mobile repair</option>
                <option value="Solar & Electrical Systems">Solar &amp; electrical systems</option>
                <option value="Soft Skills & Communication">Soft skills &amp; communication</option>
                <option value="Corporate Training & Leadership">Corporate training &amp; leadership</option>
              </select>
            </div>

            <div>
              <label htmlFor="trainerType" className="form-label">
                Preferred type <span className="text-red-500">*</span>
              </label>
              <select id="trainerType" name="trainerType" required className="input-field">
                <option value="">Select type</option>
                <option value="Part-Time">Part-time</option>
                <option value="Full-Time">Full-time</option>
              </select>
            </div>

            <div>
              <label htmlFor="trainerMessage" className="form-label">Message</label>
              <textarea
                id="trainerMessage"
                name="trainerMessage"
                rows={4}
                className="input-field min-h-[100px] resize-y"
                placeholder="Tell us about your experience and the training you would like to deliver…"
              />
            </div>

            {submitStatus === 'success' && (
              <div className="rounded-card border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 text-sm">
                Thank you! Your application is in. Our team will contact you soon.
              </div>
            )}

            {submitStatus === 'error' && (
              <div className="rounded-card border border-red-200 bg-red-50 text-red-800 px-4 py-3 text-sm">
                Something went wrong. Please try again or contact us directly.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-cta w-full px-6 py-3.5 justify-center disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md disabled:hover:translate-y-0 disabled:active:scale-100"
            >
              {isSubmitting ? 'Sending…' : 'Send application'}
            </button>
          </form>
        </div>
      </div>
    </section>
  )
}
