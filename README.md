# astro-chan

A personal technical blog built with Astro, Tailwind CSS v4, and Starwind UI.
The design stays quiet: a small profile, simple navigation, borderless sections,
blue links, and reader controls at the top right. Atkinson Hyperlegible is used
for text and JetBrains Mono for code; both are bundled in `public/fonts/` with
their licenses.

## Run locally

Use the Node version in `package.json`, then:

```sh
pnpm install
cp -n .env.example .env
pnpm dev --background
```

The development server runs at `http://localhost:4321`. Manage it with
`pnpm astro dev status`, `pnpm astro dev logs`, and `pnpm astro dev stop`.

Pagefind indexes the finished HTML, so use a production preview to test search:

```sh
pnpm build
pnpm preview --port 4322
```

Open `http://localhost:4322`. `pnpm build` always rebuilds the search index.
The development search page explains this workflow when no index is available.

## Personal settings

Edit `.env`. `SITE_URL` is the origin used by canonical links, RSS, robots.txt,
and the sitemap. It defaults to `http://localhost:4321` while working locally;
set it to the real public origin when deploying.

`PUBLIC_GITHUB_URL`, `PUBLIC_X_URL`, and `PUBLIC_AVATAR_URL` control the profile
links and image. The avatar accepts a local path such as `/images/avatar.jpg`
or an HTTPS URL. Set any optional value to an empty string to hide it.
These values are read when Astro builds, so restart the dev server after editing them.

## Write a post

Add a `.md` or `.mdx` file to `src/content/blog/`. Its filename becomes its URL
under `/blog/`. Frontmatter is validated by `src/content.config.ts`:

```yaml
---
title: "A useful discovery"
description: "What changed and why it matters."
pubDate: 2026-10-22
tags: [typescript, tools]
draft: true
---
```

Tags use lowercase slugs, such as `react` or `web-development`. `updatedDate`
is optional and must not precede `pubDate`. Drafts appear in development with
a preview label; production builds omit them from pages, search, tags, and RSS.
The two `test-` posts are disposable examples.

Markdown code fences are highlighted by Astro's built-in Shiki themes, with
JetBrains Mono, a language label, and a copy button. Add footnotes with
`[^1]` and a matching `[^1]: Note text.` definition.

For an interactive example, use MDX and import a React component:

```mdx
import Counter from "@/components/examples/Counter";

<Counter client:visible />
```

React is loaded for these islands, rather than for the whole blog. The kitchen
sink post demonstrates the component, code fences, tables, and footnotes.

## Checks

Run `pnpm verify` for formatting, linting, Astro diagnostics, the static build,
and Pagefind indexing. `pnpm check`, `pnpm lint`, and `pnpm build` also run
individually. Generated files live in `dist/`; content and components stay in
`src/`. RSS is `/rss.xml`, the sitemap index is `/sitemap-index.xml`, and tags
are browsable at `/tags/`.
