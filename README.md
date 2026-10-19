# Straight Outta Hormuz

Arcade top-down destroyer run through the Strait of Hormuz, dressed as a 90s rap album.
Big Don, a parody of Donald Trump, calls in from the studio with bars, ad-libs and bleeped
swearing while you run the strait. Phaser 3 + TypeScript client, Cloudflare Worker + D1
backend for MC-name profiles and a shared chart (leaderboard).

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
E (or right click) = CIWS burst, Esc = pause. A gamepad works too (left stick move,
right stick aim, RT fire, B/RB CIWS, LB flank).

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
because `web/src/scenes/Boot.ts` slices them by fixed frame size.

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
are real quotes, and no real lyrics are quoted. Swear words are written as `{word}` in
`quotes.ts` and always rendered bleeped.
