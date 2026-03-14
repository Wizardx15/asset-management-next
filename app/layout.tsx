import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'react-hot-toast'
import ServiceWorkerRegister from '@/components/ServiceWorkerRegister'

const inter = Inter({ subsets: ['latin'] })

// ========== METADATA untuk SEO ==========
export const metadata: Metadata = {
  title: {
    default: 'Asset Management - Sistem Manajemen Asset Terintegrasi',
    template: '%s | Asset Management'
  },
  description: 'Kelola asset perusahaan dengan mudah. Tracking, monitoring, dan reporting asset secara real-time. Sistem manajemen asset terintegrasi dengan Persona HRIS.',
  keywords: [
    'asset management',
    'manajemen asset',
    'inventory',
    'tracking asset',
    'sistem informasi asset',
    'peminjaman asset',
    'helpdesk',
    'persona hris'
  ],
  authors: [{ name: 'Asset Management', url: 'https://asset-management-next-eight.vercel.app' }],
  creator: 'Asset Management Team',
  publisher: 'Asset Management',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  
  // Open Graph untuk social media
  openGraph: {
    title: 'Asset Management - Sistem Manajemen Asset',
    description: 'Kelola asset perusahaan dengan mudah. Tracking, monitoring, dan reporting asset secara real-time.',
    url: 'https://asset-management-next-eight.vercel.app',
    siteName: 'Asset Management',
    images: [
      {
        url: 'https://asset-management-next-eight.vercel.app/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Asset Management Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },

  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'Asset Management - Sistem Manajemen Asset',
    description: 'Kelola asset perusahaan dengan mudah. Tracking, monitoring, dan reporting asset secara real-time.',
    images: ['https://asset-management-next-eight.vercel.app/og-image.png'],
    creator: '@assetmanagement',
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/icon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon-57x57.png', sizes: '57x57' },
      { url: '/apple-icon-60x60.png', sizes: '60x60' },
      { url: '/apple-icon-72x72.png', sizes: '72x72' },
      { url: '/apple-icon-76x76.png', sizes: '76x76' },
      { url: '/apple-icon-114x114.png', sizes: '114x114' },
      { url: '/apple-icon-120x120.png', sizes: '120x120' },
      { url: '/apple-icon-144x144.png', sizes: '144x144' },
      { url: '/apple-icon-152x152.png', sizes: '152x152' },
      { url: '/apple-icon-180x180.png', sizes: '180x180' },
    ],
  },

  // Manifest untuk PWA
  manifest: '/manifest.json',

  // Alternate languages
  alternates: {
    canonical: 'https://asset-management-next-eight.vercel.app',
    languages: {
      'id-ID': 'https://asset-management-next-eight.vercel.app',
    },
  },

  // Category
  category: 'technology',
}

// ========== VIEWPORT untuk PWA ==========
export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <head>
        {/* Meta tag tambahan untuk PWA */}
        <meta name="application-name" content="Asset Management" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Asset Management" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* Favicon untuk berbagai platform */}
        <link rel="apple-touch-icon" href="/apple-icon-180x180.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-16x16.png" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#2563eb" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Splash screens untuk iOS */}
        <link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-828x1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1242x2688.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1536x2048.png" media="(min-device-width: 768px) and (max-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-1668x2224.png" media="(min-device-width: 834px) and (max-device-width: 1112px) and (-webkit-min-device-pixel-ratio: 2)" />
        <link rel="apple-touch-startup-image" href="/splash-2048x2732.png" media="(min-device-width: 1024px) and (-webkit-min-device-pixel-ratio: 2)" />
      </head>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
        <ServiceWorkerRegister />
      </body>
    </html>
  )
}