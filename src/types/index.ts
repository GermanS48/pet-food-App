export type Category = 'perros' | 'gatos'
export type DeliveryMethod = 'delivery' | 'pickup'

export interface Product {
  id: string
  name: string
  slug: string
  category: Category
  price: number
  imageUrl: string
  externalUrl: string | null
  seller: string | null
  rating: number | null
  reviewsCount: number
  featured: boolean
}

export interface CartLine {
  product: Product
  quantity: number
}

export interface OrderItemInput {
  productId: string
  name: string
  unitPrice: number
  quantity: number
}

export interface CheckoutFields {
  customerName: string
  phone: string
  email: string
  deliveryMethod: DeliveryMethod
  address: string
  city: string
  notes: string
}

export interface OrderInput extends CheckoutFields {
  items: OrderItemInput[]
}

export interface CreatedOrder {
  id: string
  total: number
  demo: boolean
  createdAt: string
}

export interface ContactInput {
  name: string
  email: string
  message: string
}
