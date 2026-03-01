# Blog Content Guide

Path format:

`content/blog/<category>/<file>.mdx`

Example:

`content/blog/engineering/nextjs-routing.mdx`

Frontmatter fields:

```yaml
---
title: Next.js 动态路由实践
description: 可选，列表页摘要
pubDate: '2026-03-02'
tags:
  - Next.js
  - Routing
coverImage: /images/blog/cover.png
layout: default
draft: false
---
```

Category config:

`content/blog/<category>/config.yaml`

```yaml
title: 工程实践
description: 可选，类目页描述
layout: default
postLayout: feature
pageSize: 10
```

Routing behavior:

- Category page: `/blog/[category]`
- Category pagination: `/blog/[category]/page/[page]`
- Post page: `/blog/[title]` (title comes from frontmatter `title`, `/` replaced by `-`)
- Tag page: `/<tag>`
- Tag pagination: `/<tag>/page/[page]`
