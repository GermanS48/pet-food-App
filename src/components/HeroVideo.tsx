import { useEffect, useRef } from 'react'
import { asset } from '../lib/assets'

interface HeroVideoProps {
  src: string
  poster: string
  className?: string
}

/** Reproduce el video sólo en pantallas grandes y sin movimiento reducido. */
export function HeroVideo({ src, poster, className }: HeroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const smallScreen = window.matchMedia('(max-width: 760px)').matches
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (smallScreen || reducedMotion) return

    if (!('IntersectionObserver' in window)) {
      void video.play().catch(() => {})
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const target = entry.target
          if (!(target instanceof HTMLVideoElement)) continue
          if (entry.isIntersecting) {
            void target.play().catch(() => {})
          } else {
            target.pause()
          }
        }
      },
      { threshold: 0.2 },
    )

    observer.observe(video)
    return () => {
      observer.disconnect()
      video.pause()
    }
  }, [])

  return (
    <video
      ref={videoRef}
      className={className}
      muted
      loop
      playsInline
      preload="none"
      poster={asset(poster)}
      aria-hidden="true"
      tabIndex={-1}
    >
      <source src={asset(src)} type="video/mp4" />
    </video>
  )
}
