'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function RegistrationForm() {
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    city: '',
    educationProfession: '',
    programInterested: '',
    organization: '',
    message: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus('idle')

    try {
      const dbData = {
        full_name: formData.fullName,
        phone_number: formData.phoneNumber,
        email: formData.email,
        city: formData.city,
        education_profession: formData.educationProfession,
        program_interested: formData.programInterested,
        organization: formData.organization || null,
        message: formData.message || null,
      }

      const { error } = await supabase.from('registrations').insert([dbData])

      if (error) throw error

      fetch('/api/registration-apply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dbData),
      }).catch((notifyError) => {
        console.error('Error sending registration notification email:', notifyError)
      })

      setSubmitStatus('success')
      setFormData({
        fullName: '',
        phoneNumber: '',
        email: '',
        city: '',
        educationProfession: '',
        programInterested: '',
        organization: '',
        message: '',
      })
    } catch (error) {
      console.error('Error submitting form:', error)
      setSubmitStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-2xl mx-auto space-y-6 card-elevated p-6 md:p-10 hover:-translate-y-0.5"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="fullName" className="form-label">
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            required
            value={formData.fullName}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="phoneNumber" className="form-label">
            Phone number <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            required
            value={formData.phoneNumber}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="email" className="form-label">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div>
          <label htmlFor="city" className="form-label">
            City <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="city"
            name="city"
            required
            value={formData.city}
            onChange={handleChange}
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="educationProfession" className="form-label">
            Education / profession <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="educationProfession"
            name="educationProfession"
            required
            value={formData.educationProfession}
            onChange={handleChange}
            placeholder="e.g., B.Com final year, B.Tech fresher, 12th pass, career break"
            className="input-field"
          />
        </div>

        <div className="md:col-span-2">
          <label htmlFor="programInterested" className="form-label">
            Course or workshop <span className="text-red-500">*</span>
          </label>
          <select
            id="programInterested"
            name="programInterested"
            required
            value={formData.programInterested}
            onChange={handleChange}
            className="input-field"
          >
            <option value="">Select an option</option>
            <option value="Free Workshop">Free Workshop</option>
            <option value="AI-Powered Office Professional">AI-Powered Office Professional</option>
            <option value="Data Analytics & Business Intelligence">Data Analytics & Business Intelligence</option>
            <option value="Digital Marketing & Freelancing">Digital Marketing & Freelancing</option>
            <option value="Not sure, help me choose">Not sure, help me choose</option>
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="organization" className="form-label">
          College or employer <span className="text-slate-400 font-normal">(optional)</span>
        </label>
        <input
          type="text"
          id="organization"
          name="organization"
          value={formData.organization}
          onChange={handleChange}
          placeholder="e.g., college name, or leave blank if not applicable"
          className="input-field"
        />
      </div>

      <div>
        <label htmlFor="message" className="form-label">Message</label>
        <textarea
          id="message"
          name="message"
          rows={4}
          value={formData.message}
          onChange={handleChange}
          className="input-field min-h-[100px] resize-y"
          placeholder="What do you want to achieve? (e.g., first job, switch to analytics, start freelancing…)"
        />
      </div>

      {submitStatus === 'success' && (
        <div className="rounded-card border border-emerald-200 bg-emerald-50 text-emerald-900 px-4 py-3 text-sm">
          Thank you! We&apos;ve received your details and will contact you soon with next steps.
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
        {isSubmitting ? 'Sending…' : 'Start Learning Now'}
      </button>

      <p className="text-center text-sm text-slate-600">
        Our team will guide you step-by-step after you register.
      </p>

      <p className="text-center text-sm text-slate-500">
        Training for hospitals, schools, or companies?{' '}
        <a href="/partnerships" className="font-medium text-primary-600 hover:text-primary-700 hover:underline">
          Enterprise &amp; partnerships
        </a>
      </p>

      <div className="rounded-card border border-slate-200 bg-surface/80 px-5 py-5 text-sm text-slate-600">
        <h3 className="font-heading font-semibold text-slate-900 mb-3 text-sm">Why register with BOSS Academy?</h3>
        <ul className="space-y-2">
          {[
            'Practical training, not theory overload',
            'Real-world style projects',
            'Career- and income-focused paths',
            'Clear step-by-step learning path',
          ].map((line) => (
            <li key={line} className="flex items-start gap-2">
              <span className="text-primary-600 mt-0.5 font-bold" aria-hidden>
                ·
              </span>
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </div>
    </form>
  )
}
