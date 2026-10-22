// @ts-check
import { defineConfig } from "astro/config";
import { loadEnv } from "vite";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";

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

export default defineConfig({
  site: site.origin,
  trailingSlash: "always",
  integrations: [sitemap({ filter: (page) => !page.endsWith("/search/") }), mdx(), react()],
  markdown: {
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
