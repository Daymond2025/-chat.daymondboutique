import type { Metadata, Viewport } from 'next';
import './globals.css';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

export const metadata: Metadata = {
  title: 'WhatsApp Shop',
  description: 'Commandez facilement vos produits via WhatsApp Shop.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'WhatsApp Shop',
  },
  icons: {
    icon:  '/icons/icon.png',
    apple: '/icons/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#25d366',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#e5ddd5] antialiased">
        <ServiceWorkerRegistrar />
        {children}
      </body>
    </html>
  );
}
