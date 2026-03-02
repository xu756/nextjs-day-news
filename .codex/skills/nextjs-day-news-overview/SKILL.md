---
name: nextjs-day-news-overview
description: Use when starting work in the nextjs-day-news repository and needing a fast map of project purpose, content model, routing, and verification commands.
---

# Nextjs Day News Overview

## Overview

这个项目是一个基于 Next.js App Router 的内容站，核心有两块：
本项目部署在 Vercel，项目地址：https://ai.xu756.top/

- `digest`：每日 AI 资讯速览（按日期归档）
- `blog`：专题博客（文章参数驱动，分类和标签聚合）

首页会重定向到 `/digest`。

## Quick Map

- 框架与运行时：Next.js 16 + React 19 + TypeScript
- 内容系统：`@content-collections/core` + `@content-collections/mdx`
- 内容定义入口：[content-collections.ts](../../../content-collections.ts)
- 业务数据聚合：
  - [lib/digest.ts](../../../lib/digest.ts)
  - [lib/blog.ts](../../../lib/blog.ts)
- 路由入口：
  - `app/digest/*`
  - `app/blog/*`
  - `app/[tag]/*`

## Content Model

### Digest

- 目录：`content/digest/<YYYY-MM-DD>/`
- 每日可包含：
  - 多篇 `*.mdx`（日报条目）
  - `data.yaml`（候选源、精选源、封面等）
- 页面读取：
  - `lib/digest.ts` 按日期聚合并提供 slug 查找

### Blog

- 目录：`content/_post/*.mdx`
- 默认配置：`content/_post/config.yaml`
- 文章参数为空时，会回退到 `config.yaml` 的 `defaults`
- 常用 frontmatter：
  - `title`, `slug`, `description`, `excerpt`
  - `category`, `tags`, `featured`
  - `createdAt`, `updatedAt`
  - `coverImage`, `layout`, `author`, `draft`
- 分类级配置在 `config.yaml` 的 `categories` 下（`title/description/layout/postLayout/pageSize`）

## Routing

- 首页：`/` -> `/digest`
- 日报：
  - `/digest`
  - `/digest/[slug]`
  - `/digest/[slug]/sources`
- 博客：
  - `/blog`（展示前 10 个分类卡片）
  - `/blog/[slug]`（同一路由兼容“分类页”与“文章页”）
  - `/blog/[category]/page/[page]`（分类分页）
- 标签：
  - `/[tag]`
  - `/[tag]/page/[page]`

## Working Rules

- 新增博客文章：优先在 `content/_post` 新建 mdx，不再使用旧 `content/blog` 结构
- 博客正文渲染使用 `MDXContent`（`@content-collections/mdx/react`）
- 任何内容模型或路由改动后都要做完整验证

## Verify Before Claiming Done

```bash
bun run lint && bun run build
```

重点确认：

- 类型检查通过
- SSG 路由正确生成（特别是 `/blog/*` 与 `/<tag>`）
- 新增文章 slug、分类页、标签页都可访问

## First Files To Read

1. [content-collections.ts](../../../content-collections.ts)
2. [lib/blog.ts](../../../lib/blog.ts)
3. [lib/digest.ts](../../../lib/digest.ts)
4. [app/blog/[category]/page.tsx](../../../app/blog/[category]/page.tsx)
5. [app/digest/[slug]/page.tsx](../../../app/digest/[slug]/page.tsx)

如果新增功能 请修改本文档的 Overview 和 Quick Map 部分，保持内容与代码同步。
