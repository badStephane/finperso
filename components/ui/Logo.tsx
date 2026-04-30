'use client'

import Image from 'next/image'

export function Logo({ subtitle }: { subtitle?: string }) {
  return (
    <div
      className="text-center mb-8"
      style={{ animation: 'logoIn 320ms ease-out both' }}
    >
      <div className="flex items-center justify-center gap-3">
        <Image
          src="/icons/icon-192.png"
          alt=""
          width={56}
          height={56}
          priority
          className="rounded-2xl shadow-sm ring-1 ring-black/5"
        />
        <span className="text-3xl font-bold tracking-tight text-[#0F6E56]">
          Finperso
        </span>
      </div>
      {subtitle && (
        <p className="text-sm text-gray-500 mt-3">{subtitle}</p>
      )}
    </div>
  )
}
