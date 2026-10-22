---
title: "Hello, world (test)"
description: "A dummy first post to verify the blog setup works end to end."
pubDate: 2026-10-22
tags: ["test"]
---

This is a dummy post. It exists only to verify that content collections,
routing, and styling all work.[^local]

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

## Notes without losing your place

<mark>A little emphasis should help the reader find the important part.</mark>
Inline code such as `getCollection('blog')` stays distinct from the prose.
Longer examples have a copy button, and footnotes keep extra detail out of the
main paragraph.[^reading]

Follow a small footnote number, then use its return arrow to come back to the
sentence you were reading.

[^local]: The typefaces are bundled with this site: Atkinson Hyperlegible for text and JetBrains Mono for code. No font service is needed.

[^reading]: These are standard Markdown footnotes. The same `[^name]` references and `[^name]:` definitions also work in MDX, with keyboard navigation and reduced-motion support.
