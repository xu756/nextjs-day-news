import {
  formatZhDateLabel,
  getBlogTagPageBySlug,
  getBlogTagStaticParams,
} from '@/lib/blog'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    tag: string
  }>
}

function buildTagPageHref(tag: string, page: number): string {
  const encodedTag = encodeURIComponent(tag)
  if (page <= 1) return `/${encodedTag}`
  return `/${encodedTag}/page/${page}`
}

export function generateStaticParams() {
  return getBlogTagStaticParams()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { tag } = await params
  const pageData = getBlogTagPageBySlug(tag, 1)

  if (!pageData) {
    return {
      title: `未找到 | ${SITE_TITLE}`,
    }
  }

  const canonical = `${SITE_URL}/${encodeURIComponent(pageData.slug)}`

  return {
    title: `#${pageData.tag} | ${SITE_TITLE}`,
    description: `标签 #${pageData.tag} 下共 ${pageData.totalPosts} 篇文章`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `#${pageData.tag} | ${SITE_TITLE}`,
      description: `标签 #${pageData.tag} 下共 ${pageData.totalPosts} 篇文章`,
      url: canonical,
    },
  }
}

export default async function TagPage({ params }: PageProps) {
  const { tag } = await params
  const pageData = getBlogTagPageBySlug(tag, 1)

  if (!pageData) {
    notFound()
  }

  const nextHref =
    pageData.page < pageData.totalPages
      ? buildTagPageHref(pageData.slug, pageData.page + 1)
      : null

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <header className="py-8 sm:py-10">
        <p className="font-mono text-xs text-slate-500">
          <Link href="/blog" className="transition hover:text-slate-800">
            博客
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span>#{pageData.tag}</span>
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-5xl">
          #{pageData.tag}
        </h1>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          共 {pageData.totalPosts} 篇文章
        </p>
      </header>

      <ul className="space-y-4">
        {pageData.posts.map((post) => (
          <li key={`${post.category}-${post.url}`}>
            <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <p className="font-mono text-xs text-slate-400">
                {formatZhDateLabel(post.day)}
              </p>
              <h2 className="mt-1 text-xl font-semibold text-slate-900">
                <Link
                  href={`/blog/${encodeURIComponent(post.url)}`}
                  className="transition hover:text-emerald-700"
                >
                  {post.title}
                </Link>
              </h2>
              {post.description ? (
                <p className="mt-2 text-sm text-slate-600">{post.description}</p>
              ) : null}
            </article>
          </li>
        ))}
      </ul>

      {pageData.totalPages > 1 ? (
        <nav
          className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm"
          aria-label="标签分页"
        >
          <span className="text-slate-300">← 上一页</span>
          <span className="font-mono text-xs text-slate-500">
            第 {pageData.page} / {pageData.totalPages} 页
          </span>
          {nextHref ? (
            <Link href={nextHref} className="transition hover:text-slate-900">
              下一页 →
            </Link>
          ) : (
            <span className="text-slate-300">下一页 →</span>
          )}
        </nav>
      ) : null}
    </main>
  )
}
