'use client'

import { Search } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [showQr, setShowQr] = useState(false)

  return (
    <header className="mx-auto w-full max-w-5xl px-4 pt-5 sm:px-6 lg:px-8">
      <nav className="relative flex items-center justify-between rounded-2xl border border-emerald-200/70 bg-white/85 px-4 py-3 shadow-sm backdrop-blur sm:px-5">
        <Link
          href="/digest"
          className="font-serif text-xl font-bold tracking-wide text-emerald-800"
        >
          AI资讯速览
        </Link>

        <ul className="flex items-center gap-3 text-sm text-slate-600 sm:gap-5">
          <li>
            <Link
              href="/digest"
              className="inline-flex items-center gap-1.5 transition hover:text-slate-900"
            >
              <Search size={14} />
              日报
            </Link>
          </li>
          <li>
            <Link href="/blog" className="transition hover:text-slate-900">
              博客
            </Link>
          </li>
          <li>
            <Link href="/about" className="transition hover:text-slate-900">
              方法论
            </Link>
          </li>
          <li className="relative">
            <button
              type="button"
              className="transition hover:text-slate-900"
              onClick={() => setShowQr((open) => !open)}
            >
              公众号
            </button>

            {showQr ? (
              <div
                role="dialog"
                aria-label="公众号二维码"
                className="absolute right-0 top-8 z-50 rounded-xl border border-slate-200 bg-white p-3 text-center shadow-xl"
              >
                <p className="mb-2 text-xs text-slate-500">微信扫码关注</p>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  className="h-36 w-36 rounded-md object-contain"
                  src="/globe.svg"
                  alt="公众号二维码"
                />
              </div>
            ) : null}
          </li>
          {/* <li>
            <Link
              href="/digest"
              className="inline-flex items-center gap-1.5 transition hover:text-slate-900"
            >
              <Languages size={14} />
              English
            </Link>
          </li> */}
        </ul>
      </nav>
    </header>
  )
}
