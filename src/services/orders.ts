import type { CreatedOrder, OrderInput } from '../types'
import { supabase } from '../lib/supabase'

const DEMO_ORDERS_KEY = 'petfood.demo-orders.v1'
const NUMERIC_ID_PATTERN = /^\d+$/

interface CreateOrderResponse {
  pedido_id: string
  total: number | string
}

function createLocalId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `demo-${crypto.randomUUID().slice(0, 8)}`
  }
  return `demo-${Math.random().toString(36).slice(2, 10)}`
}

function saveDemoOrder(order: CreatedOrder & { input: OrderInput }): void {
  try {
    const stored = JSON.parse(localStorage.getItem(DEMO_ORDERS_KEY) ?? '[]')
    const orders = Array.isArray(stored) ? stored : []
    orders.push(order)
    localStorage.setItem(DEMO_ORDERS_KEY, JSON.stringify(orders.slice(-25)))
  } catch (error) {
    console.warn('No se pudo guardar el pedido de demostración:', error)
  }
}

export async function createOrder(input: OrderInput): Promise<CreatedOrder> {
  const total = input.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)

  if (supabase) {
    const items = input.items.map((item) => {
      const productId = String(item.productId).trim()
      if (!NUMERIC_ID_PATTERN.test(productId)) {
        throw new Error('Uno de los productos del carrito no está disponible en la tienda.')
      }
      return { producto_id: productId, cantidad: item.quantity }
    })

    const payload = {
      cliente_nombre: input.customerName.trim(),
      telefono: input.phone.trim(),
      email: input.email.trim() || null,
      metodo_entrega: input.deliveryMethod,
      direccion: input.deliveryMethod === 'delivery' ? input.address.trim() : null,
      localidad: input.deliveryMethod === 'delivery' ? input.city.trim() : null,
      notas: input.notes.trim() || null,
      items,
    }

    const { data, error } = await supabase.rpc('crear_pedido', { payload })
    if (error) {
      throw new Error(`No pudimos registrar el pedido: ${error.message}`)
    }

    const result = data as CreateOrderResponse
    return {
      id: result.pedido_id,
      total: Number(result.total),
      demo: false,
      createdAt: new Date().toISOString(),
    }
  }

  const created: CreatedOrder = {
    id: createLocalId(),
    total,
    demo: true,
    createdAt: new Date().toISOString(),
  }
  saveDemoOrder({ ...created, input })
  return created
}
