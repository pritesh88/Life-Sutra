# Life Sutra

Open-access research and knowledge platform for Indian Knowledge Systems.

## Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4

## Setup

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start local development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run typecheck` | TypeScript check |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

## Structure

```
src/
  app/                 # App Router pages, layout, sitemap, robots
  components/site/     # Site shell, nav, catalog cards, primitives
  components/ui/       # Optional shadcn primitives (not used by marketing pages yet)
  data/                # Static content + page metadata
  lib/                 # SEO helpers, site config, utils
public/                # Static assets and research paper downloads
```

Set `NEXT_PUBLIC_SITE_URL` in production so canonical URLs and the sitemap resolve correctly.
