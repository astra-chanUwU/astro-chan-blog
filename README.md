# astro-chan

A personal technical blog built with Astro, Tailwind CSS v4, and Starwind UI.
The layout uses a wide reading column, simple navigation, and a light/dark
switch. Atkinson Hyperlegible is used for text and JetBrains Mono for code;
both are bundled in `public/fonts/` with their licenses.

## Run locally

Use the Node version in `package.json`, then:

```sh
pnpm install
cp -n .env.example .env
pnpm dev --background
```

The development server runs at `http://localhost:4321`. Manage it with
`pnpm astro dev status`, `pnpm astro dev logs`, and `pnpm astro dev stop`.

Pagefind indexes the finished HTML. Run `pnpm build` once before testing search,
and again after changing article content. The dev server serves the generated
`dist/pagefind/` index, so search works at `http://localhost:4321/search/` too.
The index is a snapshot of the last build and excludes drafts. Reload an open
search page after rebuilding to load the new index.

For a production preview, run `pnpm preview --port 4322` after building.

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
The two `test-` posts and ten `sample-` articles are disposable examples.
The sample articles cover a Go/SQLite media library and include code, related
links, and overlapping tags. Try searches such as `httptest`, `transaction`,
`checksum`, and `debounce`, then combine a query with a topic filter.

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

## Article details

Use ordinary Markdown footnotes (`[^note]` and `[^note]: ...`) in either Markdown
or MDX. References and return arrows keep native fragment links and browser
history, scroll smoothly, and highlight the destination. Reduced-motion settings
are respected. Use `<mark>text</mark>` for a small inline highlight. Code blocks
have a language label and a copy button; JavaScript is only needed for copying.
Astro's client router fades page changes and reinitializes search and article
controls after navigation.

## Deployment

Push to `main` to run `.github/workflows/deploy.yml`. It checks formatting and
lint, runs Astro diagnostics, builds the site and Pagefind index, then deploys
to GitHub Pages. The public URL is
`https://astra-chanuwu.github.io/astro-chan-blog/`.

`SITE_URL` remains the origin; `BASE_PATH=/astro-chan-blog` adds the project
path. Keep `BASE_PATH=/` locally or for a future custom domain. Internal template
links use `getSitePath()`. Root-relative Markdown links and images are prefixed
at build time by the shared Markdown/MDX processor; JSX URLs in MDX should use
`getSitePath()` explicitly. Canonicals, structured data, feeds, sitemap, icons,
and local fonts use the deployment path too.

The ten sample articles and two test posts are intentionally public and searchable
for testing. Replace or remove them before treating the archive as real writing.
