---
title: "A gallery grid without fixed card widths"
description: "Let CSS fit image tiles into the available space."
pubDate: 2026-10-14
tags: ["css", "accessibility"]
sample: true
---

The media library should work in a narrow window without asking JavaScript how many columns fit. CSS Grid can make that decision from the available space.

## Start with a flexible minimum

```css
.gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 1.25rem;
}

.gallery img {
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
}

.gallery a:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 4px;
}
```

The inner `min()` lets a tile shrink below fourteen rem when its container is smaller. `object-fit: cover` crops thumbnails; use the original image in the detail view so that the crop is not mistaken for missing content.

## Test the awkward content

Use a very long filename, an image that fails to load, and a title in another language. These are more useful checks than a grid filled only with matching landscape photographs.

Reserve image dimensions to reduce layout shifts. Keep meaningful alternative text in the HTML and leave decorative images with empty alt text. Next, check the [HTTP caching behavior](/blog/sample-http-etags/) of those thumbnails.
