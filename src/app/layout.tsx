import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daymond — Commandez en direct',
  description: 'Discutez avec un agent Daymond pour trouver votre ordinateur idéal.',
};

export const viewport: Viewport = {
  themeColor: '#2d5a3d',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="bg-[#e5ddd5] antialiased">{children}</body>
    </html>
  );
}