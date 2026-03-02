import {
  formatZhDateLabel,
  getBlogCategorySummaries,
} from '@/lib/blog'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const canonical = `${SITE_URL}/blog`

export const metadata: Metadata = {
  title: `博客 | ${SITE_TITLE}`,
  description: '按分类整理的博客文章。',
  alternates: {
    canonical,
  },
  openGraph: {
    title: `博客 | ${SITE_TITLE}`,
    description: '按分类整理的博客文章。',
    url: canonical,
  },
}

export default function BlogIndexPage() {
  const categories = getBlogCategorySummaries(10)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <section className="py-10 text-center sm:py-14">
        <Badge variant="secondary" className="mb-4">
          Knowledge Base
        </Badge>
        <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">博客</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">只显示前 10 个类目</p>
      </section>

      {categories.length === 0 ? (
        <Card className="rounded-2xl border-border/80 bg-card/90">
          <CardContent className="p-6 text-muted-foreground">
            暂无博客内容。请在{' '}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
              content/_post/&lt;file&gt;.mdx
            </code>{' '}
            新建文章。
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {categories.map((item) => (
            <li key={item.category}>
              <article className="h-full rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
                <Badge variant="outline" className="font-mono">
                  {item.totalPosts} 篇
                </Badge>
                <h2 className="mt-2 text-2xl font-semibold text-foreground">
                  <Link
                    href={`/blog/${encodeURIComponent(item.category)}`}
                    className="inline-flex items-center gap-1.5 transition hover:text-primary"
                  >
                    {item.title}
                    <ArrowRight className="size-4" />
                  </Link>
                </h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  最近更新：{formatZhDateLabel(item.latestPost.day)}
                </p>
                <p className="mt-1 text-sm text-foreground/90">{item.latestPost.title}</p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
