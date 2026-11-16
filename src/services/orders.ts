import type { CreatedOrder, OrderInput } from '../types'
import { supabase } from '../lib/supabase'

const DEMO_ORDERS_KEY = 'petfood.demo-orders.v1'
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

interface CreateOrderResponse {
  order_id: string
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
    const payload = {
      customer_name: input.customerName.trim(),
      phone: input.phone.trim(),
      email: input.email.trim() || null,
      delivery_method: input.deliveryMethod,
      address: input.deliveryMethod === 'delivery' ? input.address.trim() : null,
      city: input.deliveryMethod === 'delivery' ? input.city.trim() : null,
      notes: input.notes.trim() || null,
      items: input.items.map((item) => ({
        product_id: UUID_PATTERN.test(item.productId) ? item.productId : null,
        product_name: item.name,
        unit_price: item.unitPrice,
        quantity: item.quantity,
      })),
    }

    const { data, error } = await supabase.rpc('create_order', { payload })
    if (error) {
      throw new Error(`No pudimos registrar el pedido: ${error.message}`)
    }

    const result = data as CreateOrderResponse
    return {
      id: result.order_id,
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
