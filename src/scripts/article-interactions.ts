import { initializeCodeBlocks } from "@/scripts/code-blocks";

function focusFootnote(): void {
  if (!location.hash) return;
  let id: string;
  try {
    id = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  const target = document.getElementById(id);
  if (!(target instanceof HTMLElement)) return;
  if (!target.matches("[data-footnote-ref], [data-footnotes] li")) return;

  // Keep native fragment links and browser history; only move keyboard focus.
  target.focus({ preventScroll: true });
}

function initializeArticle(): void {
  initializeCodeBlocks();
  document.querySelectorAll<HTMLElement>(".prose [data-footnotes] li").forEach((note) => {
    note.tabIndex = -1;
  });
  document
    .querySelectorAll<HTMLAnchorElement>(".prose [data-footnote-ref]")
    .forEach((reference) => {
      reference.setAttribute("aria-label", `Read footnote ${reference.textContent?.trim()}`);
    });
  focusFootnote();
}

initializeArticle();
document.addEventListener("astro:page-load", initializeArticle);
window.addEventListener("hashchange", focusFootnote);
