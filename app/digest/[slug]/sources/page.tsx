import { RevealOnScroll } from '@/components/RevealOnScroll'
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

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getDigestDaySlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
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
  delayBase?: number
}) {
  return (
    <RevealOnScroll
      className="mb-10 will-change-transform"
      delayMs={props.delayBase ?? 0}
    >
      <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-4 shadow-sm backdrop-blur sm:p-6">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {props.title}
        </h2>

        <div className="space-y-3">
          {props.items.map((item, index) => (
            <RevealOnScroll
              key={item.url}
              className="will-change-transform"
              delayMs={Math.min(index * 45, 540)}
            >
              <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:shadow-md">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-base font-medium leading-7 text-slate-900 transition hover:text-emerald-700"
                >
                  {item.title}
                </a>

                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {item.sourceNames.map((name) => (
                    <span
                      key={`${item.url}-${name}`}
                      className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500"
                    >
                      {name}
                    </span>
                  ))}

                  {item.sourceTypes.map((type) => (
                    <span
                      key={`${item.url}-${type}`}
                      className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500"
                    >
                      {type}
                    </span>
                  ))}

                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-[11px] text-slate-500">
                    {item.mentions}
                  </span>

                  {typeof item.score === 'number' ? (
                    <span className="ml-auto rounded-md bg-emerald-50 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-700">
                      {item.score.toFixed(2)}
                    </span>
                  ) : null}
                </div>
              </article>
            </RevealOnScroll>
          ))}
        </div>
      </section>
    </RevealOnScroll>
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
      <RevealOnScroll className="will-change-transform" delayMs={20}>
        <section className="py-8 text-center sm:py-12">
          <Link
            href={`/digest/${encodeURIComponent(digestDay.day)}`}
            className="text-sm text-slate-500 transition hover:text-slate-800"
          >
            ← 返回文章
          </Link>

          <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-4xl">
            {formatZhDateLabel(digestDay.day)}信息源
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            从 {sources.candidateCount} 条资讯中选出 {sources.featured.length}{' '}
            条重点报道
          </p>
        </section>
      </RevealOnScroll>

      <SourceSection title="重点关注" items={sources.featured} delayBase={80} />
      <SourceSection title="候选资讯" items={sources.all} delayBase={140} />
    </main>
  )
}
