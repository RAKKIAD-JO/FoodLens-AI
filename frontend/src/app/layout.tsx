import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Providers from '../components/Providers';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'FoodLens AI - เครื่องมือวิเคราะห์แคลอรีอัจฉริยะ',
  description: 'ติดตามเป้าหมายการกินประจำวัน ประเมินขนาดจานอาหารและสารอาหารหลัก และสแกนฉลากโภชนาการได้ทันทีด้วย Google Gemini AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-slate-50 text-slate-900`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
