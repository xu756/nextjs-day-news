import 'server-only'

import { allBlogCategoryConfigs, allBlogs } from 'content-collections'

export const BLOG_CATEGORY_PAGE_SIZE = 10
export const BLOG_TAG_PAGE_SIZE = 10
const RESERVED_ROOT_SLUGS = new Set(['about', 'blog', 'digest'])

type RawBlogPost = (typeof allBlogs)[number] & {
  category: string
  url: string
  pubDate: string
  mdx: string
  title: string
  description?: string
  draft?: boolean
  tags: string[]
  coverImage?: string
  layout?: string
}

type RawBlogCategoryConfig = (typeof allBlogCategoryConfigs)[number] & {
  category: string
  title?: string
  description?: string
  layout?: string
  postLayout?: string
  pageSize?: number
}

export type BlogPost = RawBlogPost & {
  day: string
}

export type BlogCategoryConfig = {
  category: string
  title?: string
  description?: string
  layout: string
  postLayout: string
  pageSize?: number
}

export type BlogCategoryGroup = {
  category: string
  config: BlogCategoryConfig
  posts: BlogPost[]
}

export type BlogCategorySummary = {
  category: string
  title: string
  description?: string
  totalPosts: number
  latestPost: BlogPost
}

export type BlogCategoryPage = {
  category: string
  config: BlogCategoryConfig
  posts: BlogPost[]
  page: number
  totalPages: number
  totalPosts: number
}

export type BlogTagPage = {
  tag: string
  slug: string
  posts: BlogPost[]
  page: number
  totalPages: number
  totalPosts: number
}

function dayFromIso(iso: string): string {
  return iso.slice(0, 10)
}

function safeDecodeURIComponent(value: string): string {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

function normalizePathSegment(value: string): string {
  return value.trim().replaceAll('/', '-')
}

function isReservedRootSlug(value: string): boolean {
  return RESERVED_ROOT_SLUGS.has(value)
}

function comparePostDate(a: BlogPost, b: BlogPost): number {
  const byDate = b.day.localeCompare(a.day)
  if (byDate !== 0) return byDate
  return a.title.localeCompare(b.title, 'zh-CN')
}

function compareCategory(a: BlogCategoryGroup, b: BlogCategoryGroup): number {
  const aDay = a.posts[0]?.day ?? ''
  const bDay = b.posts[0]?.day ?? ''
  const byDate = bDay.localeCompare(aDay)
  if (byDate !== 0) return byDate
  return a.category.localeCompare(b.category, 'zh-CN')
}

function toPositiveInt(value: string): number | null {
  if (!/^\d+$/.test(value)) return null
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed <= 0) return null
  return parsed
}

function paginateItems<T>(
  items: T[],
  page: number,
  pageSize: number,
): { items: T[]; page: number; totalPages: number; totalItems: number } | null {
  if (page <= 0 || pageSize <= 0) return null

  const totalItems = items.length
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize))

  if (page > totalPages) return null

  const start = (page - 1) * pageSize
  const end = start + pageSize

  return {
    items: items.slice(start, end),
    page,
    totalPages,
    totalItems,
  }
}

const categoryConfigLookup = (() => {
  const map = new Map<string, BlogCategoryConfig>()

  for (const config of allBlogCategoryConfigs as RawBlogCategoryConfig[]) {
    map.set(config.category, {
      category: config.category,
      title: config.title,
      description: config.description,
      layout: config.layout ?? 'default',
      postLayout: config.postLayout ?? 'default',
      pageSize: config.pageSize,
    })
  }

  return map
})()

const blogPosts: BlogPost[] = (allBlogs as RawBlogPost[])
  .filter((post) => !post.draft)
  .map((post) => ({
    ...post,
    url: normalizePathSegment(post.url),
    tags: post.tags.map((tag) => tag.trim()).filter(Boolean),
    day: dayFromIso(post.pubDate),
  }))
  .sort(comparePostDate)

const blogPostLookup = new Map<string, BlogPost>()
for (const post of blogPosts) {
  if (!blogPostLookup.has(post.url)) {
    blogPostLookup.set(post.url, post)
  }
}

const categoryGroups: BlogCategoryGroup[] = (() => {
  const grouped = new Map<string, BlogPost[]>()

  for (const post of blogPosts) {
    const current = grouped.get(post.category) ?? []
    current.push(post)
    grouped.set(post.category, current)
  }

  return Array.from(grouped.entries())
    .map(([category, posts]) => {
      const sorted = [...posts].sort(comparePostDate)
      const fallbackConfig: BlogCategoryConfig = {
        category,
        layout: 'default',
        postLayout: 'default',
      }
      return {
        category,
        posts: sorted,
        config: categoryConfigLookup.get(category) ?? fallbackConfig,
      }
    })
    .sort(compareCategory)
})()

const categoryLookup = new Map(
  categoryGroups.map((group) => [group.category, group] as const),
)

const categorySummaries: BlogCategorySummary[] = categoryGroups
  .filter((group) => group.posts.length > 0)
  .map((group) => ({
    category: group.category,
    title: group.config.title ?? group.category,
    description: group.config.description,
    totalPosts: group.posts.length,
    latestPost: group.posts[0],
  }))

