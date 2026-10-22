import type { APIContext } from "astro";

export function GET({ site }: APIContext) {
  if (!site) throw new Error("Set SITE_URL to generate robots.txt.");
  return new Response(`User-agent: *\nAllow: /\nSitemap: ${new URL("sitemap-index.xml", site)}\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
