---
title: "Conditional requests for a gallery response"
description: "Use an ETag to avoid sending an unchanged representation again."
pubDate: 2026-10-13
tags: ["http", "performance"]
sample: true
---

A client can ask whether its cached representation is still current. An ETag identifies the representation, and `If-None-Match` carries the previously observed value back to the server.

## Walk through the exchange

```http
GET /api/images HTTP/1.1
Host: localhost:8080
If-None-Match: "gallery-v7"
```

If the selected representation has not changed, the server can respond without sending the JSON body again:

```http
HTTP/1.1 304 Not Modified
ETag: "gallery-v7"
Cache-Control: private, max-age=0, must-revalidate
```

If it has changed, return the normal response body with the new validator. The sample tag above is illustrative; a real validator must change whenever the corresponding representation changes.

## Watch the representation boundary

A public list and a private list are different representations. Do not reuse one global validator for different users' visible content. Likewise, thumbnails produced at different sizes need distinct cache identities.

Conditional requests save bandwidth, but they do not automatically eliminate the database query used to construct the response. Compare that cost with the [indexed listing query](/blog/sample-sqlite-indexes/) before deciding where caching belongs.
