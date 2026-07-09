<p align="center">
  <img src="public/BimaOS_logo_horizontal.png" alt="BimaOS" width="280">
</p>

# BimaOS — Insurance for Every African

Open insurance infrastructure for Africa. Get covered via USSD in under 3 minutes. AI-powered claims, blockchain trust, M-Pesa payouts.

Built for the Africa's Talking Insurtech Hackathon 2025.

## Core Features

- **USSD & SMS** — Buy insurance and file claims via USSD (no smartphone required)
- **AI Claims Processing** — Image analysis with confidence scoring, fraud detection
- **Blockchain Ledger** — Immutable claim/policy records on Stellar Soroban
- **M-Pesa Payouts** — Instant claim settlements via mobile money
- **Human-in-the-Loop** — Telegram-based adjuster review for flagged claims
- **Insurer Dashboard** — Claims management, analytics, USSD simulator

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (Turbopack) |
| Language | TypeScript |
| Styling | Tailwind CSS v4, shadcn/ui |
| Database | Supabase (PostgreSQL) |
| Blockchain | Stellar Soroban (simulated) |
| AI | Computer vision analysis (simulated) |
| USSD/SMS | Africa's Talking API |
| Mobile Money | M-Pesa API |
| Adjuster | Telegram Bot API |
| PWA | Service worker + manifest |

## Getting Started

```bash
npm install
cp .env.example .env.local   # add your API keys
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# Africa's Talking (optional — simulated fallback)
AT_API_KEY=
AT_USERNAME=
AT_USSD_CODE=*384*XXX#

# Stellar (optional — simulated fallback)
STELLAR_SECRET_KEY=

# M-Pesa (optional — simulated fallback)
MPESA_CONSUMER_KEY=
MPESA_CONSUMER_SECRET=
MPESA_PASSKEY=

# Telegram (optional — simulated fallback)
TELEGRAM_BOT_TOKEN=
```

All services include simulated fallbacks so the app runs without external APIs.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (blockchain, claims, payments, etc.)
│   ├── auth/               # Authentication pages
│   ├── claims/             # Claims management
│   ├── dashboard/          # Insurer B2B portal
│   ├── products/           # Insurance product catalog
│   └── verify/             # Telegram adjuster interface
├── components/             # Reusable UI components
│   ├── dashboard/          # Dashboard-specific components
│   ├── landing/            # Landing page sections
│   ├── shared/             # Shared components (Logo, etc.)
│   ├── theme/              # Theme provider and toggle
│   └── ui/                 # shadcn/ui primitives
├── lib/                    # Utilities and API helpers
│   ├── ai.ts               # AI claim analysis engine
│   ├── blockchain.ts       # Stellar ledger integration
│   ├── payment.ts          # M-Pesa integration
│   ├── products.ts         # Insurance product definitions
│   └── ussd.ts             # USSD menu builder
└── types/                  # TypeScript type definitions
```

## Build

```bash
npm run build     # production build
npm run lint      # lint check
```

## Routes

| Path | Description |
|------|-------------|
| `/` | Landing page |
| `/auth/login` | Sign in / Sign up (email + password) |
| `/claims` | File and track claims |
| `/dashboard` | Insurer B2B portal |
| `/products` | Insurance product catalog |
| `/verify` | Telegram adjuster review |
| `/agents` | Agent portal |
| `/api/ussd` | USSD webhook handler |
| `/api/blockchain` | Blockchain ledger API |
| `/api/claims` | Claims processing API |
| `/api/payments` | Payment API |
| `/api/telegram` | Telegram bot webhook |
| `/api/verify` | Claims verification API |
| `/api/sms` | SMS notification API |

## License

MIT
