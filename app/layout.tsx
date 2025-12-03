// app/layout.tsx

import { NotificationProvider } from '@/components/Notification';
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hotel Mutiara Balige',
  description: 'Hotel nyaman dengan pemandangan Danau Toba',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className={inter.className}>
        {/* HANYA SATU KALI, DAN children DI DALAMNYA! */}
        <NotificationProvider>
          {children}
        </NotificationProvider>
      </body>
    </html>
  );
}