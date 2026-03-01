'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

type DigestDayCardProps = {
  dayLabel: string
  slug: string
  titles: string[]
  candidateCount: number
  featured?: boolean
}

function SectionTitles(props: { titles: string[] }) {
  return (
    <ol className="space-y-2">
      {props.titles.map((title, index) => {
        const num = String(index + 1).padStart(2, '0')
        const isLead = index === 0

        return (
          <li
            key={`${num}-${title}`}
            className={`flex items-start gap-3 ${isLead ? 'text-slate-900' : 'text-slate-500'}`}
          >
            <span
              className={`mt-0.5 w-7 shrink-0 font-mono text-sm font-semibold ${
                isLead ? 'text-amber-700' : 'text-slate-300'
              }`}
            >
              {num}
            </span>
            <span
              className={
                isLead
                  ? 'text-lg leading-8 sm:text-[1.35rem]'
                  : 'text-base leading-7'
              }
            >
              {title}
            </span>
          </li>
        )
      })}
    </ol>
  )
}

export default function DigestDayCard(props: DigestDayCardProps) {
  const router = useRouter()

  const openDigest = () => {
    router.push(`/digest/${encodeURIComponent(props.slug)}`)
  }

  return (
    <article
      role="link"
      tabIndex={0}
      aria-label={`${props.dayLabel} 资讯卡片`}
      onClick={openDigest}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          openDigest()
        }
      }}
      className={`group relative cursor-pointer rounded-3xl border border-emerald-200/60 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-xl sm:p-8 ${
        props.featured ? 'bg-gradient-to-br from-white to-emerald-50/60' : ''
      }`}
    >
      <span className="mb-5 block h-1.5 w-14 rounded-full bg-gradient-to-r from-emerald-700 to-emerald-300" />
      <p className="mb-4 font-mono text-xs text-slate-400">{props.dayLabel}</p>
      <SectionTitles titles={props.titles} />

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-semibold text-emerald-700 transition group-hover:text-emerald-800">
          阅读全文 →
        </span>

        <Link
          href={`/digest/${encodeURIComponent(props.slug)}/sources`}
          onClick={(event) => event.stopPropagation()}
          className="font-mono text-xs text-slate-400 transition hover:text-slate-700"
        >
          从 {props.candidateCount} 条资讯中筛选
        </Link>
      </div>
    </article>
  )
}
