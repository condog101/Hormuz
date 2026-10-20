# Straight Outta Hormuz

Arcade top-down destroyer run through the Strait of Hormuz, dressed as a 90s rap album.
Big Don, a parody of Donald Trump, calls in from the studio with bars, ad-libs and bleeped
swearing while you run the strait. Phaser 3 + TypeScript client, Cloudflare Worker + D1
backend for MC-name profiles and a shared chart (leaderboard).

The plot: 2Pac is alive. Big Don's nephew saw him buying iced tea at a petrol station on Qeshm,
where MINISTRY RECORDS (the Ayatollah's label) has supposedly kept him in a studio since '96, so
Don sends you up the strait to rescue him. Before each campaign track Don posts a briefing as a
run of tweet cards (the first ones double as the tutorial, worded for whichever controls you're
using), and rappers reply. Pac keeps sneaking calls out mid-track. The twist is that he never
needed rescuing: he lives there, has a villa, and was just finishing an album. Don takes the
credit anyway. Everything is fictional satire; swearing stays bleeped.

In-game, a dialogue card only slides in for story moments (guest features and Pac's calls, with
Don's answer); on phones those freeze the game instead and show both lines full-size until you
tap. The rest of Don's running commentary scrolls past on a "DON LIVE" news ticker
along the bottom edge, over the land, and fades away when there's nothing to say.

From track 2 the shore carries a coast road, and lowriders (red Bloods or blue Crips, who have
signed to the Ayatollah's rival label) cruise it, slow down alongside the ship, flash
`! DRIVE-BY !` and spray a burst before peeling off. From track 3 a golden mic floats down the
strait once per track: collect it for a guest feature, and Big Don answers whatever the guest
said. Ice Cube brings ICE COLD (8 s untouchable, double fire rate); 2Pac brings DOUBLE UP
(+40 hull, 10 s of double kill points); Snoop brings LAID BACK (8 s with every hostile boat,
shell, missile and spawn at half speed); Dr. Dre brings THE DOCTOR (+30 hull, then +3 hull a
second for 10 s). The next mic never brings the same guest twice in a row.

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
E / Q (or right click) = DISS TRACKS, Esc = pause,
1/2/3 or Tab/mouse wheel = switch weapon.
A gamepad works too (left stick move, right stick aim, RT fire, X/B/RB DISS TRACKS,
LB flank, Y switch weapon).
On phones and tablets (coarse pointer) the game shows touch controls instead: an 8-way arrow
pad in the bottom-left moves, touching anywhere else aims the gun at that spot and fires while
held (THE 808 lobs to it), DISS / GUN / FLANK buttons sit on the right edge and `II` at
the top pauses. Story moments pause the game (a pause or story never eats the DISS recharge or a
guest buff), and the pause screen repeats the last story line. Phones wider than 16:9 get a
wider canvas (up to 1280x540) that fills the screen inside the notch-safe area instead of black
bars at the sides. Add
`?touch=1` to the URL to force the touch UI on desktop, or `?touch=0` to turn it off.

A run has three lives across all its tracks (the hull refills every track, lives don't). Losing the
last one ends the run; RUN IT BACK retries the track you fell off with a fresh three lives (hidden
tracks start again from the first), and clearing a track unlocks the next one for good.

Three main guns, all available from the start; the one in hand carries over between tracks:
THE NINE (fast machine gun), THE PUMP (six-pellet short-range shotgun) and THE 808 (a mortar
lobbed to the cursor, up to 380 px, whose blast hits everything within 70 px, shore guns
included).

DISS TRACKS sit beside the main guns: a salvo of five gold guided missiles that lock the nearest
five opps within 600 px (gold reticles on each) and curl round to hit them, incoming anti-ship
missiles included (the main guns can shoot those down too). It recharges over 12 s (the gold bar
in the HUD, and under the DISS button on touch); once charged the HUD icon blinks, the DISS
button flashes READY and DISS READY pops up over the ship. With no opps in range it says so
and keeps the charge.

## Tests

```bash
npm test                          # vitest: worker API, shared logic, level table, line lengths
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
- `web/src/systems`: coastline, spawner, HUD, story cards (typewriter + bleeps), the DON LIVE ticker, ad-libs, audio (ZzFX), saves
- `web/src/data`: `levels.ts` (tracklist and difficulty table), `quotes.ts` (Big Don's line bank and guest exchanges), `story.ts` (tweet briefings, ending, story beats), `balance.ts`
- `shared/`: progress merge and score plausibility, used by both client and Worker
- `worker/`: API routes, PIN hashing, D1 queries, migrations
- `tools/sprites`: Pillow sprite generator

Big Don is a parody of Donald Trump. Every line is fictional satire written for this game; none
are real quotes, and no real lyrics are quoted. Ice Cube, 2Pac, Snoop Dogg and Dr. Dre appear as caricatures; their
lines are invented for the game too, not quotes or lyrics. Swear words are written as `{word}` in
`quotes.ts` and always rendered bleeped.
