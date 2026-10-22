---
title: "Check file integrity with SHA-256"
description: "Compare a media file before and after copying it into an archive."
pubDate: 2026-10-11
tags: ["go", "testing"]
sample: true
---

An archive copy should contain the same bytes as the source. A checksum is a convenient way to compare them without keeping both complete files in memory.

## Hash a stream

```go
package archive

import (
    "crypto/sha256"
    "fmt"
    "io"
    "os"
)

func Checksum(path string) (string, error) {
    file, err := os.Open(path)
    if err != nil {
        return "", err
    }
    defer file.Close()

    hash := sha256.New()
    if _, err := io.Copy(hash, file); err != nil {
        return "", err
    }
    return fmt.Sprintf("%x", hash.Sum(nil)), nil
}
```

Compute the digest before copying, close the destination after writing, then hash the destination and compare. A mismatch should stop the import from being marked complete.

## Integrity is only one check

Matching digests do not prove that a file is a valid image or that its origin is trustworthy. They also do not replace a backup. Keep those responsibilities separate when recording import status.

This fits alongside the [SQLite transaction boundary](/blog/sample-sqlite-transactions/): database rows and filesystem writes do not share one atomic transaction, so a real importer needs a cleanup or recovery path for partially completed work.
