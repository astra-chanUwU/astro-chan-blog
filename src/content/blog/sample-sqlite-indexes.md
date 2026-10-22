---
title: "An index for the newest images query"
description: "Use EXPLAIN QUERY PLAN to inspect a SQLite listing query."
pubDate: 2026-10-18
tags: ["sqlite", "performance"]
sample: true
---

The library opens on the newest images. Its first query filters by visibility and sorts by creation time. An index should follow that access pattern.

## Inspect the query

```sql
CREATE INDEX images_visibility_created_id
ON images (visibility, created_at DESC, id DESC);

EXPLAIN QUERY PLAN
SELECT id, path, created_at
FROM images
WHERE visibility = 'public'
ORDER BY created_at DESC, id DESC
LIMIT 24;
```

The ID provides a stable tie-breaker when two images have the same timestamp. Without it, pagination can return a different order for otherwise equal rows.

## Measure with representative data

The query planner may choose differently for a tiny table. Load enough sample records to resemble the intended workload, inspect the plan, and measure the query. An index also costs storage and work on every insert.

```sql
SELECT id, path, created_at
FROM images
WHERE visibility = 'public'
  AND (created_at, id) < ('2026-10-12T10:00:00Z', 200)
ORDER BY created_at DESC, id DESC
LIMIT 24;
```

This second query demonstrates keyset pagination with consistently formatted timestamps. The next note uses the returned ID and path in a [TypeScript response parser](/blog/sample-typescript-response-types/).
