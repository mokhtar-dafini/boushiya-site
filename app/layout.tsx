import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'حجز حفل البوشية - هيبة الذهب',
  description: 'أمسية ثقافية وفنية نسائية استثنائية تجمع الأصالة السعودية بالفخامة العصرية في ليلة واحدة. اختاري باقتكِ واطلبي تذكرتكِ الآن.',
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#070504',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body>{children}</body>
    </html>
  );
}
