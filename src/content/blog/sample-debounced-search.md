---
title: "Search without letting an old response win"
description: "Debounce a text input and ignore stale asynchronous results."
pubDate: 2026-10-16
tags: ["typescript", "search"]
sample: true
---

Suppose someone types `sqlite`, then quickly changes the query to `go`. The first request may finish last. Without a freshness check, results for SQLite can replace the more recent Go results.

## Give each edit a generation

This browser fragment assumes an input named `query` and application functions named `render` and `showError`.

```ts
let generation = 0;
let timer: ReturnType<typeof setTimeout>;

query.addEventListener("input", () => {
  const current = ++generation;
  const term = query.value.trim();
  clearTimeout(timer);

  timer = setTimeout(async () => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result: unknown = await response.json();
      if (current !== generation) return;
      render(result);
    } catch (error) {
      if (current === generation) showError(error);
    }
  }, 200);
});
```

Increment the generation as soon as the input changes, not only when the next request begins. That closes the window during the debounce delay.

## Keep the old list while loading

Clearing every row on each keystroke makes the page jump. Keep the previous results visible, announce that a search is in progress, and replace them when the current request finishes. The [accessible search note](/blog/sample-accessible-search/) covers the status message.
