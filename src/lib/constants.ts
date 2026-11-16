export const WHATSAPP_NUMBER = '541135723651'
export const CONTACT_EMAIL = 'eduardogermans40@gmail.com'

export function whatsappUrl(message: string): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}

export const WHATSAPP_INFO_URL = whatsappUrl(
  'Hola PET FOOD, quiero hacer una consulta sobre sus productos.',
)
