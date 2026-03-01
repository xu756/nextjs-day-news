import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_TITLE}`,
  },
  description: SITE_DESCRIPTION,
  openGraph: {
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_TITLE,
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body>
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#ecfdf5_0%,_#f5f5f4_38%,_#f5f5f4_100%)] text-slate-700 antialiased">
          <Header />
          {children}
          <Footer />
        </div>
      </body>
    </html>
  )
}
