import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const tagSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use a lowercase ASCII tag slug.");

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z
    .object({
      title: z.string().trim().min(1),
      description: z.string().trim().min(1),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      tags: z.array(tagSchema).default([]),
      draft: z.boolean().default(false),
      sample: z.boolean().default(false),
    })
    .superRefine((data, context) => {
      if (data.updatedDate && data.updatedDate < data.pubDate) {
        context.addIssue({
          code: "custom",
          path: ["updatedDate"],
          message: "updatedDate must be on or after pubDate.",
        });
      }

      if (new Set(data.tags).size !== data.tags.length) {
        context.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Tags must be unique within a post.",
        });
      }
    }),
});

export const collections = { blog };
