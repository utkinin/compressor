/** Finite paths actually linked by the supplied original scaffold. No keyword permutations. */
export const legacyPaths = {
  solutions: {
    "nitrogen-boosting": "/solutions/nitrogen-booster-after-generator/",
    "process-gas-skid": "/solutions/compressor-skid/",
  },
  knowledge: {
    "how-to-select": "/knowledge/what-to-specify-for-gas-compressor/",
    "oil-free": "/knowledge/oil-free-compression/",
  },
  industries: {
    manufacturing: "/industries/machine-building/",
    laboratory: "/industries/research-laboratories/",
    testing: "/industries/test-benches/",
    oem: "/industries/oem-equipment/",
    // The old engineering link came from the OEM integration solution, not an industry article.
    engineering: "/industries/oem-equipment/",
  },
} as const;

export type LegacyRouteGroup = keyof typeof legacyPaths;

export function legacyDestination(group: LegacyRouteGroup, slug: string): string | undefined {
  const paths: Readonly<Record<string, string>> = legacyPaths[group];
  return paths[slug];
}

export function legacySlugs(group: LegacyRouteGroup): { slug: string }[] {
  return Object.keys(legacyPaths[group]).map((slug) => ({ slug }));
}

export const legacyPathPairs = Object.entries(legacyPaths).flatMap(([group, entries]) =>
  Object.entries(entries).map(([slug, destination]) => ({ source: `/${group}/${slug}/`, destination })),
);
