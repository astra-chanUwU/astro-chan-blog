---
title: "A search form that works with a keyboard"
description: "Use ordinary controls, a visible label, and a polite results announcement."
pubDate: 2026-10-15
tags: ["html", "search", "accessibility"]
sample: true
---

The library search needs a text field, a submit button, and a way to tell readers that results changed. Native HTML covers most of this before any custom interaction code is added.

## Give the form a useful structure

```html
<form action="/search/" method="get" role="search">
  <label for="query">Search the library</label>
  <input id="query" name="q" type="search" />
  <button type="submit">Search</button>
</form>
<p id="search-status" role="status" aria-live="polite"></p>
<ol id="search-results" aria-label="Search results"></ol>
```

A placeholder is a hint, not a replacement for a label. The query lives in the URL, which makes a result view shareable and lets a plain form submission remain useful.

## Announce the result count

```js
const status = document.querySelector("#search-status");
status.textContent = "3 matching images";
```

Do not move keyboard focus into the results automatically after every keystroke. The person may still be typing. Use a clear focus outline, keep the submit button reachable, and test the empty-result message.

For timing, pair this with [the stale-response guard](/blog/sample-debounced-search/). For presentation, the [CSS gallery note](/blog/sample-css-grid/) uses the same content-first approach.
