# No Parade — brand hub

A single static page (`index.html` + `styles.css`, no build step, no
framework) that sits at `noparade.store` and routes visitors to each
brand:

- **Bayonne Athletics** → `www.ba-athletics.com` (live) — its own fully
  independent domain, not a subdomain of this one.
- **No Parade F.C.** → `npfc.noparade.store` (live)
- **Letters to God** → coming soon, no link yet
- **Human Weather** → `humanweather.press` / `humanweather.social`
  (live, external domains, unrelated to this one)

There is intentionally no backend here — no server, no database, no
build. It's a router, not a store. Each brand keeps its own commerce
stack (see "Backend shape" below).

## Visual system

This isn't four unrelated tiles in a grid — it's one house (No Parade)
with four distinct worlds inside it, and the layout says so:

- **A header, not a masthead.** The identity is a 74px sticky bar: the
  mark, the name at label size, a hairline rule. It replaced a 417px
  masthead that stacked a mark, a 103px display wordmark and a tagline —
  three things all saying "No Parade", eating 46% of a 900px viewport
  before anything clickable appeared.
- **One 12-column asymmetric index, not a card grid.** Bayonne
  Athletics and No Parade F.C. are image-led and staggered, and each entry
  places its own image and caption in opposite columns: 01 runs image 1–8
  with its caption in 9–12 settled on the image's bottom edge, 02 mirrors
  it with a narrower image in 6–12 and its caption starting at the top of
  1–5. Captions used to sit *under* their images, which left a 519px
  column empty beside 01 for its full height and 435px beside 02. Letters to God is tucked
  into a narrow, off-axis column (3–6) — quiet, no image, because it
  has nothing to show yet. Human Weather runs full-width beneath a
  rule, set larger and more atmospheric than the shop entries above it.
- **One type system, divergent voices.** Manrope carries the numbering
  (`01`–`04`), the badges and the actions. Playfair Display carries every
  entry name, and its italic is reserved for Letters to God and Human
  Weather only — the interior and observational worlds — quieter, never
  used for commerce copy. These are the same two faces the shop uses, so
  the house reads as one system rather than two sites that happen to
  share a name.
- **Shared retail palette.** White ground, black and grey interface,
  colour only from the photography; black badges for status and black
  boxed actions, matching `npfc.noparade.store`. What is deliberately
  NOT shared is the shop's structure: this is an index of four worlds,
  not a product grid, so the asymmetric rhythm above survives the
  restyle intact.
- **No decorative imagery.** Letters to God has no photo yet, so it
  stays text-only rather than shipping a placeholder — the real book
  and writing photography belongs there once it exists, not as
  homepage decoration. Human Weather stays text-and-links for the same
  reason; its OG imagery is a future addition, not a stand-in hero.
- **Restraint stays the identity.** No card shadows, no rounded
  containers, no gradients, no glass, no carousel, no scroll animation.
  The masthead copy — "Choose where you're headed." — is unchanged;
  the brief was to make the existing restraint feel authored, not to
  replace it with marketing language.

Mobile collapses to a single column (all four entries full-width,
generous vertical rhythm) rather than re-flowing the desktop grid.

## Deploy (Vercel)

1. Import this repo in the Vercel dashboard (Add New → Project).
2. Framework preset: **Other**. No build command, no install command,
   no output directory override needed — Vercel serves the repo root
   as static files.
3. Add the custom domains in Vercel → Project Settings → Domains:
   `noparade.store` and `www.noparade.store`.

## Domain / DNS plan

This is the part that needs manual changes outside of code — nothing
here can be pushed from a repo:

1. **Root + www → Vercel.** At whatever DNS provider holds
   `noparade.store`, point the apex and `www` at Vercel using the
   records Vercel shows when you add the domain in its dashboard.
2. **`npfc.noparade.store` → No Parade F.C.** The `no-parade-fc` repo
   is its own Vercel project (a real app now — a 5-step jersey
   configurator with Stripe checkout, not Shopify/Teeinblue anymore).
   Add `npfc.noparade.store` as a domain on that Vercel project, then
   point a `CNAME` for `npfc` → `cname.vercel-dns.com` at your DNS
   provider.
3. **Bayonne Athletics needs nothing here.** It moved to its own
   dedicated domain, `www.ba-athletics.com`, entirely separate from
   `noparade.store` — no subdomain, no shared DNS zone, nothing to
   coordinate with this hub beyond the link in `index.html`.

## Backend shape for this kind of multi-brand setup

Answering "what do we need on the back end" directly: nothing new for
the hub itself, but it's worth being explicit about who owns what:

- **This hub**: static only. No accounts, no cart, no data. If you
  ever want it to do more (a mailing list signup, a shared "sign in
  across brands" account), that's the point where it would need an
  actual backend — not needed today.
- **Bayonne Athletics**: its own app on Vercel, Stripe for checkout
  (`src/lib/checkout.functions.ts`), and a *read-only* Shopify
  integration purely for product/variant data — it never sends orders
  to Shopify. Fully independent domain and deploy from everything
  else here.
- **No Parade F.C.**: its own Vercel app (`no-parade-fc`) — a 5-step
  "Build Your Crest" configurator with a live overlay preview and its
  own Stripe checkout (two Vercel Edge Functions), replacing the
  earlier Shopify + Teeinblue plan.
- **Human Weather / Letters to God**: entirely separate properties;
  this hub only links out, owns none of their infrastructure.
- **Analytics**: worth putting one shared analytics property (GA4 or
  Plausible) across the domains this hub actually controls
  (`noparade.store`, `npfc.noparade.store`) with cross-domain tracking
  enabled, so you can see how much traffic the hub sends each way.
  Bayonne Athletics and Human Weather are on independent domains, so
  they'd need their own instrumentation (or a shared property added
  separately to each).

## What I could not do from here

No access to your Vercel or DNS accounts, so none of the domain steps
above could be done directly — they need to happen in each of those
dashboards by hand.
