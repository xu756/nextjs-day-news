'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

type DigestDayCardProps = {
  dayLabel: string
  slug: string
  titles: string[]
  candidateCount: number
  featured?: boolean
}

function SectionTitles(props: { titles: string[] }) {
  return (
    <ol className="space-y-2">
      {props.titles.map((title, index) => {
        const num = String(index + 1).padStart(2, '0')
        const isLead = index === 0

        return (
          <li
            key={`${num}-${title}`}
            className={`flex items-start gap-3 ${isLead ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <span
              className={`mt-0.5 w-7 shrink-0 font-mono text-sm font-semibold tracking-wide ${
                isLead ? 'text-primary' : 'text-muted-foreground/60'
              }`}
            >
              {num}
            </span>
            <span
              className={
                isLead
                  ? 'text-lg leading-7 sm:text-[1.3rem]'
                  : 'text-base leading-7 text-muted-foreground'
              }
            >
              {title}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function DigestDayCard(props: DigestDayCardProps) {
  const router = useRouter()

  const openDigest = () => {
    router.push(`/digest/${encodeURIComponent(props.slug)}`)
  }

  return (
    <Card
      role="link"
      tabIndex={0}
      aria-label={`${props.dayLabel} 资讯卡片`}
      onClick={openDigest}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openDigest()
        }
      }}
      className={`group cursor-pointer gap-0 overflow-hidden rounded-3xl border border-border/80 bg-card/90 py-0 transition duration-200 hover:-translate-y-0.5 hover:shadow-xl ${
        props.featured
          ? 'bg-[linear-gradient(120deg,color-mix(in_oklab,var(--color-primary)_10%,transparent),transparent)]'
          : ''
      }`}
    >
      <CardHeader className="gap-3 border-b border-border/60 px-6 pb-4 pt-5 sm:px-8">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-xs tracking-wide text-muted-foreground">
            {props.dayLabel}
          </p>
          {props.featured ? <Badge>今日精选</Badge> : <Badge variant="secondary">存档</Badge>}
        </div>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Daily AI Digest
        </CardTitle>
      </CardHeader>

      <CardContent className="px-6 pb-5 pt-4 sm:px-8">
        <SectionTitles titles={props.titles} />
      </CardContent>

      <CardFooter className="flex flex-wrap items-center justify-between gap-2 border-t border-border/60 px-6 pb-5 pt-4 sm:px-8">
        <Button variant="link" className="h-auto px-0 text-sm font-semibold">
          阅读全文 →
        </Button>
        <Link
          href={`/digest/${encodeURIComponent(props.slug)}/sources`}
          onClick={(event) => event.stopPropagation()}
          className="font-mono text-xs text-muted-foreground transition hover:text-foreground"
        >
          从 {props.candidateCount} 条资讯中筛选
        </Link>
      </CardFooter>
    </Card>
  )
}
