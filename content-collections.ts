import { defineCollection, defineConfig } from '@content-collections/core'
import { compileMDX } from '@content-collections/mdx'
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
    const mdx = await compileMDX(context, document)
    return {
      ...document,
      mdx,
    }
  },
})

const digestDays = defineCollection({
  name: 'digestDays',
  directory: 'content/digest',
  parser: 'yaml',
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
  content: [digest, digestDays],
})
