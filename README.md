# nextjs-day-news

基于 Next.js App Router 的内容站，包含两类内容：

- `digest`：每日 AI 资讯速览（按日期归档）
- `blog`：专题博客（分类 + 标签 + 分页）

线上地址：<https://ai.xu756.top/>

## 本地开发

```bash
bun install
bun run dev
```

打开 <http://localhost:3000>，首页会重定向到 `/digest`。

## 内容目录

```text
content/
  digest/
    2026-03-01/
      xxx.mdx
      yyy.mdx
      data.yaml
  _post/
    config.yaml
    01-some-post.mdx
```

## 如何新增博客文章（Blog）

1. 在 `content/_post/` 新建一个 `.mdx` 文件。
2. 写 frontmatter 和正文。
3. 本地预览：`bun run dev`。

### Blog frontmatter 示例

```yaml
---
title: Hacker News 淹没在 AI 评论中
slug: hacker-news-ai-comments
description: 列表页摘要
excerpt: 摘要补充（可选）
category: study
tags:
  - Hacker News
  - AI
featured: true
createdAt: '2026-02-28'
updatedAt: '2026-02-28'
pubDate: '2026-02-28'
coverImage: /images/lagoon-1.svg
layout: feature
author: AI资讯速览
draft: false
---
```

### Blog 参数说明

| 参数 | 必填 | 含义 | 默认/回退规则 |
|---|---|---|---|
| `title` | 是 | 文章标题 | 无 |
| `slug` | 否 | 文章 URL 标识 | 为空时使用 `title` 生成（`/` 会被替换为 `-`） |
| `description` | 否 | 列表页简介 | 为空时回退到 `excerpt` |
| `excerpt` | 否 | 摘要补充 | 为空时回退到 `description` |
| `category` | 否 | 分类 | 回退到 `content/_post/config.yaml` 的 `defaults.category`，再回退 `general` |
| `tags` | 否 | 标签数组 | 回退到 `defaults.tags` |
| `featured` | 否 | 是否精选 | 回退到 `defaults.featured` |
| `createdAt` | 否 | 创建日期（展示主日期） | 为空时回退 `pubDate`，再回退 `defaults.createdAt`，最终 `1970-01-01` |
| `updatedAt` | 否 | 更新日期 | 为空时回退 `defaults.updatedAt`，再回退 `createdAt` |
| `pubDate` | 否 | 发布日期 | 仅作为 `createdAt` 的补充来源 |
| `coverImage` | 否 | 封面图 | 回退到 `defaults.coverImage` |
| `layout` | 否 | 文章布局 | 文章页回退顺序：`post.layout` -> 分类 `postLayout` -> `default` |
| `author` | 否 | 作者 | 回退到 `defaults.author` |
| `draft` | 否 | 草稿开关 | `true` 不会出现在站点中；默认可见 |

注意：已移除 Hexo 兼容字段，请使用上面这套原生参数。

## 如何新增日报内容（Digest）

1. 新建日期目录：`content/digest/YYYY-MM-DD/`。
2. 放入 1~N 篇 `.mdx` 日报条目。
3. 可选添加 `data.yaml`（用于候选源、精选源、封面）。

### Digest 条目 frontmatter 示例（`content/digest/YYYY-MM-DD/*.mdx`）

```yaml
---
title: OpenAI 发布新模型更新
description: 当日摘要
pubDate: '2026-03-01'
category: ai
why: 为什么值得关注（可选）
sourceUrls:
  - https://example.com/a
  - https://example.com/b
sources:
  - name: OpenAI Blog
    url: https://example.com/a
    sourceType: official
candidateCount: 120
heroImage: /images/cover.png
sourceDate: '2026-03-01'
slug: 2026-03-01
---
```

### Digest 条目参数说明

| 参数 | 必填 | 含义 |
|---|---|---|
| `title` | 是 | 条目标题 |
| `description` | 是 | 条目简介 |
| `pubDate` | 是 | 日期，用于归档 |
| `category` | 是 | 分类标识 |
| `content` | 是 | 正文（MDX 内容本身） |
| `sourceUrls` | 是 | 来源 URL 列表 |
| `why` | 否 | 为什么入选 |
| `sources` | 否 | 结构化来源（名称、链接、类型） |
| `candidateCount` | 否 | 候选来源总数 |
| `candidateItems` | 否 | 候选来源明细 |
| `heroImage` | 否 | 条目图 |
| `sourceDate` | 否 | 来源日期 |
| `slug` | 否 | 自定义 slug，不填默认按日期 |

### `data.yaml` 示例（可选）

```yaml
date: '2026-03-01'
coverImage: /images/lagoon-1.svg
coverAlt: 今日封面
candidateCount: 120
featured:
  - title: 某条重点来源
    url: https://example.com/a
    sourceNames: [OpenAI Blog]
    sourceTypes: [official]
    score: 0.98
    mentions: 3
all:
  - title: 某条候选来源
    url: https://example.com/b
    sourceNames: [TechCrunch]
    sourceTypes: [media]
    mentions: 1
```

## 校验命令

提交前建议执行：

```bash
bun run lint && bun run build
```

重点检查：

- 类型检查通过
- `/blog/*`、`/[tag]`、`/digest/*` 路由可正常生成
- 新增文章和标签页都能访问
