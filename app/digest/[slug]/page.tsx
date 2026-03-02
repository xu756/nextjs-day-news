import type { DigestPost } from '@/lib/digest'
import CodeBlockPre from '@/components/CodeBlockPre'
import {
  findDigestDayBySlug,
  formatZhDateLabel,
  getDayConfig,
  getDigestDaySlugs,
  getDigestDays,
  getSourcesForDay,
} from '@/lib/digest'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import { MDXContent } from '@content-collections/mdx/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const DEFAULT_OG_IMAGE = '/images/lagoon-1.svg'

type SectionSource = {
  title: string
  url: string
  domain: string
}

type PageProps = {
  params: Promise<{ slug: string }>
}

function domainFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function buildSectionSources(post: DigestPost): SectionSource[] {
  if (post.sources?.length) {
    return post.sources.map((source) => ({
      title: source.name,
      url: source.url,
      domain: domainFromUrl(source.url),
    }))
  }

  return post.sourceUrls.map((url) => ({
    title: domainFromUrl(url),
    url,
    domain: domainFromUrl(url),
  }))
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

  const day = digestDay.day
  const posts = digestDay.posts
  const lead = digestDay.lead
  const title =
    posts
      .slice(0, 2)
      .map((post) => post.title)
      .join('，') || 'Digest Story'

  const description = lead?.description ?? `${day} AI资讯速览`
  const image = lead?.heroImage ?? DEFAULT_OG_IMAGE
  const canonicalSlug = encodeURIComponent(slug)
  const canonical = `${SITE_URL}/digest/${canonicalSlug}`

  return {
    title: `${title} | ${SITE_TITLE}`,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title,
      description,
      url: canonical,
      images: [image.startsWith('http') ? image : `${SITE_URL}${image}`],
    },
  }
}

export default async function DigestPostPage({ params }: PageProps) {
  const { slug } = await params
  const digestDay = findDigestDayBySlug(slug)

  if (!digestDay) {
    notFound()
  }

  const sourceSummary = getSourcesForDay(digestDay.day, digestDay.posts)
  const dayConfig = getDayConfig(digestDay.day)

  const featuredRemaining = sourceSummary.featured.slice(3)
  const related = getDigestDays()
    .filter((item) => item.day !== digestDay.day)
    .slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <header className="py-8 text-center sm:py-10">
        <p className="inline-flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-muted-foreground">
          <time>{formatZhDateLabel(digestDay.day)}</time>
          <span className="text-muted-foreground/40">|</span>
          <Link
            href={`/digest/${encodeURIComponent(digestDay.day)}/sources`}
            className="transition hover:text-foreground"
          >
            从 {sourceSummary.candidateCount} 条资讯中筛选
          </Link>
        </p>

        <h1 className="mx-auto mt-3 max-w-4xl text-balance text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
          {digestDay.posts.slice(0, 2).map((post, index) => (
            <span key={index}>{post.title}</span>
          ))}
        </h1>

        <ol className="mx-auto mt-4 max-w-3xl text-left text-sm leading-7 text-muted-foreground sm:text-base">
          {digestDay.posts.slice(0, 3).map((post, index) => (
            <li key={post.slug + post.title} className="inline">
              {index > 0 ? <span className="text-muted-foreground/40"> ｜ </span> : null}
              {post.title}
            </li>
          ))}
        </ol>

        <div className="mx-auto mt-5 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-chart-2" />
      </header>

      <section className="mb-6 overflow-hidden rounded-3xl border border-border/80 bg-card/90 shadow-sm">
        {dayConfig?.coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={dayConfig.coverImage}
            alt={
              dayConfig.coverAlt || `${formatZhDateLabel(digestDay.day)} 封面图`
            }
            className="block aspect-[16/7] w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-[16/7] items-center justify-center bg-gradient-to-br from-muted to-accent/70">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">
                Cover Slot
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                在 data.yaml 设置 coverImage 后会显示当天封面
              </p>
            </div>
          </div>
        )}
      </section>

      <main className="space-y-5">
        {digestDay.posts.map((post, index) => {
          const sectionSources = buildSectionSources(post)
          return (
            <article
              key={post.slug + post.title}
              className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:p-7"
            >
              <h2 className="flex items-start gap-3 text-xl font-semibold text-foreground sm:text-2xl">
                <span className="mt-0.5 w-10 shrink-0 font-mono text-2xl text-primary sm:text-3xl">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span>{post.title}</span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-foreground/90 sm:text-base">
                <strong className="mr-1 text-foreground">
                  为什么值得关注：
                </strong>
                {post.why ?? '该条目由来源权重、时效性与多源交叉评分综合入选。'}
              </p>

              <div className="prose prose-slate mt-4 max-w-none prose-headings:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80">
                <MDXContent code={post.mdx} components={{ pre: CodeBlockPre }} />
              </div>

              {sectionSources.length > 0 ? (
                <div className="mt-4 rounded-2xl border border-border/80 bg-muted/40 p-4">
                  <Badge variant="secondary" className="mb-2">
                    来源
                  </Badge>
                  <div className="space-y-1.5">
                    {sectionSources.map((source) => (
                      <a
                        key={`${post.slug}-${source.url}`}
                        href={source.url}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground transition hover:text-foreground"
                      >
                        <span>{source.title}</span>
                        <span className="rounded-md bg-background px-2 py-0.5 font-mono text-[11px] text-muted-foreground">
                          {source.domain}
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}

        {featuredRemaining.length > 0 ? (
          <section className="rounded-3xl border border-border/80 bg-card/90 p-4 shadow-sm sm:p-6">
            {featuredRemaining.map((item, idx) => (
              <article
                key={item.url}
                className="flex gap-3 border-t border-border/60 py-3 first:border-t-0"
              >
                <span className="w-8 shrink-0 font-mono text-2xl text-muted-foreground/50">
                  {String(idx + 4).padStart(2, '0')}
                </span>

                <div className="min-w-0">
                  <p className="text-base font-semibold leading-7 text-foreground">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="transition hover:text-primary"
                    >
                      {item.title}
                    </a>
                  </p>

                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.sourceNames.join(' / ')}
                    {' · '}
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="rounded bg-muted px-2 py-0.5 font-mono text-[11px] text-muted-foreground transition hover:text-foreground"
                    >
                      {domainFromUrl(item.url)}
                    </a>
                  </p>
                </div>
              </article>
            ))}
          </section>
        ) : null}
      </main>

      <section
        className="mt-8 flex flex-wrap items-center gap-2 border-t border-border/80 pt-5"
        aria-label="分享"
      >
        <span className="mr-1 text-xs text-muted-foreground">分享</span>
        {['微信', '微博', 'X', '复制链接'].map((label) => (
          <Button key={label} type="button" variant="outline" size="xs">
            {label}
          </Button>
        ))}
      </section>

      <nav className="mt-8" aria-label="继续阅读">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          继续阅读
        </h2>

        <div className="space-y-2">
          {related.map((day) => (
            <Link
              key={day.day}
              href={`/digest/${encodeURIComponent(day.day)}`}
              className="flex flex-col gap-1 rounded-2xl border border-border/80 bg-card/90 px-4 py-3 shadow-sm transition hover:border-primary/30 hover:bg-accent/40"
            >
              <span className="font-mono text-xs text-muted-foreground">
                {formatZhDateLabel(day.day)}
              </span>
              <span className="text-sm text-foreground/90">
                {day.posts[0]?.title}
              </span>
            </Link>
          ))}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          <Link href="/digest" className="transition hover:text-foreground">
            查看全部存档 →
          </Link>
        </p>
      </nav>
    </div>
  )
}
