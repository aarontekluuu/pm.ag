export type MarketThemeKey =
  | "trump"
  | "politics"
  | "crypto"
  | "macro"
  | "tech"
  | "sports"
  | "entertainment"
  | "climate"
  | "health"
  | "other";

export interface MarketTheme {
  key: MarketThemeKey;
  label: string;
  description: string;
  accentClass: string;
  borderClass: string;
  chipClass: string;
  keywords: string[];
}

export const marketThemes: MarketTheme[] = [
  {
    key: "trump",
    label: "Trump",
    description: "Markets tied to Donald Trump, his campaign, or outcomes.",
    accentClass: "text-terminal-warn",
    borderClass: "border-terminal-warn/40",
    chipClass: "bg-terminal-warn/15 text-terminal-warn",
    keywords: ["trump", "donald", "maga"],
  },
  {
    key: "politics",
    label: "Politics",
    description: "Elections, policy, and government outcomes.",
    accentClass: "text-terminal-accent",
    borderClass: "border-terminal-accent/40",
    chipClass: "bg-terminal-accent/15 text-terminal-accent",
    keywords: [
      "election",
      "president",
      "whitehouse",
      "white house",
      "congress",
      "senate",
      "house",
      "biden",
      "democrat",
      "republican",
      "gop",
      "campaign",
      "governor",
      "primary",
    ],
  },
  {
    key: "crypto",
    label: "Crypto",
    description: "Tokens, blockchains, and digital asset markets.",
    accentClass: "text-terminal-cyan",
    borderClass: "border-terminal-cyan/40",
    chipClass: "bg-terminal-cyan/15 text-terminal-cyan",
    keywords: [
      "bitcoin",
      "btc",
      "ethereum",
      "eth",
      "solana",
      "sol",
      "doge",
      "dogecoin",
      "crypto",
      "blockchain",
      "token",
      "defi",
      "exchange",
      "etf",
      "stablecoin",
    ],
  },
  {
    key: "macro",
    label: "Macro",
    description: "Rates, inflation, growth, and the economy.",
    accentClass: "text-terminal-warn",
    borderClass: "border-terminal-warn/30",
    chipClass: "bg-terminal-warn/10 text-terminal-warn",
    keywords: [
      "fed",
      "rate",
      "inflation",
      "cpi",
      "gdp",
      "recession",
      "jobs",
      "unemployment",
      "economy",
    ],
  },
  {
    key: "tech",
    label: "Tech & AI",
    description: "AI, software, and major tech companies.",
    accentClass: "text-terminal-accent",
    borderClass: "border-terminal-accent/40",
    chipClass: "bg-terminal-accent/15 text-terminal-accent",
    keywords: [
      "ai",
      "openai",
      "chatgpt",
      "anthropic",
      "claude",
      "llm",
      "model",
      "nvidia",
      "amd",
      "apple",
      "tesla",
      "microsoft",
      "google",
      "alphabet",
      "meta",
      "amazon",
      "xai",
      "chip",
    ],
  },
  {
    key: "sports",
    label: "Sports",
    description: "Leagues, championships, and major sporting events.",
    accentClass: "text-terminal-cyan",
    borderClass: "border-terminal-cyan/30",
    chipClass: "bg-terminal-cyan/10 text-terminal-cyan",
    keywords: [
      "nfl",
      "nba",
      "mlb",
      "nhl",
      "soccer",
      "football",
      "premier",
      "champions league",
      "ufc",
      "boxing",
      "formula",
      "f1",
      "fifa",
      "uefa",
      "world cup",
      "super bowl",
      "olympic",
      "wimbledon",
      "masters",
      "grand slam",
      "championship",
    ],
  },
  {
    key: "entertainment",
    label: "Entertainment",
    description: "Movies, music, and culture outcomes.",
    accentClass: "text-terminal-accent",
    borderClass: "border-terminal-accent/30",
    chipClass: "bg-terminal-accent/10 text-terminal-accent",
    keywords: [
      "oscar",
      "grammy",
      "emmy",
      "golden globe",
      "movie",
      "film",
      "music",
      "album",
      "tour",
      "taylor",
      "swift",
      "box office",
    ],
  },
  {
    key: "climate",
    label: "Climate",
    description: "Weather, climate, and environmental markets.",
    accentClass: "text-terminal-cyan",
    borderClass: "border-terminal-cyan/30",
    chipClass: "bg-terminal-cyan/10 text-terminal-cyan",
    keywords: [
      "hurricane",
      "climate",
      "weather",
      "temperature",
      "rain",
      "snow",
      "wildfire",
      "earthquake",
      "el nino",
      "la nina",
    ],
  },
  {
    key: "health",
    label: "Health",
    description: "Public health, medicine, and biotech outcomes.",
    accentClass: "text-terminal-warn",
    borderClass: "border-terminal-warn/30",
    chipClass: "bg-terminal-warn/10 text-terminal-warn",
    keywords: ["covid", "flu", "vaccine", "health", "disease", "cancer"],
  },
  {
    key: "other",
    label: "Other",
    description: "Everything else across markets.",
    accentClass: "text-terminal-text",
    borderClass: "border-terminal-border",
    chipClass: "bg-terminal-border/40 text-terminal-text",
    keywords: [],
  },
];

function tokenizeTitle(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);
}

function matchesKeyword(title: string, tokens: Set<string>, keyword: string): boolean {
  const normalized = keyword.toLowerCase();
  if (normalized.includes(" ")) {
    return title.includes(normalized);
  }
  return tokens.has(normalized);
}

function buildThemeText(title: string, hints: string[]): { text: string; tokens: Set<string> } {
  const base = [title, ...hints].filter(Boolean).join(" ").toLowerCase();
  return {
    text: base,
    tokens: new Set(tokenizeTitle(base)),
  };
}

function scoreThemeMatch(
  normalizedText: string,
  tokens: Set<string>,
  theme: MarketTheme
): number {
  let score = 0;
  for (const keyword of theme.keywords) {
    if (matchesKeyword(normalizedText, tokens, keyword)) {
      score += keyword.includes(" ") ? 2 : 1;
    }
  }
  return score;
}

export function classifyMarketTheme(
  title: string,
  hints: Array<string | undefined> = []
): MarketThemeKey {
  const { text, tokens } = buildThemeText(title, hints.filter(Boolean) as string[]);
  let bestTheme: MarketThemeKey = "other";
  let bestScore = 0;

  for (const theme of marketThemes) {
    if (theme.key === "other") {
      continue;
    }
    const score = scoreThemeMatch(text, tokens, theme);
    if (score > bestScore) {
      bestScore = score;
      bestTheme = theme.key;
    }
  }

  return bestScore > 0 ? bestTheme : "other";
}
