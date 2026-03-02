'use client'

import { Button } from '@/components/ui/button'
import { Check, Copy } from 'lucide-react'
import type React from 'react'
import { useMemo, useState } from 'react'

type PreProps = React.ComponentProps<'pre'>

function extractText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map((item) => extractText(item)).join('')
  if (typeof node === 'object' && 'props' in node) {
    return extractText((node as { props?: { children?: React.ReactNode } }).props?.children)
  }
  return ''
}

async function copyText(text: string) {
  if (!text) return

  try {
    await navigator.clipboard.writeText(text)
    return
  } catch {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.style.position = 'fixed'
    textarea.style.left = '-9999px'
    document.body.appendChild(textarea)
    textarea.focus()
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
  }
}

export default function CodeBlockPre({ children, className, ...props }: PreProps) {
  const [copied, setCopied] = useState(false)
  const text = useMemo(() => extractText(children).trim(), [children])

  return (
    <div className="relative my-5">
      <Button
        type="button"
        variant="secondary"
        size="xs"
        className="absolute right-2 top-2 z-10"
        onClick={async () => {
          await copyText(text)
          setCopied(true)
          window.setTimeout(() => setCopied(false), 1200)
        }}
      >
        {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
        复制
      </Button>

      {copied ? (
        <div
          role="status"
          aria-live="polite"
          className="pointer-events-none fixed left-1/2 top-6 z-[100] -translate-x-1/2 rounded-full border border-border/80 bg-card/95 px-4 py-1.5 text-sm text-foreground shadow-lg backdrop-blur animate-in fade-in zoom-in-95"
        >
          已复制到剪贴板
        </div>
      ) : null}

      <pre {...props} className={className}>
        {children}
      </pre>
    </div>
  )
}
