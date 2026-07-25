import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: 'Recovery Platform — AI-Powered Crisis & Prevention',
  description:
    'A multi-modal, GenAI-powered recovery and prevention platform for individuals navigating substance use disorders and their caregivers.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#fdf8f3',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // No "dark" class — this is a warm LIGHT theme
    <html lang="en" className="h-full">
      <body
        className={`${inter.className} min-h-full overflow-x-hidden`}
        style={{ backgroundColor: '#fdf8f3', color: '#2d1f14' }}
      >
        {children}
      </body>
    </html>
  );
}
