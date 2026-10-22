---
title: "Treat an API response as unknown"
description: "Validate the small piece of JSON that the gallery actually needs."
pubDate: 2026-10-17
tags: ["typescript", "http"]
sample: true
---

A TypeScript annotation does not validate JSON received over the network. For the sample gallery, start with `unknown` and check the fields that the UI consumes.

## Parse at the boundary

```ts
type ImageSummary = { id: number; path: string };

function parseImage(value: unknown): ImageSummary {
  if (typeof value !== "object" || value === null) {
    throw new Error("Expected an image object");
  }
  if (!("id" in value) || typeof value.id !== "number") {
    throw new Error("Expected a numeric image ID");
  }
  if (!("path" in value) || typeof value.path !== "string") {
    throw new Error("Expected an image path");
  }
  return { id: value.id, path: value.path };
}
```

This parser is intentionally small. It checks structure, not whether a path is authorized or whether a number is a valid database ID. Those are separate decisions.

## Handle HTTP errors first

```ts
const response = await fetch("/api/images/42");
if (!response.ok) throw new Error(`HTTP ${response.status}`);
const image = parseImage(await response.json());
```

Keep the parsing boundary close to the network request so components receive a known shape. When search becomes interactive, also handle [out-of-order responses](/blog/sample-debounced-search/).
