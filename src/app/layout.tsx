import type { Metadata } from 'next';
import './globals.css';
import AppLayout from '@/components/layout/AppLayout';

export const metadata: Metadata = {
  title: 'Apotek POS — Sistem Kasir & Manajemen Apotek',
  description: 'Aplikasi Web POS terintegrasi untuk kasir, hierarki satuan obat, pergudangan, dan pengingat kedaluwarsa.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
