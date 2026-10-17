# Beer Caps (frontend)

The web app for a beer-cap collection: browse and search every cap, and (in admin mode) add caps from a phone camera and look after beers, brands, countries and backups. It talks to the [beer-cap-matcher](https://github.com/Exoodes/beer-cap-matcher) API.

React 19, Vite, TypeScript, [Mantine 8](https://mantine.dev), TanStack Query.

## Running it locally

```bash
npm install
npm run dev          # http://localhost:5173
```

The API is expected at `http://localhost:8000`. Point elsewhere with `VITE_API_BASE_URL` (e.g. in `.env.local`). The API only accepts requests from its configured frontend URL, so keep the dev server on port 5173.

**Admin mode:** open any page with `?admin_secret=<the API's admin token>`. The secret is kept on that device until you choose *Lock admin mode*.

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Type-check and build to `dist/` |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` | ESLint |
| `npx @biomejs/biome check --write src` | Format and sort imports |
| `npm run gen:api` | Regenerate `src/types/api.d.ts` from the running API's OpenAPI schema |

CI runs lint, Biome, tests and the build on every pull request. Merging to `master` deploys.

## Where things are

- `src/theme.ts`, `src/styles/global.css`: colours, type and design tokens
- `src/features/`: pages (collection, cap detail, add cap, admin)
- `src/components/`: shared UI (layout, image dropzone, cap card)
- `src/api/`: API calls; `src/types/`: types generated from the API
- `src/utils/search.ts`: diacritic-insensitive search used by every search box
