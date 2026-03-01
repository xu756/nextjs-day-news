import type { BlogCategoryPage } from '@/lib/blog'
import { formatZhDateLabel } from '@/lib/blog'
import Link from 'next/link'

type CategoryPostListProps = {
  pageData: BlogCategoryPage
  layout?: string
}

function buildCategoryPageHref(category: string, page: number): string {
  const encodedCategory = encodeURIComponent(category)
  if (page <= 1) return `/blog/${encodedCategory}`
  return `/blog/${encodedCategory}/page/${page}`
}

export default function CategoryPostList({
  pageData,
  layout = 'default',
}: CategoryPostListProps) {
  const prevHref =
    pageData.page > 1
      ? buildCategoryPageHref(pageData.category, pageData.page - 1)
      : null
  const nextHref =
    pageData.page < pageData.totalPages
      ? buildCategoryPageHref(pageData.category, pageData.page + 1)
      : null
  const listClassName =
    layout === 'grid' ? 'grid gap-4 sm:grid-cols-2' : 'space-y-4'

  return (
    <>
      <ul className={listClassName}>
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
          aria-label="分页"
        >
          {prevHref ? (
            <Link href={prevHref} className="transition hover:text-slate-900">
              ← 上一页
            </Link>
          ) : (
            <span className="text-slate-300">← 上一页</span>
          )}

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
    </>
  )
}
