import {
  formatZhDateLabel,
  getBlogCategorySummaries,
} from '@/lib/blog'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'

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
        <h1 className="font-serif text-4xl font-bold text-slate-900 sm:text-5xl">
          博客
        </h1>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          只显示前 10 个类目
        </p>
      </section>

      {categories.length === 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          暂无博客内容。请在{' '}
          <code className="rounded bg-slate-100 px-1.5 py-0.5">
            content/_post/&lt;file&gt;.mdx
          </code>{' '}
          新建文章。
        </section>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {categories.map((item) => (
            <li key={item.category}>
              <article className="h-full rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                <p className="font-mono text-xs text-slate-400">
                  {item.totalPosts} 篇
                </p>
                <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                  <Link
                    href={`/blog/${encodeURIComponent(item.category)}`}
                    className="transition hover:text-emerald-700"
                  >
                    {item.title}
                  </Link>
                </h2>
                <p className="mt-3 text-sm text-slate-600">
                  最近更新：{formatZhDateLabel(item.latestPost.day)}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {item.latestPost.title}
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}
