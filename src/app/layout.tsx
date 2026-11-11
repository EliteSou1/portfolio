import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PortfolioProvider } from '@/context/PortfolioContext';

export const metadata: Metadata = {
  metadataBase: new URL('https://saulrendon.dev'),
  alternates: {
    canonical: '/',
  },
  title: 'Saúl Alejandro Rendón Cocom — Software Developer & Systems Architect',
  description:
    'Portfolio tecnológico cinemático en 3D. Especialista en arquitecturas desacopladas, modernización de operaciones en campo, ERP Headless y resiliencia de infraestructura Zero Trust.',
  keywords: [
    'Saúl Alejandro Rendón Cocom',
    'Software Developer',
    'Systems Architect',
    'Cancún',
    'Odoo 19',
    'Node.js',
    'React',
    'Vue 3',
    'Flutter',
    'Docker',
    'Zero Trust',
    'PostgreSQL',
    'Linux',
  ],
  authors: [{ name: 'Saúl Alejandro Rendón Cocom' }],
  creator: 'Saúl Alejandro Rendón Cocom',
  openGraph: {
    title: 'Saúl Alejandro Rendón Cocom — Software Developer & Systems Architect',
    description:
      'Exploración espacial y portfolio interactivo 3D. Sistemas de alta concurrencia, aplicaciones móviles y redes privadas.',
    type: 'website',
    locale: 'es_MX',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#03070a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        suppressHydrationWarning
        className="bg-[#03070a] text-[#d6e8ee] antialiased overflow-x-hidden selection:bg-[#1ad1d7] selection:text-[#03070a]"
      >
        <PortfolioProvider>
          {children}
        </PortfolioProvider>
      </body>
    </html>
  );
}
