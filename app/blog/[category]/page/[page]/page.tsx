import CategoryPostList from '../../CategoryPostList'
import {
  findBlogCategoryBySlug,
  getBlogCategoryPageBySlugAndPageParam,
  getBlogCategoryPageStaticParams,
} from '@/lib/blog'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    category: string
    page: string
  }>
}

export function generateStaticParams() {
  return getBlogCategoryPageStaticParams()
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category, page } = await params
  const group = findBlogCategoryBySlug(category)

  if (!group) {
    return {
      title: `未找到 | ${SITE_TITLE}`,
    }
  }

  const canonical = `${SITE_URL}/blog/${encodeURIComponent(group.category)}/page/${encodeURIComponent(page)}`
  const title = group.config.title ?? group.category

  return {
    title: `${title} 第 ${page} 页 | ${SITE_TITLE}`,
    description: `${title} 分类文章分页`,
    alternates: {
      canonical,
    },
    openGraph: {
      title: `${title} 第 ${page} 页 | ${SITE_TITLE}`,
      description: `${title} 分类文章分页`,
      url: canonical,
    },
  }
}

export default async function BlogCategoryPagedPage({ params }: PageProps) {
  const { category, page } = await params
  const pageData = getBlogCategoryPageBySlugAndPageParam(category, page)

  if (!pageData || pageData.page <= 1) {
    notFound()
  }

  const title = pageData.config.title ?? pageData.category

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <header className="py-8 sm:py-10">
        <p className="font-mono text-xs text-slate-500">
          <Link href="/blog" className="transition hover:text-slate-800">
            博客
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link
            href={`/blog/${encodeURIComponent(pageData.category)}`}
            className="transition hover:text-slate-800"
          >
            {pageData.category}
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <span>第 {pageData.page} 页</span>
        </p>
        <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          {pageData.config.description ??
            `共 ${pageData.totalPosts} 篇文章，第 ${pageData.page} / ${pageData.totalPages} 页`}
        </p>
      </header>

      <CategoryPostList pageData={pageData} layout={pageData.config.layout} />
    </main>
  )
}
