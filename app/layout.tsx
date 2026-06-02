import type { Metadata } from 'next';
import './globals.css';
import ThemeProvider from '@/lib/ThemeProvider';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';

export const metadata: Metadata = {
  title: '数据诗意 DataPoetry',
  description: '看世界、看作品、看书 —— 你的自我成长空间',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-screen bg-[var(--color-bg-secondary)] text-[var(--color-text)]">
        <ThemeProvider>
          <div className="flex min-h-screen">
            {/* Desktop sidebar */}
            <Sidebar />
            {/* Main area */}
            <div className="flex-1 min-w-0 flex flex-col">
              {/* Mobile header only */}
              <Header />
              <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-10 py-6 sm:py-8 pb-[112px] sm:pb-[72px]">
                {children}
              </main>
            </div>
          </div>
          <MobileNav />
        </ThemeProvider>
      </body>
    </html>
  );
}
