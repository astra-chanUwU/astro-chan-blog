---
title: "A small Go server with explicit timeouts"
description: "Start a media-library API with predictable request deadlines."
pubDate: 2026-10-20
tags: ["go", "http"]
sample: true
---

The sample project is a small media library: upload a file, give it a few tags, then find it again. Before adding a database, give the HTTP server explicit limits. A slow client should not keep a connection around indefinitely.

## Start with the server

```go
package main

import (
    "log"
    "net/http"
    "time"
)

func main() {
    mux := http.NewServeMux()
    mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusNoContent)
    })

    server := &http.Server{
        Addr:              ":8080",
        Handler:           mux,
        ReadHeaderTimeout: 5 * time.Second,
        ReadTimeout:       30 * time.Second,
        WriteTimeout:      30 * time.Second,
        IdleTimeout:       60 * time.Second,
    }
    log.Fatal(server.ListenAndServe())
}
```

These are sample limits, not universal defaults. A large upload may legitimately need longer than a health check. Streaming responses also deserve their own timeout policy.

## Try the route

```sh
curl -i http://localhost:8080/health
```

Expect status 204 and an empty response body. The next note adds [SQLite transactions](/blog/sample-sqlite-transactions/) so an image and its tags can be saved together.
