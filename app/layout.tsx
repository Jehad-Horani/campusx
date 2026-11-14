import type {Metadata, Viewport} from 'next';
import './globals.css'; // Global styles
import {Providers} from '@/components/Providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#080B14',
};

export const metadata: Metadata = {
  title: 'CampusX — Smart University Platform | ASU',
  description: 'Next-generation smart university ecosystem for Applied Science Private University (ASU). Campus Mode, Offline-first academic tools, AI course recommendations, and campus reporting.',
  icons: {
    icon: [{ url: '/assets/aistudio/LOGO_bc48159f.png', type: 'image/png' }],
    shortcut: ['/assets/aistudio/LOGO_bc48159f.png'],
    apple: ['/assets/aistudio/LOGO_bc48159f.png'],
  },
  openGraph: {
    title: 'CampusX — Smart University Platform | ASU',
    description: 'Next-generation smart university ecosystem for Applied Science Private University (ASU).',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CampusX — Smart University Platform | ASU',
    description: 'Next-generation smart university ecosystem for Applied Science Private University (ASU).',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" dir="ltr" className="dark scroll-smooth">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body suppressHydrationWarning className="bg-[#080B14] text-[#F5F7FF] antialiased min-h-screen selection:bg-cyan-500 selection:text-black">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
