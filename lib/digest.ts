import 'server-only'

import { allDigestDays, allDigests } from 'content-collections'

type RawDigestPost = (typeof allDigests)[number]
type DigestDayDataRecord = (typeof allDigestDays)[number]

export type DigestSourceItem = NonNullable<
  NonNullable<DigestDayDataRecord['all']>[number]
>

export type DigestPost = RawDigestPost & {
  slug: string
}

export type DigestDay = {
  day: string
  posts: DigestPost[]
  lead: DigestPost
}

type DigestSourceRecord = {
  date: string
  candidateCount: number
  featured: DigestSourceItem[]
  all: DigestSourceItem[]
}

export type DigestDayConfig = {
  date: string
  coverImage?: string
  coverAlt?: string
}

function dayFromIso(iso: string): string {
  return iso.slice(0, 10)
}

function dayFromDateLike(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10)
  }

  return value.slice(0, 10)
}

function normalizeUrl(url: string): string {
  try {
    const parsed = new URL(url)
    parsed.hash = ''
    return parsed.toString()
  } catch {
    return url
  }
}

function sourceNameFromUrl(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function pushUnique(target: string[], value: string | undefined): void {
  if (!value) return
  if (!target.includes(value)) target.push(value)
}

function resolvePostSlug(post: RawDigestPost): string {
  if (typeof post.slug === 'string' && post.slug.trim()) {
    return post.slug.trim()
  }

  return dayFromIso(post.pubDate)
}

function normalizePost(post: RawDigestPost): DigestPost {
  return {
    ...post,
    slug: resolvePostSlug(post),
  }
}

const digestPosts: DigestPost[] = allDigests.map((post) => normalizePost(post))

const digestDayDataByDate = new Map(
  allDigestDays.map((item) => [dayFromDateLike(item.date), item] as const),
)

function comparePostOrder(a: DigestPost, b: DigestPost): number {
  const fileA = a._meta?.fileName ?? ''
  const fileB = b._meta?.fileName ?? ''

  if (fileA && fileB) {
    return fileA.localeCompare(fileB)
  }

  return a.title.localeCompare(b.title, 'zh-CN')
}

function buildDigestSourceItems(
  entries: Array<{
    title: string
    url: string
    sourceName?: string
    sourceType?: string
    score?: number
  }>,
): DigestSourceItem[] {
  const byUrl = new Map<string, DigestSourceItem>()

  for (const entry of entries) {
    const key = normalizeUrl(entry.url)
    const current = byUrl.get(key)

    if (current) {
      pushUnique(
        current.sourceNames,
        entry.sourceName || sourceNameFromUrl(entry.url),
      )
      pushUnique(current.sourceTypes, entry.sourceType)
      current.mentions += 1

      if (typeof entry.score === 'number') {
        current.score =
          typeof current.score === 'number'
            ? Math.max(current.score, entry.score)
            : entry.score
      }

      continue
    }

    byUrl.set(key, {
      title: entry.title,
      url: entry.url,
      sourceNames: [entry.sourceName || sourceNameFromUrl(entry.url)],
      sourceTypes: entry.sourceType ? [entry.sourceType] : [],
      score: entry.score,
      mentions: 1,
    })
  }

  return Array.from(byUrl.values()).sort((a, b) => {
    const scoreA = typeof a.score === 'number' ? a.score : -1
    const scoreB = typeof b.score === 'number' ? b.score : -1

    if (scoreA !== scoreB) return scoreB - scoreA
    if (a.mentions !== b.mentions) return b.mentions - a.mentions

    return a.title.localeCompare(b.title, 'zh-CN')
  })
}

function asSourceRecord(
  dayData: DigestDayDataRecord,
): DigestSourceRecord | null {
  if (
    typeof dayData.candidateCount !== 'number' ||
    !Array.isArray(dayData.featured) ||
    !Array.isArray(dayData.all)
  ) {
    return null
  }

  return {
    date: dayFromDateLike(dayData.date),
    candidateCount: dayData.candidateCount,
    featured: dayData.featured,
    all: dayData.all,
  }
}

function buildDigestDays(posts: DigestPost[]): DigestDay[] {
  const grouped = new Map<string, DigestPost[]>()

  for (const post of posts) {
    const day = dayFromIso(post.pubDate)
    const current = grouped.get(day) ?? []
    current.push(post)
    grouped.set(day, current)
  }

  return Array.from(grouped.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, items]) => {
      const sorted = [...items].sort(comparePostOrder)
      return {
        day,
        posts: sorted,
        lead: sorted[0],
      }
    })
}

const digestDays = buildDigestDays(digestPosts)
const digestDaySlugs = digestDays.map((day) => day.day)
const digestDayLookup = new Map<string, DigestDay>()

for (const day of digestDays) {
  if (!digestDayLookup.has(day.day)) {
    digestDayLookup.set(day.day, day)
  }

  for (const post of day.posts) {
    if (!digestDayLookup.has(post.slug)) {
      digestDayLookup.set(post.slug, day)
    }
  }
}

function safeDecodeURIComponent(slug: string): string {
  try {
    return decodeURIComponent(slug)
  } catch {
    return slug
  }
}

export function getDigestDays(): DigestDay[] {
  return digestDays
}

export function getDigestDaySlugs(): string[] {
  return digestDaySlugs
}

export function findDigestDayBySlug(slug: string): DigestDay | null {
  const decodedSlug = safeDecodeURIComponent(slug)
  return digestDayLookup.get(decodedSlug) ?? null
}

export function getSourcesForDay(day: string, posts: DigestPost[]) {
  const dayData = digestDayDataByDate.get(day)
  const sourceRecord = dayData ? asSourceRecord(dayData) : null

  if (sourceRecord) {
    return {
      candidateCount: sourceRecord.candidateCount,
      featured: sourceRecord.featured,
      all: sourceRecord.all,
    }
  }

  const fallbackCandidates = posts.flatMap((post) => post.candidateItems ?? [])
  const fallbackAll = buildDigestSourceItems(fallbackCandidates)

  return {
    candidateCount: Math.max(posts[0]?.candidateCount ?? 0, fallbackAll.length),
    featured: fallbackAll.slice(0, 9),
    all: fallbackAll,
  }
}

export function getDayConfig(day: string): DigestDayConfig | undefined {
  const dayData = digestDayDataByDate.get(day)
  if (!dayData) return undefined

  return {
    date: dayFromDateLike(dayData.date),
    coverImage: dayData.coverImage,
    coverAlt: dayData.coverAlt,
  }
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
