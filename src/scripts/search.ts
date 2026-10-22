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

let cleanupSearch: (() => void) | undefined;

const initializeSearch = () => {
  cleanupSearch?.();
  const form = document.querySelector<HTMLFormElement>("#search-form");
  const queryInput = document.querySelector<HTMLInputElement>("#search-query");
  const tagSelect = document.querySelector<HTMLElement>("#search-tag");
  const tagInput = tagSelect?.querySelector<HTMLInputElement>("[data-sw-select-input]");
  const status = document.querySelector<HTMLParagraphElement>("#search-status");
  const resultsList = document.querySelector<HTMLOListElement>("#search-results");
  const clearButton = document.querySelector<HTMLButtonElement>("#search-clear");
  const runtime = document.querySelector<HTMLElement>("#search-runtime");

  if (form && queryInput && tagSelect && tagInput && status && resultsList && runtime) {
    const events = new AbortController();
    const { signal } = events;
    const pagefindPath = `${import.meta.env.BASE_URL.replace(/\/$/, "")}/pagefind/pagefind.js`;
    const isDev = runtime.dataset.dev === "true";
    let sequence = 0;
    let pagefindPromise: Promise<PagefindApi> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const loadPagefind = () => {
      pagefindPromise ??= import(/* @vite-ignore */ pagefindPath) as Promise<PagefindApi>;
      return pagefindPromise;
    };

    const setStatus = (message: string) => {
      status.textContent = message;
    };

    const makeResult = (item: PagefindResultData, query: string): HTMLLIElement | null => {
      if (!item.url || item.url.startsWith("//")) return null;

      const href = new URL(item.url, window.location.origin);
      if (href.origin !== window.location.origin) return null;

      const title = item.meta?.title?.trim() || "Untitled post";
      const row = document.createElement("li");
      row.className = "search-result";
      const link = document.createElement("a");
      link.href = `${href.pathname}${href.search}${href.hash}`;
      link.textContent = title;
      link.className = "search-result-link";
      const heading = document.createElement("h2");
      heading.append(link);

      const date = item.meta?.date;
      if (date) {
        const time = document.createElement("time");
        time.dateTime = date;
        const parsed = new Date(date);
        time.textContent = Number.isNaN(parsed.valueOf())
          ? date
          : parsed.toLocaleDateString("en-GB", { year: "numeric", month: "short", day: "numeric" });
        time.className = "search-result-date";
        row.append(time);
      }

      row.append(heading);
      const excerpt = query
        ? item.plain_excerpt?.trim() || item.meta?.description?.trim()
        : item.meta?.description?.trim();
      if (excerpt) {
        const paragraph = document.createElement("p");
        paragraph.className = "search-result-excerpt";
        // Decode Pagefind's escaped text without interpreting it as HTML.
        const entities: Record<string, string> = {
          amp: "&",
          lt: "<",
          gt: ">",
          quot: '"',
          "#39": "'",
        };
        paragraph.textContent = excerpt.replace(
          /&(amp|lt|gt|quot|#39);/g,
          (_, name: string) => entities[name] ?? "",
        );
        row.append(paragraph);
      }

      return row;
    };

    const runSearch = async () => {
      if (timer) clearTimeout(timer);
      timer = undefined;
      const currentSequence = ++sequence;
      const query = queryInput.value.trim();
      const tag = tagInput.value;

      if (clearButton) clearButton.hidden = !query && !tag;
      resultsList.setAttribute("aria-busy", "true");
      setStatus("Searching…");
      try {
        const pagefind = await loadPagefind();
        const filters: Record<string, string> = { type: "post" };
        if (tag) filters.tag = tag;
        const search = await pagefind.search(query || null, { filters });
        const data = await Promise.all(search.results.map((result) => result.data()));
        if (currentSequence !== sequence) return;

        if (!query) data.sort((a, b) => (b.meta?.date ?? "").localeCompare(a.meta?.date ?? ""));
        const rows = data
          .map((item) => makeResult(item, query))
          .filter((row): row is HTMLLIElement => row !== null);
        resultsList.replaceChildren(...rows);
        const context = [query ? `for “${query}”` : "", tag ? `in ${tag}` : ""]
          .filter(Boolean)
          .join(" ");
        setStatus(
          `${rows.length} post${rows.length === 1 ? "" : "s"}${context ? ` ${context}` : ""}.`,
        );
        if (rows.length === 0)
          setStatus("No matching posts. Try a shorter phrase or choose another topic.");
      } catch {
        if (currentSequence !== sequence) return;
        resultsList.replaceChildren();
        pagefindPromise = undefined;
        setStatus(
          isDev
            ? "The local search index has not been built yet. Run pnpm build, then try again."
            : "Search is unavailable right now. Please try again later.",
        );
      } finally {
        if (currentSequence === sequence) resultsList.setAttribute("aria-busy", "false");
      }
    };

    const scheduleSearch = () => {
      sequence += 1;
      resultsList.setAttribute("aria-busy", "true");
      setStatus("Searching…");
      if (clearButton) clearButton.hidden = !queryInput.value.trim() && !tagInput.value;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => void runSearch(), 250);
    };

    const syncQuery = () => {
      const params = new URLSearchParams();
      const query = queryInput.value.trim();
      const tag = tagInput.value;
      if (query) params.set("q", query);
      if (tag) params.set("tag", tag);
      const suffix = params.toString();
      window.history.replaceState(
        window.history.state,
        "",
        suffix ? `?${suffix}` : window.location.pathname,
      );
    };

    const restoreQuery = () => {
      const params = new URLSearchParams(window.location.search);
      queryInput.value = params.get("q") ?? "";
      const requestedTag = params.get("tag") ?? "";
      const validTag = (JSON.parse(tagSelect.dataset.topics ?? "[]") as string[]).includes(
        requestedTag,
      );
      const tag = validTag ? requestedTag : "";
      tagSelect.dataset.defaultValue = tag;
      tagSelect.dispatchEvent(
        new CustomEvent("starwind:set-value", { detail: { value: tag, emit: false } }),
      );
      tagInput.value = tag;
      if (clearButton) clearButton.hidden = !queryInput.value.trim() && !tag;
    };

    restoreQuery();
    form.addEventListener(
      "submit",
      (event) => {
        event.preventDefault();
        syncQuery();
        void runSearch();
      },
      { signal },
    );
    queryInput.addEventListener(
      "input",
      () => {
        syncQuery();
        scheduleSearch();
      },
      { signal },
    );
    tagSelect.addEventListener(
      "starwind:value-change",
      () => {
        // Starwind announces the proposed value before updating its form input.
        queueMicrotask(() => {
          if (signal.aborted) return;
          syncQuery();
          void runSearch();
        });
      },
      { signal },
    );

    clearButton?.addEventListener(
      "click",
      (event) => {
        event.preventDefault();
        queryInput.value = "";
        tagSelect.dispatchEvent(
          new CustomEvent("starwind:set-value", { detail: { value: "", emit: false } }),
        );
        tagInput.value = "";
        syncQuery();
        queryInput.focus();
        void runSearch();
      },
      { signal },
    );

    window.addEventListener(
      "popstate",
      () => {
        restoreQuery();
        void runSearch();
      },
      { signal },
    );

    cleanupSearch = () => {
      events.abort();
      if (timer) clearTimeout(timer);
      sequence += 1;
    };

    if (queryInput.value || tagInput.value) void runSearch();
  }
};

initializeSearch();
document.addEventListener("astro:page-load", initializeSearch);
document.addEventListener("astro:before-swap", () => cleanupSearch?.());
