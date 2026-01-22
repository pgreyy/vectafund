# VectaFund 🚀

**Track Smart Money in Crypto** - Real-time fundraise alerts powered by Ethos reputation scores.

Built for the [Ethos Vibeathon 2025](https://vibeathon.ethos.network/)

![VectaFund Dashboard](https://via.placeholder.com/800x400?text=VectaFund+Dashboard)

## 🎯 What is VectaFund?

VectaFund helps crypto investors track fundraise announcements from top VCs, with a unique twist: every VC and investor is scored using [Ethos Network](https://ethos.network) reputation scores, helping you identify the most credible deals.

### Key Features

- 📊 **Live Fundraise Feed** - Real-time updates from major crypto news sources
- 🛡️ **Ethos Reputation Scores** - See credibility scores for every VC
- ⭐ **Follow VCs** - Track up to 5 VCs and get personalized alerts
- 📧 **Email Alerts** - Instant notifications when your followed VCs invest
- 🤖 **Telegram Bot** - Get alerts and query data via Telegram
- 📈 **Weekly Digest** - Top raises ranked by combined Ethos scores

## 🔗 Ethos Integration

VectaFund deeply integrates with Ethos Network:

1. **Score Display** - Every VC card shows their Ethos credibility score
2. **Score Badges** - Color-coded badges (🟢 High, 🟡 Medium, 🔴 Low)
3. **Profile Links** - Direct links to Ethos profiles for verification
4. **Ranking Algorithm** - Weekly digest ranks by combined investor Ethos scores
5. **API Integration** - Uses Ethos API v2 to fetch real-time scores

```typescript
// Example: Fetching Ethos score
const response = await fetch(
  `https://api.ethos.network/api/v2/user/by/x/${twitterHandle}`,
  { headers: { 'X-Ethos-Client': 'VectaFund@1.0.0' } }
)
const { score } = await response.json()
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account (free)
- Telegram Bot token (from @BotFather)
- Resend account for emails (free tier)

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/vectafund.git
cd vectafund
npm install
```

### 2. Set Up Environment

```bash
cp .env.example .env.local
```

Fill in your credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
RESEND_API_KEY=your_resend_api_key
```

### 3. Set Up Supabase

Create a new Supabase project, then run this SQL in the SQL Editor:

```sql
-- Users table (extends Supabase auth)
create table public.profiles (
  id uuid references auth.users primary key,
  email text,
  name text,
  avatar_url text,
  telegram_chat_id text,
  telegram_username text,
  email_notifications boolean default true,
  telegram_notifications boolean default false,
  notification_frequency text default 'realtime',
  created_at timestamp with time zone default now()
);

-- VCs table
create table public.vcs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  twitter_handle text unique not null,
  description text,
  website text,
  avatar_url text,
  category text not null,
  ethos_score integer,
  ethos_profile_url text,
  created_at timestamp with time zone default now()
);

-- User follows
create table public.user_follows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  vc_id uuid references public.vcs(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, vc_id)
);

-- Fundraises
create table public.fundraises (
  id uuid primary key default gen_random_uuid(),
  project_name text not null,
  project_description text,
  project_twitter text,
  amount_raised bigint,
  currency text default 'USD',
  round_type text,
  announced_date date not null,
  source_url text,
  source_name text,
  lead_investors text[],
  other_investors text[],
  total_ethos_score integer,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.user_follows enable row level security;

-- RLS Policies
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Users can manage own follows" on public.user_follows
  for all using (auth.uid() = user_id);
```

### 4. Enable OAuth (Optional)

In Supabase Dashboard:
1. Go to Authentication > Providers
2. Enable Google and/or Twitter
3. Add your OAuth credentials

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 6. Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

## 🤖 Telegram Bot Setup

1. Message [@BotFather](https://t.me/BotFather) on Telegram
2. Send `/newbot` and follow prompts
3. Copy the token to your `.env.local`
4. Run the bot separately:

```bash
npx ts-node src/lib/telegram-bot.ts
```

### Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Welcome message |
| `/subscribe` | Enable alerts |
| `/unsubscribe` | Disable alerts |
| `/follow <vc>` | Follow a VC |
| `/unfollow <vc>` | Unfollow a VC |
| `/following` | List followed VCs |
| `/latest` | Latest fundraises |
| `/top` | Top raises by Ethos |
| `/ethos <handle>` | Check Ethos score |

## 📁 Project Structure

```
vectafund/
├── src/
│   ├── app/
│   │   ├── page.tsx           # Landing page
│   │   ├── dashboard/         # Main dashboard
│   │   ├── auth/              # Login/Signup
│   │   └── api/               # API routes
│   ├── components/            # React components
│   ├── lib/
│   │   ├── ethos.ts          # Ethos API integration
│   │   ├── supabase/         # Supabase clients
│   │   ├── telegram-bot.ts   # Telegram bot
│   │   ├── rss.ts            # RSS feed parser
│   │   └── seed-data.ts      # Sample VC data
│   └── types/                 # TypeScript types
├── public/
├── .env.example
└── README.md
```

## 🎨 Design System

VectaFund uses a custom dark theme optimized for crypto users:

- **Colors**: Dark blacks (#0A0A0B) with emerald accent (#10B981)
- **Typography**: Playfair Display (display) + Instrument Sans (body)
- **Effects**: Subtle glows, noise texture, glass morphism

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (Email, Google, Twitter)
- **Styling**: Tailwind CSS
- **Email**: Resend
- **Telegram**: node-telegram-bot-api
- **Reputation**: Ethos Network API

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ethos?twitter=handle` | GET | Get Ethos score |
| `/api/vcs` | GET | List all VCs |
| `/api/fundraises` | GET | List fundraises |
| `/api/telegram` | POST | Telegram webhook |

## 🏆 Ethos Vibeathon

This project was built for the Ethos Vibeathon 2025, demonstrating:

1. **Novel use of Ethos scores** - Ranking investments by VC credibility
2. **Deep API integration** - Real-time score fetching
3. **User value** - Helping users identify trustworthy deals
4. **Full product** - Dashboard, Email, Telegram alerts

## 📝 License

MIT License - feel free to fork and build upon!

## 🙏 Credits

- [Ethos Network](https://ethos.network) for the reputation infrastructure
- Built with ❤️ for the Ethos community

---

**Questions?** Open an issue or reach out on Twitter!
