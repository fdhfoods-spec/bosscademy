'use client'

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Phone, Mail, MessageCircle } from 'lucide-react'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'
import PageHero from '@/components/public/PageHero'

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Thank you for your message! We will contact you soon.')
    setFormData({ name: '', email: '', phone: '', message: '' })
  }

  return (
    <div className="bg-surface min-h-screen">
      <PageHero
        eyebrow="We're here to help"
        title="Contact us"
        subtitle="Questions about programs, partnerships, or enrollment. Send a message or reach us directly."
      />

      <div className="section-container py-20 md:py-28">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-6xl mx-auto">
          <div className="card-elevated p-8 md:p-10 hover:-translate-y-0.5">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-8">Get in touch</h2>

            <div className="space-y-8">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-primary-600/10 text-primary-600">
                  <Phone className="w-5 h-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-slate-900 mb-1">Phone</h3>
                  <a
                    href="tel:9916800685"
                    className="text-primary-600 hover:text-primary-700 font-medium text-lg transition-colors"
                  >
                    9916 800 685
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-primary-600/10 text-primary-600">
                  <MessageCircle className="w-5 h-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-slate-900 mb-3">WhatsApp</h3>
                  <a
                    href={WHATSAPP_ADVISOR_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-cta inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                  >
                    Get Free Guidance
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-card bg-primary-600/10 text-primary-600">
                  <Mail className="w-5 h-5" strokeWidth={2} aria-hidden />
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-slate-900 mb-1">Email</h3>
                  <a
                    href="mailto:info@bossacademy.org"
                    className="text-primary-600 hover:text-primary-700 transition-colors break-all"
                  >
                    info@bossacademy.org
                  </a>
                </div>
              </div>
            </div>

            <p className="mt-10 pt-8 text-sm text-slate-600">
              Prefer the student site?{' '}
              <Link to="/programs" className="font-medium text-primary-600 hover:underline">
                View programs
              </Link>
            </p>
          </div>

          <div className="card-elevated p-8 md:p-10 hover:-translate-y-0.5">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-slate-900 mb-8">Send a message</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="form-label">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
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
                <label htmlFor="phone" className="form-label">
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label htmlFor="message" className="form-label">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  value={formData.message}
                  onChange={handleChange}
                  className="input-field min-h-[120px] resize-y"
                  placeholder="Tell us how we can help…"
                />
              </div>

              <button type="submit" className="btn-cta w-full px-6 py-3.5 justify-center">
                Send message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
