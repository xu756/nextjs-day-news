import DigestDayCard from '@/components/DigestDayCard'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  formatZhDateLabel,
  getDigestDays,
  getSourcesForDay,
} from '@/lib/digest'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

const canonical = `${SITE_URL}/digest`
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/lagoon-1.svg`

export const metadata: Metadata = {
  title: SITE_TITLE,
  description: '英文一手信源，每天 3 篇，附可追溯来源链接。',
  alternates: {
    canonical,
  },
  openGraph: {
    title: SITE_TITLE,
    description: '英文一手信源，每天 3 篇，附可追溯来源链接。',
    url: canonical,
    images: [DEFAULT_OG_IMAGE],
  },
}

export default function DigestIndexPage() {
  const digestDays = getDigestDays()
  const featured = digestDays[0]
  const archive = digestDays.slice(1)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <section className="py-10 text-center sm:py-14">
        <Badge variant="secondary" className="mb-4">
          AI Digest · 每日更新
        </Badge>
        <h1 className="mx-auto max-w-3xl text-balance text-4xl font-semibold leading-tight text-foreground sm:text-6xl sm:leading-tight">
          英文一手信源，如实呈现
        </h1>
        <p className="mt-3 text-sm tracking-wide text-muted-foreground sm:text-base">
          不炸裂，不夸张，不接商单
        </p>
      </section>

      {digestDays.length === 0 ? (
        <Card className="rounded-2xl border-border/80 bg-card/90">
          <CardContent className="p-6 text-muted-foreground">
            暂无日报内容。运行{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
              bun run digest:generate
            </code>{' '}
            生成今日内容。
          </CardContent>
        </Card>
      ) : (
        <>
          {featured ? (
            <DigestDayCard
              dayLabel={formatZhDateLabel(featured.day)}
              slug={featured.day}
              titles={featured.posts.slice(0, 3).map((post) => post.title)}
              candidateCount={
                getSourcesForDay(featured.day, featured.posts).candidateCount
              }
              featured
            />
          ) : null}

          <ul className="mt-5 space-y-4">
            {archive.map((digestDay) => (
              <li key={digestDay.day}>
                <DigestDayCard
                  dayLabel={formatZhDateLabel(digestDay.day)}
                  slug={digestDay.day}
                  titles={digestDay.posts.slice(0, 3).map((post) => post.title)}
                  candidateCount={
                    getSourcesForDay(digestDay.day, digestDay.posts)
                      .candidateCount
                  }
                />
              </li>
            ))}
          </ul>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link href="/digest" className="transition hover:text-foreground">
              查看全部存档 →
            </Link>
          </p>
        </>
      )}
    </main>
  )
}
