'use client'

import Image from 'next/image'

interface AppSplashProps {
  /** Apply a fade-out transition before unmount */
  fadingOut?: boolean
}

export function AppSplash({ fadingOut = false }: AppSplashProps) {
  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0F6E56] transition-opacity duration-300 ease-out"
      style={{
        opacity: fadingOut ? 0 : 1,
        pointerEvents: fadingOut ? 'none' : 'auto',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
      aria-busy="true"
      aria-label="Chargement de l'application"
      role="status"
    >
      <div
        className="flex flex-col items-center"
        style={{ animation: 'logoIn 380ms cubic-bezier(0.16, 1, 0.3, 1) both' }}
      >
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={88}
          height={88}
          priority
          className="rounded-3xl shadow-xl ring-1 ring-white/10"
        />
        <span className="mt-5 text-2xl font-bold tracking-tight text-white">
          Finperso
        </span>
        <div className="mt-8 flex gap-1.5" aria-hidden="true">
          <span
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            style={{ animation: 'splashDot 1.2s ease-in-out infinite', animationDelay: '0ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            style={{ animation: 'splashDot 1.2s ease-in-out infinite', animationDelay: '160ms' }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-white/60"
            style={{ animation: 'splashDot 1.2s ease-in-out infinite', animationDelay: '320ms' }}
          />
        </div>
      </div>
    </div>
  )
}
