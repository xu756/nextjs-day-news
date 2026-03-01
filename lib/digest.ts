import 'server-only'

import { allDigests } from 'content-collections'
import fg from 'fast-glob'
import yaml from 'js-yaml'
import fs from 'node:fs'

type RawDigestPost = (typeof allDigests)[number] & {
  _meta?: {
    fileName?: string
    path?: string
  }
  slug?: string
  candidateItems?: Array<{
    title: string
    url: string
    sourceName?: string
    sourceType?: string
    score?: number
  }>
  sources?: Array<{
    name: string
    url: string
    sourceType?: string
  }>
}

export type DigestPost = RawDigestPost & {
  slug: string
}

export type DigestDay = {
  day: string
  posts: DigestPost[]
  lead: DigestPost
}

export type DigestSourceItem = {
  title: string
  url: string
  sourceNames: string[]
  sourceTypes: string[]
  score?: number
  mentions: number
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

type DigestDayDataRecord = DigestDayConfig & {
  candidateCount?: number
  featured?: DigestSourceItem[]
  all?: DigestSourceItem[]
}

function dayFromUnknown(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10)
  }

  if (typeof value === 'string' && value.trim()) {
    return value.trim().slice(0, 10)
  }

  return null
}

function dayFromIso(iso: string): string {
  return iso.slice(0, 10)
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

function parseSourceItem(raw: unknown): DigestSourceItem | null {
  if (!raw || typeof raw !== 'object') return null

  const record = raw as Record<string, unknown>
  const title =
    typeof record.title === 'string' && record.title.trim()
      ? record.title.trim()
      : null
  const url =
    typeof record.url === 'string' && record.url.trim() ? record.url.trim() : null

  if (!title || !url) return null

  const sourceNames = Array.isArray(record.sourceNames)
    ? record.sourceNames.filter((item): item is string => typeof item === 'string')
    : []

  const sourceTypes = Array.isArray(record.sourceTypes)
    ? record.sourceTypes.filter((item): item is string => typeof item === 'string')
    : []

  const mentionsRaw = Number(record.mentions)
  const mentions = Number.isFinite(mentionsRaw) ? Math.max(1, mentionsRaw) : 1

  const scoreRaw = Number(record.score)
  const score = Number.isFinite(scoreRaw) ? scoreRaw : undefined

  return {
    title,
    url,
    sourceNames,
    sourceTypes,
    mentions,
    score,
  }
}

function parseSourceItems(value: unknown): DigestSourceItem[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value
    .map((item) => parseSourceItem(item))
    .filter((item): item is DigestSourceItem => Boolean(item))
}

function parseDayData(rawInput: string): DigestDayDataRecord | null {
  if (!rawInput.trim()) return null

  let parsed: unknown
  try {
    parsed = yaml.load(rawInput)
  } catch {
    return null
  }

  if (!parsed || typeof parsed !== 'object') return null

  const record = parsed as Record<string, unknown>
  const date = dayFromUnknown(record.date)
  if (!date) return null

  const coverImage =
    typeof record.coverImage === 'string' && record.coverImage.trim()
      ? record.coverImage.trim()
      : undefined

  const coverAlt =
    typeof record.coverAlt === 'string' && record.coverAlt.trim()
      ? record.coverAlt.trim()
      : undefined

  const candidateCountRaw = Number(record.candidateCount)
  const candidateCount = Number.isFinite(candidateCountRaw)
    ? Math.max(0, Math.floor(candidateCountRaw))
    : undefined

  return {
    date,
    coverImage,
    coverAlt,
    candidateCount,
    featured: parseSourceItems(record.featured),
    all: parseSourceItems(record.all),
  }
}

function loadDigestDayData(): DigestDayDataRecord[] {
  const root = process.cwd()
  const files = fg.sync('content/digest/*/data.yaml', {
    cwd: root,
    absolute: true,
  })

  return files
    .map((filePath) => {
      try {
        const raw = fs.readFileSync(filePath, 'utf8')
        return parseDayData(raw)
      } catch {
        return null
      }
    })
    .filter((item): item is DigestDayDataRecord => Boolean(item?.date))
}

function resolvePostSlug(post: RawDigestPost): string {
  if (typeof post.slug === 'string' && post.slug.trim()) {
    return post.slug.trim()
  }

  // Default slug is the digest day, because one route represents one day.
  return dayFromIso(post.pubDate)
}

function normalizePost(post: RawDigestPost): DigestPost {
  return {
    ...post,
    slug: resolvePostSlug(post),
  }
}

const digestPosts: DigestPost[] = allDigests.map((post) =>
  normalizePost(post as RawDigestPost),
)

const digestDayData = loadDigestDayData()

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
    typeof dayData.candidateCount === 'number' &&
    Array.isArray(dayData.featured) &&
    Array.isArray(dayData.all)
  ) {
    return {
      date: dayData.date,
      candidateCount: dayData.candidateCount,
      featured: dayData.featured,
      all: dayData.all,
    }
  }

  return null
}

export function getDigestDays(): DigestDay[] {
  const grouped = new Map<string, DigestPost[]>()

  for (const post of digestPosts) {
    const day = dayFromIso(post.pubDate)
    const current = grouped.get(day) ?? []
    current.push(post)
    grouped.set(day, current)
  }

  return Array.from(grouped.entries())
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([day, posts]) => {
      const sorted = [...posts].sort(comparePostOrder)
      return {
        day,
        posts: sorted,
        lead: sorted[0],
      }
    })
}

export function getDigestDaySlugs(): string[] {
  return getDigestDays().map((day) => day.day)
}

export function findDigestDayBySlug(slug: string): DigestDay | null {
  const decodedSlug = decodeURIComponent(slug)

  return (
    getDigestDays().find(
      (day) =>
        day.day === decodedSlug ||
        day.posts.some((post) => post.slug === decodedSlug),
    ) ?? null
  )
}

export function getSourcesForDay(day: string, posts: DigestPost[]) {
  const dayData = digestDayData.find((item) => item.date === day)
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
  const dayData = digestDayData.find((item) => item.date === day)
  if (!dayData) return undefined

  return {
    date: dayData.date,
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
