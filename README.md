# Brew & Co website

A three-page website for Brew & Co, a neighbourhood coffee shop in Brooklyn. It's plain HTML, CSS and JS, with no build step or dependencies. It's styled with the **Hearth** design system from `../docs/design`.

| Page | What's on it |
|---|---|
| `index.html` | A hero section, the most-loved dishes (rows marked `popular=yes` in the CSV), upcoming events, and opening hours |
| `menu.html` | Every row of `data/menu.csv`, grouped by category, with sticky category chips |
| `about.html` | The founders' story (Maya Okafor & Theo Lindqvist), values, a timeline and the team |

Every page's header has a **Reserve a table** button. It opens a dialog that asks for name, party size, date and time.

## Run it locally

The menu is loaded from `data/menu.csv` with `fetch()`. Browsers block that when you open the HTML directly from a `file://` address, so serve the folder instead. Either:

- in Claude Code, run `preview_start brew-and-co` (port 8771), or
- run any static server, for example:

  ```bash
  npx serve .
  ```

## Editing content

- **Menu:** edit `data/menu.csv`. The columns are `id,name,category,price,description,tags,popular,image`.
  - `tags` takes any of `vegan`, `gf` or `oat-milk`, separated by `|`.
  - `popular` is `yes` or `no`. The home page shows the first 6 `yes` items.
  - Categories appear in the order they first show up in the file.
  - Category notes live in `js/menu.js` (`CATEGORY_NOTES`).
- **Events** repeat weekly and are worked out from today's date (`EVENT_TYPES` in `js/site.js`):
  - Open Mic every Friday, 7–10pm
  - Cupping every Saturday, 9:30–11am
- **Opening hours** for booking time slots are in `HOURS` in `js/site.js`. If you change them, also update the "Visit us" block in `index.html`.
- **Design tokens:** `css/tokens.css` and `css/components.css` are copies of `docs/design`. Update them from there rather than editing them here.

## Reservations: not sent anywhere yet

Submitting the form checks the input, shows a confirmation, and saves the booking only in the visitor's own browser (`localStorage` key `brewAndCo.reservations.v1`). **The shop never receives it.** Before launch, connect it to a real backend, for example a Formspree form or a Vercel serverless function that emails the shop.

## Images

All photos are free stock images from [Pexels](https://www.pexels.com). They're stored locally in `public/images/` as resized `.webp` files, so the site makes no requests to Pexels. There are 41 files, about 2.2 MB in total.

They were made with the `optimise-images` skill (`.claude/skills/optimise-images`). Widths depend on how each image is shown: 1920px for the hero, 1200px for large about-page photos, and 800px for cards and menu items. To add or replace an image, run the skill's script with the photo's Pexels URL and a slug name, then reference `public/images/<slug>.webp`.

| File | Pexels photo |
|---|---|
| `espresso.webp` | [34563915](https://www.pexels.com/photo/34563915/) |
| `cortado.webp` | [15801056](https://www.pexels.com/photo/15801056/) |
| `cappuccino.webp` | [28496565](https://www.pexels.com/photo/28496565/) |
| `flat-white.webp` | [36851643](https://www.pexels.com/photo/36851643/) |
| `oat-latte.webp` | [36851642](https://www.pexels.com/photo/36851642/) |
| `americano.webp` | [5665246](https://www.pexels.com/photo/5665246/) |
| `mocha.webp` | [20854097](https://www.pexels.com/photo/20854097/) |
| `iced-latte.webp` | [18635176](https://www.pexels.com/photo/18635176/) |
| `pour-over.webp` | [11494420](https://www.pexels.com/photo/11494420/) |
| `chemex.webp` | [16645945](https://www.pexels.com/photo/16645945/) |
| `batch-brew.webp` | [21404851](https://www.pexels.com/photo/21404851/) |
| `cold-brew.webp` | [16284351](https://www.pexels.com/photo/16284351/) |
| `matcha.webp` | [14704657](https://www.pexels.com/photo/14704657/) |
| `chai.webp` | [2633403](https://www.pexels.com/photo/2633403/) |
| `hot-chocolate.webp` | [9228428](https://www.pexels.com/photo/9228428/) |
| `herbal-tea.webp` | [29387141](https://www.pexels.com/photo/29387141/) |
| `croissant.webp` | [14111071](https://www.pexels.com/photo/14111071/) |
| `almond-croissant.webp` | [13439698](https://www.pexels.com/photo/13439698/) |
| `pain-au-chocolat.webp` | [4828307](https://www.pexels.com/photo/4828307/) |
| `cinnamon-bun.webp` | [5662362](https://www.pexels.com/photo/5662362/) |
| `muffin.webp` | [3892468](https://www.pexels.com/photo/3892468/) |
| `loaf.webp` | [31430609](https://www.pexels.com/photo/31430609/) |
| `avocado-toast.webp` | [6327126](https://www.pexels.com/photo/6327126/) |
| `lox-bagel.webp` | [9691645](https://www.pexels.com/photo/9691645/) |
| `quiche.webp` | [37271785](https://www.pexels.com/photo/37271785/) |
| `grilled-cheese.webp` | [29747752](https://www.pexels.com/photo/29747752/) |
| `grain-bowl.webp` | [6895775](https://www.pexels.com/photo/6895775/) |
| `prosciutto.webp` | [6416558](https://www.pexels.com/photo/6416558/) |
| `cookie.webp` | [31323236](https://www.pexels.com/photo/31323236/) |
| `brownie.webp` | [38028993](https://www.pexels.com/photo/38028993/) |
| `carrot-cake.webp` | [31430610](https://www.pexels.com/photo/31430610/) |
| `cheesecake.webp` | [24206895](https://www.pexels.com/photo/24206895/) |
| `affogato.webp` | [14704659](https://www.pexels.com/photo/14704659/) |
| `hero-cafe-interior.webp` | [35518412](https://www.pexels.com/photo/35518412/) |
| `event-open-mic.webp` | [15789086](https://www.pexels.com/photo/15789086/) |
| `event-cupping.webp` | [34505585](https://www.pexels.com/photo/34505585/) |
| `about-founders.webp` | [36729740](https://www.pexels.com/photo/36729740/) |
| `about-roasting.webp` | [894695](https://www.pexels.com/photo/894695/) |
| `about-baking.webp` | [3218467](https://www.pexels.com/photo/3218467/) |
| `about-brownstones.webp` | [30726437](https://www.pexels.com/photo/30726437/) |
| `about-team.webp` | [9409745](https://www.pexels.com/photo/9409745/) |
