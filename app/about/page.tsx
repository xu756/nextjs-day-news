import { SITE_TITLE } from '@/lib/site'
import type { Metadata } from 'next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: `方法论 | ${SITE_TITLE}`,
  description: '英文一手信源，保留出处，按天整理。',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-8 pt-8 sm:px-6 lg:px-8">
      <section className="py-10 text-center sm:py-14">
        <Badge variant="secondary" className="mb-4">
          Methodology
        </Badge>
        <h1 className="text-4xl font-semibold text-foreground sm:text-5xl">方法论</h1>
        <p className="mt-3 text-sm text-muted-foreground sm:text-base">英文一手信源，保留出处，按天整理。</p>
      </section>

      <Card className="rounded-3xl border-border/80 bg-card/90">
        <CardContent className="p-6 sm:p-8">
        <h2 className="flex items-start gap-3 text-2xl font-semibold text-foreground">
          <span className="font-mono text-primary">01</span>
          <span>筛选逻辑</span>
        </h2>
        <p className="mt-4 leading-8 text-foreground/90">
          每天从多个英文信源抓取候选条目，依据时效性、来源权重和交叉出现频次进行排序，最终保留重点关注条目与完整候选列表。
        </p>
        <p className="mt-3 leading-8 text-foreground/90">
          每篇摘要都会保留原始出处链接。来源页中展示“重点关注 /
          全部候选”两层视图，方便快速浏览和审计回溯。
        </p>
        </CardContent>
      </Card>
    </main>
  )
}
