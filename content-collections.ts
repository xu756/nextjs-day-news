import {
  defineCollection,
  defineConfig,
  defineSingleton,
} from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
import rehypeKatex from 'rehype-katex'
import remarkMath from 'remark-math'
import { z } from 'zod'

function normalizeIsoDay(value: string | Date): string {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? '' : value.toISOString().slice(0, 10)
  }

  return value.trim().slice(0, 10)
}

function normalizeOptionalText(value: string | undefined): string | undefined {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function normalizePathTitle(value: string): string {
  return value.trim().replaceAll('/', '-')
}

const dayLikeSchema = z.union([z.string().trim().min(10), z.date()])
const mdxOptions = {
  remarkPlugins: [remarkMath],
  rehypePlugins: [rehypeKatex],
}

const digestSourceItemSchema = z.object({
  title: z.string().trim().min(1),
  url: z.string(),
  sourceNames: z.array(z.string().trim().min(1)).default([]),
  sourceTypes: z.array(z.string().trim().min(1)).default([]),
  score: z.number().optional(),
  mentions: z.coerce.number().int().positive().default(1),
})

const digest = defineCollection({
  name: 'digest',
  directory: 'content/digest',
  include: '**/*.{md,mdx}',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string(),
    category: z.string(),
    why: z.string().optional(),
    candidateCount: z.number().int().positive().optional(),
    content: z.string(),
    heroImage: z.string().optional(),
    sourceUrls: z.array(z.string().url()),
    sources: z
      .array(
        z.object({
          name: z.string(),
          url: z.string().url(),
          sourceType: z.string().optional(),
        }),
      )
      .optional(),
    sourceDate: z.string().optional(),
    candidateItems: z
      .array(
        z.object({
          title: z.string(),
          url: z.string().url(),
          sourceName: z.string().optional(),
          sourceType: z.string().optional(),
          score: z.number().optional(),
        }),
      )
      .optional(),
    slug: z.string().optional(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, mdxOptions)
    return {
      ...document,
      mdx,
    }
  },
})

const blogPosts = defineCollection({
  name: 'blogPosts',
  directory: 'content/_post',
  include: '**/*.mdx',
  schema: z.object({
    title: z.string().trim().min(1),
    slug: z.string().trim().min(1).optional(),
    description: z.string().optional(),
    excerpt: z.string().optional(),
    category: z.string().trim().min(1).optional(),
    tags: z.array(z.string().trim().min(1)).optional(),
    featured: z.boolean().optional(),
    createdAt: dayLikeSchema.optional(),
    updatedAt: dayLikeSchema.optional(),
    pubDate: dayLikeSchema.optional(),
    coverImage: z.string().optional(),
    layout: z.string().trim().min(1).optional(),
    author: z.string().optional(),
    draft: z.boolean().optional(),
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document, mdxOptions)

    return {
      ...document,
      slug: normalizeOptionalText(document.slug),
      url: normalizePathTitle(document.slug ?? document.title),
      description: normalizeOptionalText(document.description),
      excerpt: normalizeOptionalText(document.excerpt),
      category: normalizeOptionalText(document.category),
      tags: document.tags?.map((tag) => tag.trim()).filter(Boolean),
      createdAt:
        document.createdAt === undefined
          ? undefined
          : normalizeIsoDay(document.createdAt),
      updatedAt:
        document.updatedAt === undefined
          ? undefined
          : normalizeIsoDay(document.updatedAt),
      pubDate:
        document.pubDate === undefined
          ? undefined
          : normalizeIsoDay(document.pubDate),
      coverImage: normalizeOptionalText(document.coverImage),
      layout: normalizeOptionalText(document.layout),
      author: normalizeOptionalText(document.author),
      mdx,
    }
  },
})

const blogConfig = defineSingleton({
  name: 'blogConfig',
  filePath: 'content/_post/config.yaml',
  parser: 'yaml',
  optional: true,
  schema: z.object({
    defaults: z
      .object({
        category: z.string().trim().min(1).optional(),
        tags: z.array(z.string().trim().min(1)).optional(),
        featured: z.boolean().optional(),
        createdAt: dayLikeSchema.optional(),
        updatedAt: dayLikeSchema.optional(),
        coverImage: z.string().optional(),
        layout: z.string().trim().min(1).optional(),
        author: z.string().trim().min(1).optional(),
        categoryLayout: z.string().trim().min(1).optional(),
        categoryPostLayout: z.string().trim().min(1).optional(),
        categoryPageSize: z.coerce.number().int().positive().optional(),
      })
      .optional(),
    categories: z
      .record(
        z.string().trim().min(1),
        z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          layout: z.string().optional(),
          postLayout: z.string().optional(),
          pageSize: z.coerce.number().int().positive().optional(),
        }),
      )
      .optional(),
  }),
  transform: (document) => {
    const defaults = document.defaults
      ? {
          ...document.defaults,
          category: normalizeOptionalText(document.defaults.category),
          tags: document.defaults.tags
            ?.map((tag) => tag.trim())
            .filter(Boolean),
          createdAt:
            document.defaults.createdAt === undefined
              ? undefined
              : normalizeIsoDay(document.defaults.createdAt),
          updatedAt:
            document.defaults.updatedAt === undefined
              ? undefined
              : normalizeIsoDay(document.defaults.updatedAt),
          coverImage: normalizeOptionalText(document.defaults.coverImage),
          layout: normalizeOptionalText(document.defaults.layout),
          author: normalizeOptionalText(document.defaults.author),
          categoryLayout: normalizeOptionalText(
            document.defaults.categoryLayout,
          ),
          categoryPostLayout: normalizeOptionalText(
            document.defaults.categoryPostLayout,
          ),
        }
      : undefined

    const categories: Record<
      string,
      {
        title?: string
        description?: string
        layout?: string
        postLayout?: string
        pageSize?: number
      }
    > = {}

    for (const [rawKey, value] of Object.entries(document.categories ?? {})) {
      const key = rawKey.trim()
      if (!key) continue

      categories[key] = {
        ...value,
        title: normalizeOptionalText(value.title),
        description: normalizeOptionalText(value.description),
        layout: normalizeOptionalText(value.layout),
        postLayout: normalizeOptionalText(value.postLayout),
      }
    }

    return {
      ...document,
      defaults,
      categories,
    }
  },
})

const digestDays = defineCollection({
  name: 'digestDays',
  parser: 'yaml',
  directory: 'content/digest',
  include: '**/data.yaml',
  schema: z.object({
    date: z.union([z.string().trim().min(10), z.date()]),
    coverImage: z.string().optional(),
    coverAlt: z.string().optional(),
    candidateCount: z.coerce.number().int().nonnegative().optional(),
    featured: z.array(digestSourceItemSchema).optional(),
    all: z.array(digestSourceItemSchema).optional(),
  }),
  transform: (doc) => ({
    ...doc,
    date: normalizeIsoDay(doc.date),
    coverImage: normalizeOptionalText(doc.coverImage),
    coverAlt: normalizeOptionalText(doc.coverAlt),
  }),
})

export default defineConfig({
  content: [digest, digestDays, blogPosts, blogConfig],
})
