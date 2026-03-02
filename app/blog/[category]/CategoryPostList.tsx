import type { BlogCategoryPage } from '@/lib/blog'
import { formatZhDateLabel } from '@/lib/blog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
            <article className="rounded-2xl border border-border/80 bg-card/90 p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-5">
              <Badge variant="outline" className="font-mono">
                {formatZhDateLabel(post.day)}
              </Badge>
              <h2 className="mt-2 text-xl font-semibold text-foreground">
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

      {pageData.totalPages > 1 ? (
        <nav
          className="mt-6 flex items-center justify-between rounded-2xl border border-border/80 bg-card/90 px-4 py-3 text-sm shadow-sm"
          aria-label="分页"
        >
          {prevHref ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={prevHref}>← 上一页</Link>
            </Button>
          ) : (
            <span className="text-muted-foreground/40">← 上一页</span>
          )}

          <span className="font-mono text-xs text-muted-foreground">
            第 {pageData.page} / {pageData.totalPages} 页
          </span>

          {nextHref ? (
            <Button asChild variant="ghost" size="sm">
              <Link href={nextHref}>下一页 →</Link>
            </Button>
          ) : (
            <span className="text-muted-foreground/40">下一页 →</span>
          )}
        </nav>
      ) : null}
    </>
  )
}
