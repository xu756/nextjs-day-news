import {
  formatZhDateLabel,
  getBlogTagPageBySlugAndPageParam,
  getBlogTagPageStaticParams,
} from '@/lib/blog'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    tag: string
    page: string
  }>
}

function buildTagPageHref(tag: string, page: number): string {
  const encodedTag = encodeURIComponent(tag)
  if (page <= 1) return `/${encodedTag}`
  return `/${encodedTag}/page/${page}`
}

export function generateStaticParams() {
  return getBlogTagPageStaticParams()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag, page } = await params
  const pageData = getBlogTagPageBySlugAndPageParam(tag, page)

  if (!pageData || pageData.page <= 1) {
    return {
      title: `未找到 | ${SITE_TITLE}`,
    }
  }

  const canonical = `${SITE_URL}/${encodeURIComponent(pageData.slug)}/page/${pageData.page}`

  return {
    title: `#${pageData.tag} 第 ${pageData.page} 页 | ${SITE_TITLE}`,
    description: `标签 #${pageData.tag} 分页`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `#${pageData.tag} 第 ${pageData.page} 页 | ${SITE_TITLE}`,
      description: `标签 #${pageData.tag} 分页`,
      url: canonical,
    },
  }
}

export default async function TagPagedPage({ params }: PageProps) {
  const { tag, page } = await params
  const pageData = getBlogTagPageBySlugAndPageParam(tag, page)

  if (!pageData || pageData.page <= 1) {
    notFound()
  }

  const prevHref = buildTagPageHref(pageData.slug, pageData.page - 1)
  const nextHref =
    pageData.page < pageData.totalPages
      ? buildTagPageHref(pageData.slug, pageData.page + 1)
      : null

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <header className="py-8 sm:py-10">
        <p className="font-mono text-xs text-muted-foreground">
          <Link href="/blog" className="transition hover:text-foreground">
            博客
          </Link>
          <span className="mx-2 text-muted-foreground/40">/</span>
          <Link
            href={`/${encodeURIComponent(pageData.slug)}`}
            className="transition hover:text-foreground"
          >
            #{pageData.tag}
          </Link>
          <span className="mx-2 text-muted-foreground/40">/</span>
          <span>第 {pageData.page} 页</span>
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-5xl">
          #{pageData.tag}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          共 {pageData.totalPosts} 篇文章，第 {pageData.page} / {pageData.totalPages}{' '}
          页
        </p>
      </header>

      <ul className="space-y-4">
        {pageData.posts.map((post) => (
          <li key={`${post.category}-${post.url}`}>
            <article className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
              <p className="font-mono text-xs text-muted-foreground">
                {formatZhDateLabel(post.day)}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-foreground">
                <Link
                  href={`/blog/${encodeURIComponent(post.url)}`}
                  className="transition hover:text-primary"
                >
                  {post.title}
                </Link>
              </h2>
              {post.description ? (
                <p className="mt-2 text-sm text-muted-foreground">{post.description}</p>
              ) : null}
            </article>
          </li>
        ))}
      </ul>

      <nav
        className="mt-6 flex items-center justify-between rounded-2xl border border-border/80 bg-card/90 px-4 py-3 text-sm shadow-sm"
        aria-label="标签分页"
      >
        <Link href={prevHref} className="transition hover:text-foreground">
          ← 上一页
        </Link>
        <span className="font-mono text-xs text-muted-foreground">
          第 {pageData.page} / {pageData.totalPages} 页
        </span>
        {nextHref ? (
          <Link href={nextHref} className="transition hover:text-foreground">
            下一页 →
          </Link>
        ) : (
          <span className="text-muted-foreground/40">下一页 →</span>
        )}
      </nav>
    </main>
  )
}
