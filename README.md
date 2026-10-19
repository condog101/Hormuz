# Straight Outta Hormuz

Arcade top-down destroyer run through the Strait of Hormuz, dressed as a 90s rap album.
Big Don, a parody of Donald Trump, calls in from the studio with bars, ad-libs and bleeped
swearing while you run the strait. Phaser 3 + TypeScript client, Cloudflare Worker + D1
backend for MC-name profiles and a shared chart (leaderboard).

From track 2 the shore carries a coast road, and lowriders (red Bloods or blue Crips, who have
signed to the Ayatollah's rival label) cruise it, slow down alongside the ship, flash
`! DRIVE-BY !` and spray a burst before peeling off. From track 3 a golden mic floats down the
strait once per track: collect it for a guest feature. Ice Cube brings ICE COLD (8 s
untouchable, double fire rate); 2Pac brings DOUBLE UP (+40 hull, 10 s of double kill points).
The next mic brings the other guest.

The deployed Worker, D1 database, package name and localStorage keys still use the original
`hormuz-run` / `hormuz.*` names so the URL and saved progress survive the rebrand.

## Run locally

```bash
npm install
npm run db:migrate:local   # once: creates the local D1 tables
npm run dev                # Vite on :5173, Worker API on :8787 (proxied at /api)
```

Open http://localhost:5173.

Controls: WASD/arrows move, mouse aims, click/Space fires, Shift = flank speed,
E (or right click) = CIWS burst, Esc = pause, 1/2/3 or Tab/mouse wheel = switch weapon.
A gamepad works too (left stick move, right stick aim, RT fire, B/RB CIWS, LB flank,
Y switch weapon).

Three main guns, all available from the start; the one in hand carries over between tracks:
THE NINE (fast machine gun), THE PUMP (six-pellet short-range shotgun) and THE 808 (a mortar
lobbed to the cursor, up to 380 px, whose blast hits everything within 70 px, shore guns
included).

## Tests

```bash
npm test                          # vitest: worker API, shared logic, level table
python3 tools/sprites/test_gen.py # sprite sheet dimensions
```

## Sprites

`npm run sprites` (= `python3 tools/sprites/gen.py`) writes any missing sheet into
`web/public/assets/sprites/`. Existing files are never overwritten, so you can edit
them freely in LibreSprite. Regenerate one sheet with `--force NAME`, all with `--all`,
list frame sizes with `--list`. Keep each sheet's frame size and frame count the same,
because `web/src/scenes/Boot.ts` slices them by fixed frame size. `lowrider` (drive-by car,
red frames 0-4, blue 5-9), `guests` (Ice Cube and 2Pac portraits, closed/open mouth) and `mic`
(the guest-feature pickup) are the newest sheets; tiles 16-22 are the coast road, parked cars,
palm, tagged walls and the billboard.

## Deploy (Cloudflare, free tier)

```bash
npx wrangler login                        # once, opens the browser
npx wrangler d1 create hormuz-db          # once: copy the database_id into wrangler.toml
npm run db:migrate:remote                 # once (and after adding migrations)
npm run deploy                            # build + wrangler deploy
```

The game is then live at `https://hormuz-run.<your-subdomain>.workers.dev`.

## Layout

- `web/src/scenes`: Boot, Title, Login, LevelIntro, Game, LevelClear, GameOver, Leaderboard
- `web/src/entities`: player, enemies, projectiles
- `web/src/systems`: coastline, spawner, HUD, Big Don popups (typewriter + bleeps), ad-libs, audio (ZzFX), saves
- `web/src/data`: `levels.ts` (tracklist and difficulty table), `quotes.ts` (Big Don's line bank), `balance.ts`
- `shared/`: progress merge and score plausibility, used by both client and Worker
- `worker/`: API routes, PIN hashing, D1 queries, migrations
- `tools/sprites`: Pillow sprite generator

Big Don is a parody of Donald Trump. Every line is fictional satire written for this game; none
are real quotes, and no real lyrics are quoted. Ice Cube and 2Pac appear as caricatures; their
lines are invented for the game too, not quotes or lyrics. Swear words are written as `{word}` in
`quotes.ts` and always rendered bleeped.
