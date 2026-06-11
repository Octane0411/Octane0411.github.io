import { PROJECTS } from "@/consts";

// Fetches real star counts for the featured repos at build time.
// - Memoized as a single promise: one fetch batch per build/dev process.
// - Uses GITHUB_TOKEN when available (CI) to lift the rate limit to 5000/h.
// - Falls back to `fallbackStars` if the API is unreachable, so the build
//   never breaks on a network hiccup or rate limit.

export interface ProjectWithStars {
  repo: string;
  name: string;
  desc: string;
  lang: string;
  href: string;
  stars: number;
}

let cached: Promise<ProjectWithStars[]> | null = null;

async function fetchStars(repo: string): Promise<number | null> {
  const token =
    import.meta.env.GITHUB_TOKEN ?? process.env.GITHUB_TOKEN ?? undefined;
  try {
    const res = await fetch(`https://api.github.com/repos/${repo}`, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "octane-website-build",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!res.ok) {
      console.warn(`[github] ${repo} -> HTTP ${res.status}, using fallback`);
      return null;
    }
    const data = (await res.json()) as { stargazers_count?: number };
    return typeof data.stargazers_count === "number"
      ? data.stargazers_count
      : null;
  } catch (err) {
    console.warn(`[github] ${repo} fetch failed, using fallback:`, err);
    return null;
  }
}

export function getProjects(): Promise<ProjectWithStars[]> {
  cached ??= Promise.all(
    PROJECTS.map(async (p) => {
      const live = await fetchStars(p.repo);
      return {
        repo: p.repo,
        name: p.name,
        desc: p.desc,
        lang: p.lang,
        href: p.href,
        stars: live ?? p.fallbackStars,
      };
    }),
  );
  return cached;
}