const blogSinglePageStaticParams = (() => {
  const params: Array<{ slug: string }> = []
  const seen = new Set<string>()

  for (const group of categoryGroups) {
    if (!seen.has(group.category)) {
      seen.add(group.category)
      params.push({ slug: group.category })
    }
  }

  for (const post of blogPosts) {
    if (!seen.has(post.url)) {
      seen.add(post.url)
      params.push({ slug: post.url })
    }
  }

  return params
})()

const categoryPageStaticParams = (() => {
  const params: Array<{ category: string; page: string }> = []

  for (const group of categoryGroups) {
    const pageSize = group.config.pageSize ?? BLOG_CATEGORY_PAGE_SIZE
    const totalPages = Math.max(1, Math.ceil(group.posts.length / pageSize))
    for (let page = 2; page <= totalPages; page += 1) {
      params.push({
        category: group.category,
        page: String(page),
      })
    }
  }

  return params
})()

const tagLookup = (() => {
  const map = new Map<string, { tag: string; slug: string; posts: BlogPost[] }>()

  for (const post of blogPosts) {
    const seen = new Set<string>()

    for (const tag of post.tags) {
      const slug = normalizePathSegment(tag)
      if (!slug || seen.has(slug)) continue
      seen.add(slug)

      const current = map.get(slug)
      if (current) {
        current.posts.push(post)
        continue
      }

      map.set(slug, {
        tag,
        slug,
        posts: [post],
      })
    }
  }

  for (const group of map.values()) {
    group.posts.sort(comparePostDate)
  }

  return map
})()

const tagGroups = Array.from(tagLookup.values()).filter(
  (group) => !isReservedRootSlug(group.slug),
)

const tagStaticParams = tagGroups.map((group) => ({
  tag: group.slug,
}))

const tagPageStaticParams = (() => {
  const params: Array<{ tag: string; page: string }> = []

  for (const group of tagGroups) {
    const totalPages = Math.max(
      1,
      Math.ceil(group.posts.length / BLOG_TAG_PAGE_SIZE),
    )
    for (let page = 2; page <= totalPages; page += 1) {
      params.push({
        tag: group.slug,
        page: String(page),
      })
    }
  }

  return params
})()

export function getBlogPosts(): BlogPost[] {
  return blogPosts
}

export function getBlogCategoryGroups(): BlogCategoryGroup[] {
  return categoryGroups
}

export function getBlogCategorySummaries(limit = 10): BlogCategorySummary[] {
  return categorySummaries.slice(0, Math.max(0, limit))
}

export function getBlogSinglePageStaticParams() {
  return blogSinglePageStaticParams
}

export function getBlogCategoryPageStaticParams() {
  return categoryPageStaticParams
}

export function getBlogTagStaticParams() {
  return tagStaticParams
}

export function getBlogTagPageStaticParams() {
  return tagPageStaticParams
}

export function findBlogPostBySlug(slug: string): BlogPost | null {
  const decoded = normalizePathSegment(safeDecodeURIComponent(slug))
  return blogPostLookup.get(decoded) ?? null
}

export function findBlogCategoryBySlug(slug: string): BlogCategoryGroup | null {
  const decoded = safeDecodeURIComponent(slug)
  return categoryLookup.get(decoded) ?? null
}

export function getBlogCategoryPageBySlug(
  slug: string,
  page: number,
): BlogCategoryPage | null {
  const group = findBlogCategoryBySlug(slug)
  if (!group) return null

  const pageSize = group.config.pageSize ?? BLOG_CATEGORY_PAGE_SIZE
  const paged = paginateItems(group.posts, page, pageSize)
  if (!paged) return null

  return {
    category: group.category,
    config: group.config,
    posts: paged.items,
    page: paged.page,
    totalPages: paged.totalPages,
    totalPosts: paged.totalItems,
  }
}

export function getBlogCategoryPageBySlugAndPageParam(
  slug: string,
  pageParam: string,
): BlogCategoryPage | null {
  const page = toPositiveInt(safeDecodeURIComponent(pageParam))
  if (!page) return null
  return getBlogCategoryPageBySlug(slug, page)
}

export function getBlogTagPageBySlug(
  tagSlug: string,
  page: number,
): BlogTagPage | null {
  const decoded = normalizePathSegment(safeDecodeURIComponent(tagSlug))
  if (isReservedRootSlug(decoded)) return null
  const group = tagLookup.get(decoded)
  if (!group) return null

  const paged = paginateItems(group.posts, page, BLOG_TAG_PAGE_SIZE)
  if (!paged) return null

  return {
    tag: group.tag,
    slug: group.slug,
    posts: paged.items,
    page: paged.page,
    totalPages: paged.totalPages,
    totalPosts: paged.totalItems,
  }
}

export function getBlogTagPageBySlugAndPageParam(
  tagSlug: string,
  pageParam: string,
): BlogTagPage | null {
  const page = toPositiveInt(safeDecodeURIComponent(pageParam))
  if (!page) return null
  return getBlogTagPageBySlug(tagSlug, page)
}

export function formatZhDateLabel(isoOrDay: string): string {
  const normalized =
    isoOrDay.length === 10 ? `${isoOrDay}T00:00:00.000Z` : isoOrDay

  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return isoOrDay

  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  })
}

export function toBlogTagSlug(tag: string): string {
  return normalizePathSegment(tag)
}
