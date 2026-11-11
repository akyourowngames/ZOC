import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { Caveat, Cormorant_Garamond, Courier_Prime, Karla } from 'next/font/google';
import './globals.css';
import './components.css';
import './views.css';

const serif = Cormorant_Garamond({
  variable: '--font-serif',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap'
});

const sans = Karla({
  variable: '--font-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const hand = Caveat({
  variable: '--font-hand',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const mono = Courier_Prime({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'SYSTEM — ZCO × IOI Field Journal',
  description:
    'A local-first ZCO and IOI preparation journal. Gates, dungeons, sessions, XP, and workspace evidence recorded on paper.',
  applicationName: 'SYSTEM Field Journal'
};

export const viewport: Viewport = {
  themeColor: '#efe7d5',
  width: 'device-width',
  initialScale: 1
};

const themeScript = `(function(){try{var raw=localStorage.getItem('field-journal-tracker-v1');if(raw){var saved=JSON.parse(raw);if(saved&&saved.settings){document.documentElement.dataset.theme=saved.settings.theme==='night'?'night':'paper';if(saved.settings.reduceMotion){document.documentElement.classList.add('reduce-motion');}}}}catch(error){}})();`;

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en" data-theme="paper" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className={`${serif.variable} ${sans.variable} ${hand.variable} ${mono.variable}`}>
        {children}
      </body>
    </html>
  );
}
