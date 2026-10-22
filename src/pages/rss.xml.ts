import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "@/consts";
import { getPostUrl, getPublishedPosts } from "@/lib/posts";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();
  if (!context.site) throw new Error("Set SITE_URL to generate the RSS feed.");
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site,
    customData: "<language>en</language>",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: getPostUrl(post),
      categories: post.data.tags,
    })),
  });
}
