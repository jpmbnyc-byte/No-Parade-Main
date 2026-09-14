# No Parade — brand hub

A single static page (`index.html` + `styles.css`, no build step, no
framework) that sits at `noparade-store.com` and routes visitors to
each brand:

- **Bayonne Athletics** → `ba.noparade-store.com` (live)
- **No Parade F.C.** → `npfc.noparade-store.com` (live once the domain
  below is added in Shopify)
- **Letters to God** → coming soon, no link yet
- **Human Weather** → coming soon, no link yet

There is intentionally no backend here — no server, no database, no
build. It's a router, not a store. Each brand keeps its own commerce
stack (see "Backend shape" below).

## Deploy (Vercel)

1. Import this repo in the Vercel dashboard (Add New → Project).
2. Framework preset: **Other**. No build command, no install command,
   no output directory override needed — Vercel serves the repo root
   as static files.
3. Add the custom domains in Vercel → Project Settings → Domains:
   `noparade-store.com` and `www.noparade-store.com`.

## Domain / DNS plan

This is the part that needs manual changes outside of code — nothing
here can be pushed from a repo:

1. **Root + www → Vercel.** In whatever DNS provider holds
   `noparade-store.com` (Cloudflare, based on the Bayonne Athletics
   repo), point the apex and `www` at Vercel using the records Vercel
   shows when you add the domain in its dashboard.
2. **`ba.noparade-store.com` → Bayonne Athletics.** The Bayonne
   Athletics repo's `wrangler.jsonc` has already been updated to claim
   `ba.noparade-store.com` as its Cloudflare Worker custom domain
   (instead of the bare root, which it claimed before). Once that
   Worker is deployed, add the `ba` subdomain as a custom domain on it
   in the Cloudflare dashboard.
3. **`npfc.noparade-store.com` → No Parade F.C.'s Shopify store.**
   Today, that Shopify store's primary domain is the bare root
   (`noparade-store.com`) — the same domain this hub needs. In Shopify
   admin → Settings → Domains:
   - Add `npfc.noparade-store.com` as a domain on the store and verify
     it (Shopify will give you a CNAME to add at your DNS provider).
   - Once it resolves and checkout works on the new subdomain, remove
     `noparade-store.com` / `www` from the Shopify store's domains so
     they're free for step 1.
   - **Order matters:** don't free the root domain from Shopify until
     the `npfc` subdomain is verified and taking orders correctly, or
     the No Parade F.C. storefront goes dark in between.
4. Bayonne Athletics' Shopify product-data calls
   (`src/lib/shopify.ts`, `kit.shopify.domain`) currently point at
   `https://noparade-store.com`. Because Shopify serves a store's
   `/products/<handle>.js` endpoint from *any* domain connected to that
   store, this should keep working once `npfc.noparade-store.com` is
   the primary domain — but it's worth switching that config to the
   store's permanent `*.myshopify.com` address at some point, so it
   never breaks again if the custom domain changes.

## Backend shape for this kind of multi-brand setup

Answering "what do we need on the back end" directly: nothing new for
the hub itself, but it's worth being explicit about who owns what,
since two brands currently share one Shopify store:

- **This hub**: static only. No accounts, no cart, no data. If you
  ever want it to do more (a mailing list signup, a shared "sign in
  across brands" account), that's the point where it would need an
  actual backend — not needed today.
- **Bayonne Athletics**: its own TanStack Start app on Cloudflare
  Workers, Stripe for checkout (`src/lib/checkout.functions.ts`), and
  a *read-only* Shopify integration purely for product/variant data —
  it never sends orders to Shopify.
- **No Parade F.C.**: full Shopify storefront + checkout, Teeinblue
  for the jersey customizer/print files, fulfillment via Printful (per
  the plan doc).
- **Shared Shopify store**: since Bayonne Athletics reads product data
  from the same Shopify instance No Parade F.C. sells from, keep the
  two brands' products cleanly tagged/collectioned in Shopify admin so
  neither brand's catalog, sitemap, or search leaks into the other's
  storefront.
- **Analytics**: worth putting one shared analytics property (GA4 or
  Plausible) across all subdomains with cross-domain tracking enabled,
  once `ba.` and `npfc.` are both live, so you can see how much traffic
  the hub is actually sending each way.

## What I could not do from here

No access to your Vercel, Cloudflare, or Shopify accounts, so none of
the DNS/domain steps above could be done directly — they need to
happen in each of those dashboards by hand.
