import { WHATSAPP_INFO_URL } from '../lib/constants'
import { WhatsAppIcon } from './Icons'

export function WhatsAppButton() {
  return (
    <a
      className="whatsapp-float"
      href={WHATSAPP_INFO_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Escribinos por WhatsApp"
    >
      <WhatsAppIcon />
      <span>¿Te ayudamos?</span>
    </a>
  )
}
