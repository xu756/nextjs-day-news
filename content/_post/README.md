# Blog Posts

所有博客文章统一放在 `content/_post/*.mdx`。

默认配置在 `content/_post/config.yaml`，文章未设置的字段会自动回退到默认值。

Frontmatter 示例：

```yaml
---
title: 文章标题
slug: url-slug
description: 列表摘要
excerpt: 摘要补充
category: study
tags:
  - AI
  - Next.js
featured: false
createdAt: '2026-03-02'
updatedAt: '2026-03-02'
coverImage: /images/cover.png
layout: default
author: 作者名
draft: false
---
```
