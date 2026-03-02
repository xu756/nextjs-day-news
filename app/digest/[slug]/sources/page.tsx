import {
  findDigestDayBySlug,
  formatZhDateLabel,
  getDigestDaySlugs,
  getSourcesForDay,
} from '@/lib/digest'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getDigestDaySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params
  const digestDay = findDigestDayBySlug(slug)

  if (!digestDay) {
    return {
      title: `未找到 | ${SITE_TITLE}`,
    }
  }

  const title = `${formatZhDateLabel(digestDay.day)}信息源`
  const canonical = `${SITE_URL}/digest/${encodeURIComponent(slug)}/sources`

  return {
    title: `${title} | ${SITE_TITLE}`,
    alternates: {
      canonical,
    },
  }
}

function SourceSection(props: {
  title: string
  items: Array<{
    title: string
    url: string
    sourceNames: string[]
    sourceTypes: string[]
    score?: number
    mentions: number
  }>
}) {
  return (
    <section className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm backdrop-blur sm:p-6">
      <Badge className="mb-4">{props.title}</Badge>

      <div className="space-y-3">
        {props.items.map((item) => (
          <article
            key={item.url}
            className="rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
          >
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="text-base font-medium leading-7 text-foreground transition hover:text-primary"
            >
              {item.title}
            </a>

            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {item.sourceNames.map((name) => (
                <span
                  key={`${item.url}-${name}`}
                  className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {name}
                </span>
              ))}

              {item.sourceTypes.map((type) => (
                <span
                  key={`${item.url}-${type}`}
                  className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground"
                >
                  {type}
                </span>
              ))}

              <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                {item.mentions}
              </span>

              {typeof item.score === 'number' ? (
                <span className="ml-auto rounded-md bg-primary/12 px-2 py-0.5 font-mono text-[11px] font-semibold text-primary">
                  {item.score.toFixed(2)}
                </span>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default async function DigestSourcesPage({ params }: PageProps) {
  const { slug } = await params
  const digestDay = findDigestDayBySlug(slug)

  if (!digestDay) {
    notFound()
  }

  const sources = getSourcesForDay(digestDay.day, digestDay.posts)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <section className="py-8 text-center sm:py-12">
        <Link
          href={`/digest/${encodeURIComponent(digestDay.day)}`}
          className="text-sm text-muted-foreground transition hover:text-foreground"
        >
          ← 返回文章
        </Link>

        <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
          {formatZhDateLabel(digestDay.day)}信息源
        </h1>

        <p className="mt-2 text-sm text-muted-foreground">
          从 {sources.candidateCount} 条资讯中选出 {sources.featured.length}{' '}
          条重点报道
        </p>
      </section>

      <SourceSection title="重点关注" items={sources.featured} />
      <SourceSection title="候选资讯" items={sources.all} />
    </main>
  )
}
