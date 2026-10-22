import { getCollection, type CollectionEntry } from "astro:content";

export type Post = CollectionEntry<"blog">;

interface PostOptions {
  includeDrafts?: boolean;
}

export async function getSortedPosts(options: PostOptions = {}): Promise<Post[]> {
  const includeDrafts = options.includeDrafts ?? import.meta.env.DEV;
  const posts = await getCollection("blog", ({ data }) => {
    return includeDrafts || data.draft !== true;
  });

  return posts.toSorted((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getPublishedPosts(): Promise<Post[]> {
  return getSortedPosts({ includeDrafts: false });
}

export function getAllTags(posts: Post[]): string[] {
  return [...new Set(posts.flatMap((post) => post.data.tags))].toSorted();
}

export function getSitePath(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalizedPath}` || "/";
}

export function getPostUrl(post: Post): string {
  const encodedId = post.id.split("/").map(encodeURIComponent).join("/");
  return getSitePath(`/blog/${encodedId}/`);
}

export function getTagUrl(tag: string): string {
  return getSitePath(`/tags/${encodeURIComponent(tag)}/`);
}
