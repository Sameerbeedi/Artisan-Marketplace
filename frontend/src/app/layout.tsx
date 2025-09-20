import type { Metadata } from 'next';
import { Alegreya, Belleza } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '../components/layout/header';
import { Footer } from '../components/layout/footer';
import { Toaster } from '../components/ui/toaster';
import Script from 'next/script'; // ✅ Next.js Script for <model-viewer>

const belleza = Belleza({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-belleza',
});

const alegreya = Alegreya({
  subsets: ['latin'],
  variable: '--font-alegreya',
});

export const metadata: Metadata = {
  title: 'kalaaVerse - An AI Marketplace for Indian Artisans',
  description:
    'An AI driven marketplace for local Indian artisans to improve their digital presence and sell their local products to the contemporary audience.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Load Google <model-viewer> script globally */}
        <Script
          type="module"
          src="https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js"
          strategy="beforeInteractive"
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          belleza.variable,
          alegreya.variable
        )}
      >
        <div className="relative flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Toaster />
      </body>
    </html>
  );
}
