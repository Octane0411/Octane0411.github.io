import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ base: "./src/content/blog", pattern: "**/*.{md,mdx}" }),
  schema: z.object({
    title: z.string(),
    // Reused as the meta description AND the answer-first summary for GEO.
    // Keep it a self-contained 1-2 sentence answer (~40-80 words).
    description: z.string(),
    date: z.coerce.date(),
    // Update this when you refresh a post; AI engines weight freshness.
    updated: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    // Optional explicit "Key Takeaways" block, rendered + fed to crawlers.
    tldr: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
