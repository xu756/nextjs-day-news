'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { BookOpen, QrCode, Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [showQr, setShowQr] = useState(false)

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-5 sm:px-6 lg:px-8">
      <Card className="relative border border-border/80 bg-card/90 px-4 py-3 shadow-lg shadow-primary/8 backdrop-blur sm:px-5">
        <nav className="flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/digest"
            className="flex items-center gap-2 rounded-lg outline-none transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="text-xl font-semibold tracking-tight text-foreground">
              AI资讯速览
            </span>
            <Badge variant="secondary" className="tracking-wide">
              Daily
            </Badge>
          </Link>

          <ul className="flex flex-wrap items-center gap-1 sm:gap-2">
            <li>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/digest">
                  <Search className="size-3.5" />
                  日报
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/blog">
                  <BookOpen className="size-3.5" />
                  博客
                </Link>
              </Button>
            </li>
            <li>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/about">方法论</Link>
              </Button>
            </li>
            <li className="relative">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowQr((open) => !open)}
              >
                <QrCode className="size-3.5" />
                公众号
              </Button>

              {showQr ? (
                <div className="absolute right-0 top-11 z-50 w-44">
                  <Card
                    role="dialog"
                    aria-label="公众号二维码"
                    className="gap-3 rounded-xl border-border/90 p-3 text-center shadow-xl"
                  >
                    <p className="text-xs text-muted-foreground">微信扫码关注</p>
                    <Separator />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      className="mx-auto h-32 w-32 rounded-md object-contain"
                      src="/globe.svg"
                      alt="公众号二维码"
                    />
                  </Card>
                </div>
              ) : null}
            </li>
          </ul>
        </nav>
      </Card>
    </header>
  )
}
