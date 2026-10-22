---
title: "Test a Go handler without starting a server"
description: "Use httptest to check status codes and JSON response bodies."
pubDate: 2026-10-12
tags: ["go", "testing", "http"]
sample: true
---

A handler is already a function that accepts a response writer and a request. A small test can exercise that boundary without listening on a port.

## Record the response

```go
package main

import (
    "encoding/json"
    "net/http"
    "net/http/httptest"
    "testing"
)

func TestHealth(t *testing.T) {
    handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        _ = json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
    })
    request := httptest.NewRequest(http.MethodGet, "/health", nil)
    response := httptest.NewRecorder()
    handler.ServeHTTP(response, request)

    if response.Code != http.StatusOK {
        t.Fatalf("status = %d", response.Code)
    }
    var body map[string]string
    if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
        t.Fatal(err)
    }
    if body["status"] != "ok" {
        t.Fatalf("unexpected body: %v", body)
    }
}
```

In application code, call the actual handler constructor instead of declaring the sample handler inside the test. Inject the database or service dependency so failures can be exercised deliberately.

Useful follow-up cases include a missing image, a malformed ID, and an unauthorized private image. Database behavior belongs in a separate integration test, such as the rollback case in [the transaction note](/blog/sample-sqlite-transactions/).
