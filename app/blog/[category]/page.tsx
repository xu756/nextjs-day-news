import CategoryPostList from './CategoryPostList'
import {
  findBlogCategoryBySlug,
  findBlogPostBySlug,
  formatZhDateLabel,
  getBlogCategoryPageBySlug,
  getBlogPosts,
  getBlogSinglePageStaticParams,
  toBlogTagSlug,
} from '@/lib/blog'
import { SITE_TITLE, SITE_URL } from '@/lib/site'
import { MDXContent } from '@content-collections/mdx/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

type PageProps = {
  params: Promise<{
    category: string
  }>
}

function postContainerClassName(layout: string): string {
  if (layout === 'feature') {
    return 'rounded-3xl border border-emerald-200/80 bg-gradient-to-b from-emerald-50/70 to-white p-5 shadow-sm sm:p-7'
  }

  return 'rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7'
}

export function generateStaticParams() {
  return getBlogSinglePageStaticParams().map((item) => ({
    category: item.slug,
  }))
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { category: slug } = await params
  const categoryPage = getBlogCategoryPageBySlug(slug, 1)

  if (categoryPage) {
    const canonical = `${SITE_URL}/blog/${encodeURIComponent(categoryPage.category)}`
    const title = categoryPage.config.title ?? categoryPage.category
    const description =
      categoryPage.config.description ??
      `${title} 分类下共 ${categoryPage.totalPosts} 篇文章`

    return {
      title: `${title} | ${SITE_TITLE}`,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title: `${title} | ${SITE_TITLE}`,
        description,
        url: canonical,
      },
    }
  }

  const post = findBlogPostBySlug(slug)
  if (post) {
    const canonical = `${SITE_URL}/blog/${encodeURIComponent(post.url)}`
    const description = post.description ?? `${post.title} - ${post.category}`

    return {
      title: `${post.title} | ${SITE_TITLE}`,
      description,
      alternates: {
        canonical,
      },
      openGraph: {
        title: post.title,
        description,
        url: canonical,
        images: post.coverImage
          ? [
              post.coverImage.startsWith('http')
                ? post.coverImage
                : `${SITE_URL}${post.coverImage}`,
            ]
          : undefined,
      },
    }
  }

  return {
    title: `未找到 | ${SITE_TITLE}`,
  }
}

export default async function BlogSlugPage({ params }: PageProps) {
  const { category: slug } = await params
  const categoryPage = getBlogCategoryPageBySlug(slug, 1)

  if (categoryPage) {
    const title = categoryPage.config.title ?? categoryPage.category

    return (
      <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
        <header className="py-8 sm:py-10">
          <p className="font-mono text-xs text-slate-500">
            <Link href="/blog" className="transition hover:text-slate-800">
              博客
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span>{categoryPage.category}</span>
          </p>
          <h1 className="mt-3 font-serif text-3xl font-bold text-slate-900 sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            {categoryPage.config.description ??
              `共 ${categoryPage.totalPosts} 篇文章`}
          </p>
        </header>

        <CategoryPostList
          pageData={categoryPage}
          layout={categoryPage.config.layout}
        />
      </main>
    )
  }

  const post = findBlogPostBySlug(slug)
  if (!post) {
    notFound()
  }

  const categoryGroup = findBlogCategoryBySlug(post.category)
  const postLayout = post.layout ?? categoryGroup?.config.postLayout ?? 'default'
  const related = getBlogPosts()
    .filter((item) => item.category === post.category && item.url !== post.url)
    .slice(0, 3)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <header className="py-8 sm:py-10">
        <p className="font-mono text-xs text-slate-500">
          <Link href="/blog" className="transition hover:text-slate-800">
            博客
          </Link>
          <span className="mx-2 text-slate-300">/</span>
          <Link
            href={`/blog/${encodeURIComponent(post.category)}`}
            className="transition hover:text-slate-800"
          >
            {post.category}
          </Link>
        </p>

        <h1 className="mt-3 font-serif text-3xl font-bold leading-tight text-slate-900 sm:text-5xl">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-slate-500 sm:text-base">
          {formatZhDateLabel(post.day)}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/${encodeURIComponent(toBlogTagSlug(tag))}`}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600 transition hover:border-emerald-200 hover:text-emerald-700"
            >
              #{tag}
            </Link>
          ))}
        </div>
      </header>

      <article className={postContainerClassName(postLayout)}>
        <div className="prose prose-slate max-w-none prose-headings:text-emerald-800 prose-a:text-blue-700 prose-a:no-underline hover:prose-a:text-blue-800">
          <MDXContent code={post.mdx} />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            同分类文章
          </h2>
          <div className="space-y-2">
            {related.map((item) => (
              <Link
                key={`${item.category}-${item.url}`}
                href={`/blog/${encodeURIComponent(item.url)}`}
                className="block rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50/40"
              >
                <p className="font-mono text-xs text-slate-400">
                  {formatZhDateLabel(item.day)}
                </p>
                <p className="text-sm text-slate-700">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
