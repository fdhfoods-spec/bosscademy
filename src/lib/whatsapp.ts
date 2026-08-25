/** WhatsApp number for wa.me (country code + number, no +) */
export const WHATSAPP_NUMBER = '919916800685'

const guidancePrefill = encodeURIComponent("Hi, I'd like guidance on choosing the right course.")

/** Sitewide WhatsApp link with pre-filled career guidance message */
export const WHATSAPP_ADVISOR_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${guidancePrefill}`
