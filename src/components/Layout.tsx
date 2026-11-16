import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AboutModal } from './AboutModal'
import { Footer } from './Footer'
import { Header } from './Header'
import { Toast } from './Toast'
import { WhatsAppButton } from './WhatsAppButton'

export function Layout() {
  const [aboutOpen, setAboutOpen] = useState(false)
  const closeAbout = useCallback(() => setAboutOpen(false), [])

  return (
    <>
      <a className="skip-link" href="#contenido">
        Saltar al contenido
      </a>
      <Header onOpenAbout={() => setAboutOpen(true)} />
      <main id="contenido" className="site-main">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppButton />
      <AboutModal open={aboutOpen} onClose={closeAbout} />
      <Toast />
    </>
  )
}
