// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import { devSearchIndex } from "./scripts/dev-search-index.mjs";

const env = loadEnv(process.env.NODE_ENV ?? "development", process.cwd(), "");
const site = new URL(process.env.SITE_URL ?? env.SITE_URL ?? "http://localhost:4321");
if (
  !["http:", "https:"].includes(site.protocol) ||
  site.username ||
  site.password ||
  site.search ||
  site.hash ||
  site.pathname !== "/"
) {
  throw new Error("SITE_URL must be an http(s) origin, such as http://localhost:4321.");
}

const base = (process.env.BASE_PATH ?? env.BASE_PATH ?? "/").replace(/\/$/, "") || "/";
if (!/^\/(?:[a-zA-Z0-9_-]+(?:\/[a-zA-Z0-9_-]+)*)?$/.test(base)) {
  throw new Error("BASE_PATH must be / or a path such as /astro-chan-blog.");
}
const prefix = base === "/" ? "" : base;
const contentPaths = satteri({
  mdastPlugins: [
    {
      name: "site-relative-paths",
      link(node, ctx) {
        if (/^\/(?!\/)/.test(node.url) && !node.url.startsWith(`${prefix}/`))
          ctx.setProperty(node, "url", `${prefix}${node.url}`);
      },
      image(node, ctx) {
        if (/^\/(?!\/)/.test(node.url) && !node.url.startsWith(`${prefix}/`))
          ctx.setProperty(node, "url", `${prefix}${node.url}`);
      },
      definition(node, ctx) {
        if (/^\/(?!\/)/.test(node.url) && !node.url.startsWith(`${prefix}/`))
          ctx.setProperty(node, "url", `${prefix}${node.url}`);
      },
    },
  ],
});

export default defineConfig({
  site: site.origin,
  base,
  trailingSlash: "always",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/search/") }), mdx(), react()],
  markdown: {
    processor: contentPaths,
    shikiConfig: {
      themes: { light: "github-light", dark: "github-dark" },
      transformers: [
        {
          pre(node) {
            node.properties["data-language"] = this.options.lang;
          },
        },
      ],
    },
  },
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss(), devSearchIndex()],
    resolve: {
      alias: {
        "@": "/src",
      },
    },
  },
});
