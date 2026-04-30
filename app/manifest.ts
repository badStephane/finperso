import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finperso — Mes finances',
    short_name: 'Finperso',
    description: 'Gérez vos finances personnelles en franc CFA',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#0F6E56',
    theme_color: '#0F6E56',
    orientation: 'portrait',
    lang: 'fr',
    dir: 'ltr',
    categories: ['finance', 'productivity'],
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    shortcuts: [
      {
        name: 'Nouvelle transaction',
        short_name: 'Ajouter',
        description: 'Enregistrer une dépense ou un revenu',
        url: '/transactions/new',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Mon budget',
        short_name: 'Budget',
        url: '/budget',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
  }
}
