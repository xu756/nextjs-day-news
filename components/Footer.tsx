'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useState } from 'react'

export default function Footer() {
  const year = new Date().getFullYear()
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)

  return (
    <footer className="mx-auto mt-12 w-full max-w-5xl px-4 pb-10 sm:px-6 lg:px-8">
      <Card className="gap-0 overflow-hidden border border-border/80 bg-card/90 shadow-lg shadow-primary/7">
        <CardHeader className="gap-3 bg-[linear-gradient(120deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent)] pb-5 text-center">
          <Badge variant="secondary" className="mx-auto">
            Newsletter
          </Badge>
          <CardTitle className="text-2xl font-semibold text-foreground">
            订阅 AI 资讯速览
          </CardTitle>
          <p className="text-sm text-muted-foreground">英文一手信源，AI 行业内参。</p>
        </CardHeader>

        <CardContent className="space-y-4 pb-6 pt-1">
        <form
          className="mx-auto flex w-full max-w-lg flex-col gap-2 sm:flex-row"
          onSubmit={(event) => {
            event.preventDefault()
            setSubmitted(true)
          }}
        >
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(event) => {
              setSubmitted(false)
              setEmail(event.target.value)
            }}
            aria-label="Email"
            required
            className="h-10 flex-1 border-border/90 bg-background"
          />
          <Button type="submit" className="h-10 sm:min-w-24">
            订阅
          </Button>
        </form>

        {submitted ? (
          <p className="text-center text-sm text-primary">已记录，后续可接入订阅服务。</p>
        ) : null}
        <Separator className="my-4" />

        <nav className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs text-muted-foreground">
          <Link href="/digest" className="transition hover:text-foreground">
            存档
          </Link>
          <span>·</span>
          <Link href="/blog" className="transition hover:text-foreground">
            博客
          </Link>
          <span>·</span>
          <span>公众号</span>
          <span>·</span>
          <Link href="/digest" className="transition hover:text-foreground">
            RSS
          </Link>
          <span>·</span>
          <Link href="/about" className="transition hover:text-foreground">
            方法论
          </Link>
          <span>·</span>
          <Link href="/digest" className="transition hover:text-foreground">
            更新日志
          </Link>
        </nav>
        <p className="text-center text-xs text-muted-foreground">© {year} AI资讯速览</p>
        </CardContent>
      </Card>
    </footer>
  )
}
