# Opinion Arb Terminal

A real-time prediction market arbitrage dashboard built with Next.js, TypeScript, and Tailwind CSS. Powered by the Opinion OpenAPI.

## Features

- **Live Markets**: Real-time prediction market data from Opinion API
- **Edge Detection**: Visual highlighting of arbitrage opportunities (sum < 1)
- **Auto-refresh**: Configurable polling (15s default) with stale data indicators
- **Filter Controls**: Limit results, filter by minimum edge percentage
- **Terminal UI**: Dark theme with monospace fonts and terminal aesthetics

## Prerequisites

- Node.js 18+
- npm or yarn
- Opinion API key (contact the Opinion team)

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `OPINION_API_KEY` | Yes | Your Opinion API key |
| `OPINION_OPENAPI_BASE_URL` | Yes | `https://proxy.opinion.trade:8443/openapi` |

## Local Development

1. Copy the example environment file:

```bash
cp .env.example .env.local
```

2. Add your Opinion API key to `.env.local`

3. Install dependencies and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Deploy to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

### Manual Deployment

1. Push your code to GitHub
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository
3. Add environment variables in **Project Settings → Environment Variables**:
   - `OPINION_API_KEY` — Your Opinion API key
   - `OPINION_OPENAPI_BASE_URL` — `https://proxy.opinion.trade:8443/openapi`
4. Click **Deploy**

### Expected Routes

| Route | Description |
|-------|-------------|
| `/` | Markets dashboard with live prices |
| `/arbitrage` | Cross-platform arbitrage (Kalshi + Polymarket) |
| `/api/edges` | API endpoint for market edge data |

### Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

## Project Structure

```
├── app/
│   ├── api/edges/route.ts    # API endpoint with caching + Opinion integration
│   ├── arbitrage/page.tsx    # Arbitrage page (placeholder)
│   ├── context.tsx           # App-wide state (auto-refresh, wallet)
│   ├── page.tsx              # Markets dashboard
│   ├── layout.tsx            # Root layout with nav
│   ├── providers.tsx         # React Query provider
│   └── globals.css           # Global styles
├── components/
│   ├── NavBar.tsx            # Top navigation
│   ├── MarketCard.tsx        # Market card component
│   ├── FilterBar.tsx         # Filter controls
│   ├── ConnectWallet.tsx     # Wallet connection (MVP)
│   └── StatusIndicator.tsx   # Live/Paused status
├── lib/
│   ├── opinionClient.ts      # Server-side Opinion API client
│   ├── edge.ts               # Edge computation logic
│   ├── mock.ts               # Mock data for development
│   └── types.ts              # TypeScript types
└── types/
    └── index.ts              # Frontend type exports
```

## API Reference

### GET /api/edges

Returns market data with edge calculations.

**Query Parameters:**
- `limit` (number): Number of markets to return (default: 20, min: 5, max: 40)

**Response:**
```json
{
  "updatedAt": 1705320000000,
  "stale": false,
  "list": [
    {
      "marketId": 123,
      "marketTitle": "Will Bitcoin exceed $100K by end of 2025?",
      "volume24h": 125000,
      "yes": { "tokenId": "token-yes", "price": 0.45 },
      "no": { "tokenId": "token-no", "price": 0.48 },
      "sum": 0.93,
      "edge": 0.07,
      "updatedAt": 1705320000000
    }
  ]
}
```

**Stale Response (API failure):**
```json
{
  "updatedAt": 1705320000000,
  "stale": true,
  "list": [...],
  "error": "Opinion API temporarily unavailable"
}
```

## Architecture

- **Server-side only**: Opinion API calls happen server-side; API key never exposed to client
- **Caching**: 10-second TTL cache with request coalescing to reduce API load
- **Rate limiting**: Built-in concurrency limiter (max 10 inflight) + retry with backoff
- **Graceful degradation**: Returns stale cached data if Opinion API fails

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack React Query
- **Deployment**: Vercel

## License

MIT

