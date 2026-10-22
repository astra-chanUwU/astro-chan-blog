---
title: "Hello, world (test)"
description: "A dummy first post to verify the blog setup works end to end."
pubDate: 2026-10-22
tags: ["test"]
---

This is a dummy post. It exists only to verify that content collections,
routing, and styling all work.

## What this checks

- Frontmatter is validated by the Zod schema in `src/content.config.ts`
- This page is generated from `src/pages/blog/[...slug].astro`
- Code uses the local JetBrains Mono font:

```ts
const greeting: string = "hello, blog";
console.log(greeting);
```

> [!NOTE]
> Delete this post whenever you are ready. It is tagged `test` so you can
> find it at [/tags/test](/tags/test).

That's it. Short and minimal, like the blog itself.
