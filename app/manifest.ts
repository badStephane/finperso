import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finperso',
    short_name: 'Finperso',
    description: 'Gérez vos finances personnelles',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0F6E56',
    orientation: 'portrait',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
