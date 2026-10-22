export const SITE_TITLE = "astro-chan";
export const SITE_DESCRIPTION = "Notes on software, systems, and the things I am learning.";
export const SITE_AUTHOR = "astro-chan";

function socialUrl(value: string | undefined, fallback: string): string {
  const candidate = (value ?? fallback).trim();
  if (!candidate) return "";

  const url = new URL(candidate);
  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error("Social links must use an http or https URL.");
  }
  return url.href;
}

const avatar = (import.meta.env.PUBLIC_AVATAR_URL ?? "/images/avatar.jpg").trim();
if (avatar && !/^\/(?!\/)/.test(avatar)) {
  socialUrl(avatar, "");
}

// Empty values intentionally hide optional links or the avatar.
export const SOCIAL_LINKS = {
  github: socialUrl(import.meta.env.PUBLIC_GITHUB_URL, "https://github.com/astra-chanUwU"),
  x: socialUrl(import.meta.env.PUBLIC_X_URL, "https://x.com/Akhu176"),
  avatar,
};
