import { MessageCircle } from 'lucide-react'
import { WHATSAPP_ADVISOR_URL } from '@/lib/whatsapp'

export default function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_ADVISOR_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] group"
      style={{ paddingBottom: 'max(0px, env(safe-area-inset-bottom))' }}
      aria-label="Chat on WhatsApp"
    >
      <div className="relative">
        <div className="absolute right-14 bottom-1 hidden md:block opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          <span className="bg-gray-900 text-white text-xs px-3 py-1.5 rounded-md shadow-lg whitespace-nowrap">
            Message us on WhatsApp
          </span>
        </div>

        <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-full bg-green-500 text-white shadow-lg shadow-green-900/20 ring-2 ring-white/90 hover:bg-green-600 transition-transform duration-200 group-hover:scale-105">
          <MessageCircle className="w-7 h-7 md:w-8 md:h-8" strokeWidth={2} aria-hidden />
        </div>
      </div>
    </a>
  )
}
