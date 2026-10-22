interface PagefindResultData {
  url: string;
  plain_excerpt?: string;
  meta?: Record<string, string | undefined>;
}

interface PagefindResult {
  data: () => Promise<PagefindResultData>;
}

interface PagefindSearch {
  results: PagefindResult[];
}

interface PagefindApi {
  search: (
    query: string | null,
    options?: { filters?: Record<string, string> },
  ) => Promise<PagefindSearch>;
}

const form = document.querySelector<HTMLFormElement>("#search-form");
const queryInput = document.querySelector<HTMLInputElement>("#search-query");
const tagSelect = document.querySelector<HTMLSelectElement>("#search-tag");
const status = document.querySelector<HTMLParagraphElement>("#search-status");
const resultsList = document.querySelector<HTMLOListElement>("#search-results");
const runtime = document.querySelector<HTMLElement>("#search-runtime");

if (form && queryInput && tagSelect && status && resultsList && runtime) {
  const pagefindPath = `${import.meta.env.BASE_URL}pagefind/pagefind.js`;
  const isDev = runtime.dataset.dev === "true";
  let sequence = 0;
  let pagefindPromise: Promise<PagefindApi> | undefined;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const loadPagefind = () => {
    pagefindPromise ??= import(/* @vite-ignore */ pagefindPath) as Promise<PagefindApi>;
    return pagefindPromise;
  };

  const clearResults = () => {
    resultsList.replaceChildren();
  };

  const setStatus = (message: string) => {
    status.textContent = message;
  };

  const makeResult = (item: PagefindResultData): HTMLLIElement | null => {
    if (!item.url || item.url.startsWith("//")) return null;

    const href = new URL(item.url, window.location.origin);
    if (href.origin !== window.location.origin) return null;

    const title = item.meta?.title?.trim() || "Untitled post";
    const row = document.createElement("li");
    const link = document.createElement("a");
    link.href = `${href.pathname}${href.search}${href.hash}`;
    link.textContent = title;
    link.className = "font-sans text-lg font-semibold text-foreground";
    row.append(link);

    const date = item.meta?.date;
    if (date) {
      const time = document.createElement("time");
      time.dateTime = date;
      const parsed = new Date(date);
      time.textContent = Number.isNaN(parsed.valueOf())
        ? date
        : parsed.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
      time.className = "text-muted-foreground ml-3 text-xs";
      row.append(time);
    }

    const excerpt = item.plain_excerpt?.trim();
    if (excerpt) {
      const paragraph = document.createElement("p");
      paragraph.className = "text-muted-foreground mt-1 text-sm leading-relaxed";
      paragraph.textContent = excerpt;
      row.append(paragraph);
    }

    return row;
  };

  const runSearch = async () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    const currentSequence = ++sequence;
    const query = queryInput.value.trim();
    const tag = tagSelect.value;

    clearResults();
    if (!query && !tag) {
      setStatus("Enter a word or choose a tag to search.");
      return;
    }

    setStatus("Searching…");
    try {
      const pagefind = await loadPagefind();
      const filters: Record<string, string> = { type: "post" };
      if (tag) filters.tag = tag;
      const search = await pagefind.search(query || null, { filters });
      const data = await Promise.all(search.results.map((result) => result.data()));
      if (currentSequence !== sequence) return;

      const rows = data.map(makeResult).filter((row): row is HTMLLIElement => row !== null);
      resultsList.replaceChildren(...rows);
      setStatus(`${rows.length} result${rows.length === 1 ? "" : "s"}.`);
      if (rows.length === 0) setStatus("No matching posts.");
    } catch {
      if (currentSequence !== sequence) return;
      setStatus(
        isDev
          ? "Search index is not available in development. Run pnpm build, then preview the site to search the index."
          : "Search is unavailable right now. Please try again later.",
      );
    }
  };

  const scheduleSearch = () => {
    sequence += 1;
    clearResults();
    setStatus(
      queryInput.value.trim() || tagSelect.value
        ? "Searching…"
        : "Enter a word or choose a tag to search.",
    );
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => void runSearch(), 250);
  };

  const syncQuery = () => {
    const params = new URLSearchParams();
    const query = queryInput.value.trim();
    const tag = tagSelect.value;
    if (query) params.set("q", query);
    if (tag) params.set("tag", tag);
    const suffix = params.toString();
    window.history.replaceState(null, "", suffix ? `?${suffix}` : window.location.pathname);
  };

  const params = new URLSearchParams(window.location.search);
  queryInput.value = params.get("q") ?? "";
  tagSelect.value = params.get("tag") ?? "";
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    syncQuery();
    void runSearch();
  });
  queryInput.addEventListener("input", () => {
    syncQuery();
    scheduleSearch();
  });
  tagSelect.addEventListener("change", () => {
    syncQuery();
    void runSearch();
  });

  if (queryInput.value || tagSelect.value) void runSearch();
}
