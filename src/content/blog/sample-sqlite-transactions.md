---
title: "Save an image and its tags in one transaction"
description: "Keep related rows together when importing images into SQLite."
pubDate: 2026-10-19
tags: ["go", "sqlite"]
sample: true
---

A media import writes more than one row. There is an image record, a set of tags, and the relationship between them. If the third insert fails, the first two should not be left behind as a partial import.

## Make the boundary explicit

This fragment belongs in a function that returns an error. The database tables already exist, and `imageID`, `path`, and `tagID` have been validated by the caller.

```go
tx, err := db.BeginTx(ctx, nil)
if err != nil {
    return err
}
defer tx.Rollback()

if _, err := tx.ExecContext(ctx,
    "INSERT INTO images (id, path) VALUES (?, ?)", imageID, path,
); err != nil {
    return err
}

if _, err := tx.ExecContext(ctx,
    "INSERT INTO image_tags (image_id, tag_id) VALUES (?, ?)", imageID, tagID,
); err != nil {
    return err
}

return tx.Commit()
```

The deferred rollback covers early returns. After a successful commit, calling rollback does not undo the committed transaction.

## A useful failure case

Try an invalid tag ID with foreign-key enforcement enabled on the connection. The relationship insert should fail, and the image insert should disappear with it. This is the sort of behavior to check in an integration test.

Next, add [an index for browsing](/blog/sample-sqlite-indexes/) rather than guessing which queries will be slow.
