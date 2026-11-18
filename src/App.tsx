import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { CartProvider } from './context/CartContext'
import { Layout } from './components/Layout'
import { RequireAdmin } from './components/RequireAdmin'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/HomePage'
import { ProductsPage } from './pages/ProductsPage'
import { CartPage } from './pages/CartPage'
import { CheckoutPage } from './pages/CheckoutPage'
import { DeliveryPage } from './pages/DeliveryPage'
import { ContactPage } from './pages/ContactPage'
import { AdminLoginPage } from './pages/AdminLoginPage'
import { AdminProductsPage } from './pages/AdminProductsPage'
import { NotFoundPage } from './pages/NotFoundPage'

export default function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <CartProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="productos" element={<Navigate to="/productos/perros" replace />} />
              <Route path="productos/:categoria" element={<ProductsPage />} />
              <Route path="carrito" element={<CartPage />} />
              <Route path="checkout" element={<CheckoutPage />} />
              <Route path="entregas" element={<DeliveryPage />} />
              <Route path="contacto" element={<ContactPage />} />
              <Route path="admin/login" element={<AdminLoginPage />} />
              <Route
                path="admin/productos"
                element={
                  <RequireAdmin>
                    <AdminProductsPage />
                  </RequireAdmin>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  )
}
