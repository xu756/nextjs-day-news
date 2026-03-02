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
import CodeBlockPre from '@/components/CodeBlockPre'
import { Badge } from '@/components/ui/badge'
import { MDXContent } from '@content-collections/mdx/react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import CategoryPostList from './CategoryPostList'

type PageProps = {
  params: Promise<{
    category: string
  }>
}

function postContainerClassName(layout: string): string {
  if (layout === 'feature') {
    return 'rounded-3xl border border-border/80 bg-[linear-gradient(150deg,color-mix(in_oklab,var(--color-primary)_11%,transparent),transparent)] p-5 shadow-sm sm:p-7'
  }

  return 'rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm sm:p-7'
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
    const description =
      post.description ?? post.excerpt ?? `${post.title} - ${post.category}`

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
          <p className="font-mono text-xs text-muted-foreground">
            <Link href="/blog" className="transition hover:text-foreground">
              博客
            </Link>
            <span className="mx-2 text-muted-foreground/40">/</span>
            <span>{categoryPage.category}</span>
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-5xl">
            {title}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
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
  const postLayout =
    post.layout ?? categoryGroup?.config.postLayout ?? 'default'
  const related = getBlogPosts()
    .filter((item) => item.category === post.category && item.url !== post.url)
    .slice(0, 3)

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <header className="py-8 sm:py-10">
        <p className="font-mono text-xs text-muted-foreground">
          <Link href="/blog" className="transition hover:text-foreground">
            博客
          </Link>
          <span className="mx-2 text-muted-foreground/40">/</span>
          <Link
            href={`/blog/${encodeURIComponent(post.category)}`}
            className="transition hover:text-foreground"
          >
            {post.category}
          </Link>
        </p>

        <h1 className="mt-3 text-3xl font-semibold leading-tight text-foreground sm:text-5xl">
          {post.title}
        </h1>

        <p className="mt-3 text-sm text-muted-foreground sm:text-base">
          {formatZhDateLabel(post.day)}
          {post.updatedAt !== post.createdAt ? (
            <span className="ml-3">
              更新于 {formatZhDateLabel(post.updatedAt)}
            </span>
          ) : null}
          {post.author ? (
            <span className="ml-3">作者 {post.author}</span>
          ) : null}
        </p>

        <div className="mt-3 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" asChild>
              <Link
                href={`/${encodeURIComponent(toBlogTagSlug(tag))}`}
                className="transition hover:border-primary/40 hover:text-primary"
              >
                #{tag}
              </Link>
            </Badge>
          ))}
        </div>
      </header>

      <article className={postContainerClassName(postLayout)}>
        <div className="prose prose-slate max-w-none prose-headings:text-primary prose-a:text-primary prose-a:no-underline hover:prose-a:text-primary/80">
          <MDXContent code={post.mdx} components={{ pre: CodeBlockPre }} />
        </div>
      </article>

      {related.length > 0 ? (
        <section className="mt-8">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            同分类文章
          </h2>
          <div className="space-y-2">
            {related.map((item) => (
              <Link
                key={`${item.category}-${item.url}`}
                href={`/blog/${encodeURIComponent(item.url)}`}
                className="block rounded-2xl border border-border/80 bg-card/90 px-4 py-3 shadow-sm transition hover:border-primary/30 hover:bg-accent/50"
              >
                <p className="font-mono text-xs text-muted-foreground">
                  {formatZhDateLabel(item.day)}
                </p>
                <p className="text-sm text-foreground/90">{item.title}</p>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
