import { defineCollection, defineConfig } from '@content-collections/core'
import { z } from 'zod'

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
})

export default defineConfig({
  content: [digest],
})
