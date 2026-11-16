import type { ContactInput } from '../types'
import { supabase } from '../lib/supabase'

const DEMO_MESSAGES_KEY = 'petfood.demo-messages.v1'

export async function sendContactMessage(input: ContactInput): Promise<{ demo: boolean }> {
  if (supabase) {
    const { error } = await supabase.from('contact_messages').insert({
      name: input.name.trim(),
      email: input.email.trim(),
      message: input.message.trim(),
    })

    if (error) {
      throw new Error(`No pudimos enviar el mensaje: ${error.message}`)
    }

    return { demo: false }
  }

  try {
    const stored = JSON.parse(localStorage.getItem(DEMO_MESSAGES_KEY) ?? '[]')
    const messages = Array.isArray(stored) ? stored : []
    messages.push({ ...input, created_at: new Date().toISOString() })
    localStorage.setItem(DEMO_MESSAGES_KEY, JSON.stringify(messages.slice(-25)))
  } catch (error) {
    console.warn('No se pudo guardar el mensaje de demostración:', error)
  }

  return { demo: true }
}
