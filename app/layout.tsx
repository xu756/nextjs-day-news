import Footer from '@/components/Footer'
import Header from '@/components/Header'
import { SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import { Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google'
import './globals.css'

const bodyFont = Noto_Sans_SC({
  subsets: ['latin'],
  variable: '--font-body',
})

const headingFont = Noto_Serif_SC({
  subsets: ['latin'],
  variable: '--font-heading',
})

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
    <html lang="zh-CN" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body className="antialiased">
        <div className="relative min-h-screen bg-[radial-gradient(circle_at_10%_0%,_color-mix(in_oklab,var(--primary)_10%,transparent)_0%,transparent_50%),radial-gradient(circle_at_90%_5%,_color-mix(in_oklab,var(--chart-2)_12%,transparent)_0%,transparent_44%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_84%,white)_0%,var(--background)_100%)] text-foreground">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,color-mix(in_oklab,var(--border)_45%,transparent)_1px,transparent_1px),linear-gradient(to_bottom,color-mix(in_oklab,var(--border)_35%,transparent)_1px,transparent_1px)] bg-[size:36px_36px] opacity-[0.16]"
          />
          <div className="relative flex min-h-screen flex-col">
            <Header />
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </div>
      </body>
    </html>
  )
}
