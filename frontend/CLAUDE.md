# Planet-Zone frontend

React single-page app with two products behind one entry point: the customer **storefront** and the **admin dashboard** (`/admin/*`). It talks to the API in `../backend`.

Stack: React 18, Vite 4, React Router 6, Redux Toolkit, Tailwind 3, Ant Design 6, framer-motion, Recharts, lucide-react, axios. JavaScript only (no TypeScript).

## Commands

Run from `frontend/`:

```bash
npm install
npm run dev       # http://localhost:5173, proxies /api to the backend
npm run build     # outputs to dist/
npm run lint
npm run preview
```

- **`axios` isn't in this `package.json`.** It resolves from the repo root's `node_modules`, so run `npm install` at the root as well, or the build fails.
- There is no test framework. Verify with `npm run build` and by exercising the screen in a browser.
- `npm run lint` currently fails with 424 problems: 413 `react/prop-types` errors (the codebase doesn't use PropTypes), 10 `react-refresh` warnings and 1 `exhaustive-deps` warning. Check that a change adds no new kinds of problem rather than expecting a clean run.

Env (`.env.example`; all optional in development):

| Variable | Purpose | Default |
|---|---|---|
| `VITE_PUBLIC_URL` | API base URL; leave empty to use the dev proxy | empty |
| `VITE_API_PROXY_TARGET` | Where the dev proxy sends `/api` | `http://localhost:8000` |
| `VITE_PORT` | Dev server port | `5173` |

## Layout

```
src/
  main.jsx             providers: Redux > theme > toast > router > error boundary
  App.jsx              restores the session, splits /admin from the store, legacy redirects
  api/                 one module per domain, all using api/axios.js
  hooks/useApi.js      useApi, useMutation, useDebounced, useListParams
  redux/               store plus slices
  components/ui/       shared design-system components
  components/charts/   ChartKit (Recharts wrappers)
  features/store/      StoreRoutes, components, hooks, pages, pages/auth
  features/admin/      AdminRoutes, components, pages
  theme/               ThemeProvider, AppThemeProvider, antdTheme, presets, chartPalette
  styles/              tokens.css, typography.css
  lib/                 cn, format
  utils/functions.js   session storage helpers, Razorpay script loader
```

## Conventions

**Data fetching**
- Screens fetch their own data with `useApi(fetcher, params, options)`, which returns `{ data, meta, loading, error, refetch, setData }`. There is no server-cache library. Don't add one, and don't prefetch catalogue data in `App.jsx`.
- Writes use `useMutation`. Its `mutate` rethrows, so handle failures at the call site.
- Paginated lists use `useListParams` and pass its `params` to `useApi`. Sort strings look like `createdAt:desc`.
- Put API calls in `src/api/*`, using the instance from `api/axios.js`, which attaches the bearer token and handles 401s. API functions return `response.data`, the envelope `{ status, message, data, meta }`, and `useApi` unwraps `data` and `meta` from it.

**State**
- Redux holds only the session (`user`) and the cart (`cart`, persisted to `localStorage`). Everything else stays in component state.
- In storefront code, use the `useCart()` and `useSession()` hooks from `features/store/hooks/useStorefront.js`.
- Cart prices are display-only. The server prices the order, and `toOrderCart()` sends only identity and quantity. Show totals from `/api/orders/quote` at checkout.
- `localStorage` keys: `token`, `userId`, `admin`, `cart`, `planet.appearance`. Whether a user is an admin comes from the API response, not the stored `admin` flag.

**Routing**
- `features/store/StoreRoutes.jsx` and `features/admin/AdminRoutes.jsx` own their routes. Customer-only screens go under the single `<RequireAuth />` route; don't guard screens individually.
- Lazy-load anything behind a click. Only `Home`, `Shop` and `ProductDetail` load eagerly. Keep admin-only code and Recharts out of the storefront bundle.
- Auth screens sit outside `StoreLayout` on purpose, so they render without the store header.
- Keep the legacy redirects in `App.jsx` (`/dashboard`, `/addProduct`, `/mails`, `/shipping`, `/payment`, and so on).

**UI and styling**
- Use `components/ui/*` first. **Import `antd` only inside `components/ui/` and `theme/AppThemeProvider.jsx`**; screens get `Table`, `Select`, `Modal` and `Tabs` through the wrappers (`DataTable`, `Field`, `Modal`, `Tabs`). MUI was removed, so don't bring it back.
- Style with Tailwind utilities bound to the role tokens in `styles/tokens.css`: `bg-surface`, `text-content-secondary`, `border-line`, `bg-accent`, `text-status-good`, `text-page`, `h-control`.
- **Don't use raw colours or `dark:` variants.** Tokens already resolve for both themes. New colours need a token in both the light and dark blocks, plus a binding in `tailwind.config.js`.
- `--accent-*` values are written at runtime by `ThemeProvider` from the selected preset, so they have no fixed values in the CSS. Dark mode is driven by `data-theme` on `<html>`; with the `system` setting the attribute is absent and a media query applies.
- Chart colours come from `theme/chartPalette.js` via `ChartKit`. They deliberately don't follow the accent colour, because colour identifies the series.
- Join conditional classes with `cn` from `lib/cn.js`, format money and dates with `lib/format.js`, and use `useToast` for notifications.
- Every data screen handles loading (`Skeleton*`), error (`ErrorState`) and empty (`EmptyState`) states.
- `features/admin/components/StatusBadge.jsx` only re-exports `components/ui/StatusBadge.jsx`. Edit the shared one.

## Known issues

Found by reading the code on 2026-11-07 and not yet fixed. Remove an entry when it's fixed.

1. **Online checkout looks broken after the customer is charged.** `Checkout.jsx` passes `razorpay_payment_id` as `paymentId`, but the backend looks payments up by Razorpay order id. See `../backend/CLAUDE.md`.
2. **Variants of one product overwrite each other in the cart.** `cartSlice` and the `useCart` helpers identify lines by `_id` alone, so adding a second variant replaces the first, and quantity changes and removals can't target a single variant. The API treats variants as separate lines.
3. **Staff and managers can't open the dashboard.** `AdminRoutes` requires `isAdminLogged`, which is true only for `admin`, while most admin APIs accept `staff` and above.
4. **Unused code:** the `products` and `order` Redux slices are registered but nothing reads them, `api/shippingApi.js` is never imported, and `getPublicSettings` has no callers.
