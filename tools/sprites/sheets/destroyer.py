"""USS NOTORIOUS: Arleigh Burke-class destroyer, top-down, bow to the right, with a candy-red
racing stripe, chrome VLS lids and a gold hull number. Turret drawn separately."""
from draw import (
    blob, bevel, darken, disc, dither, ellipse, fade, frame_rect, new, outline, paste, px, rect, ring, rng, rotate,
    strip, tint,
)
from palette import C

NAME = "destroyer"
FRAME = (64, 24)
FRAMES = 9

W, H = FRAME
CY = 12  # hull centre line sits between rows 11 and 12
TURRET = (46, 12)


def half_width(x):
    """Half-beam of the hull at column x (stern at x=2, bow tip at x=62)."""
    if x < 2 or x > 62:
        return 0
    if x == 2:
        return 4
    if x <= 4:
        return 5
    if x <= 36:
        return 6
    t = (62 - x) / 26
    return max(1, round(6 * t ** 0.55))


def hull():
    img = new(W, H)
    for x in range(2, 63):
        hw = half_width(x)
        for y in range(CY - hw, CY + hw):
            img.putpixel((x, y), C["hull"])
    bevel(img, light=0.18, dark=-0.32)
    # Bow knuckle line
    for x in range(47, 60):
        px(img, x, CY - 1, C["hull_lt"])
    # candy-red racing stripe down the hull side, fading into the bow
    for x in range(4, 54):
        px(img, x, CY + 4, C["candy"] if x < 46 else C["candy_dk"])
    for x in range(6, 44, 2):
        px(img, x, CY + 3, C["candy_dk"])
    return img


def vls(img, x0, y0, cols, rows):
    rect(img, x0, y0, x0 + cols * 2, y0 + rows * 2, C["hull_dk"])
    for cx in range(cols):
        for cy in range(rows):
            px(img, x0 + 1 + cx * 2, y0 + 1 + cy * 2, C["chrome"])


def superstructure(img):
    # drop shadow first so the blocks read as raised
    rect(img, 12, 8, 17, 16, C["hull_dk"])
    rect(img, 24, 8, 38, 16, C["hull_dk"])
    # hangar
    rect(img, 11, 7, 16, 15, C["hull_lt"])
    frame_rect(img, 11, 7, 16, 15, C["hull"])
    for y in range(8, 15):
        px(img, 11, y, C["hull_dk"])  # hangar door
    # main deckhouse: aft stack block + bridge block
    rect(img, 23, 7, 37, 15, C["hull_lt"])
    rect(img, 23, 7, 37, 7, C["white"])
    rect(img, 23, 7, 23, 15, C["white"])
    rect(img, 37, 8, 37, 15, C["hull"])
    rect(img, 24, 15, 37, 15, C["hull"])
    # funnels (exhaust stacks) with soot
    for fx in (25, 29):
        rect(img, fx, 9, fx + 2, 13, C["deck"])
        rect(img, fx + 1, 10, fx + 1, 12, C["black"])
    # bridge windows facing forward + SPY-1 radar arrays at the corners
    for y in range(9, 14):
        px(img, 37, y, C["water_dk"])
    px(img, 36, 8, C["steel"])
    px(img, 36, 14, C["steel"])
    px(img, 35, 8, C["steel"])
    px(img, 35, 14, C["steel"])
    # mast with yardarm
    rect(img, 33, 10, 34, 12, C["deck"])
    for y in range(8, 15):
        px(img, 33, y, C["black"])
    px(img, 34, 11, C["fire_red"])  # masthead light


def helipad(img):
    rect(img, 3, 8, 10, 15, C["deck"])
    ring(img, 6, 11, 3, C["fire_yellow"])
    # tiny H
    for y in range(10, 14):
        px(img, 5, y, C["white"])
        px(img, 7, y, C["white"])
    px(img, 6, 11, C["white"])


def build_base():
    img = hull()
    helipad(img)
    vls(img, 18, 8, 2, 3)
    superstructure(img)
    vls(img, 39, 8, 2, 3)
    # gun mount base ring (turret sprite sits on top)
    ring(img, TURRET[0], TURRET[1], 3, C["hull_dk"])
    disc(img, TURRET[0], TURRET[1], 2, C["deck"])
    # anchor chain / windlass on the foredeck
    px(img, 54, 10, C["deck"])
    px(img, 54, 13, C["deck"])
    px(img, 56, 11, C["black"])
    px(img, 56, 12, C["black"])
    # gold hull number on both sides of the foredeck
    rect(img, 50, 8, 53, 8, C["gold"])
    rect(img, 50, 15, 53, 15, C["gold"])
    px(img, 51, 8, C["gold_dk"])
    px(img, 51, 15, C["gold_dk"])
    return outline(img)


def scorch(img, spots, seed):
    rnd = rng(seed)
    for (x, y, r) in spots:
        for _ in range(int(r * r * 3)):
            sx = x + rnd.randint(-r, r)
            sy = y + rnd.randint(-r, r)
            c = img.getpixel((sx, sy)) if 0 <= sx < W and 0 <= sy < H else (0, 0, 0, 0)
            if c[3] and c != C["black"]:
                img.putpixel((sx, sy), C["deck"] if rnd.random() < 0.6 else C["black"])


def fire(img, x, y, size, seed):
    blob(img, x, y, size, [C["fire_yellow"], C["fire_orange"], C["fire_red"]], seed=seed, density=0.85)


def smoke_trail(img, x, y, n, seed):
    """Smoke drifts aft (left) as the ship steams east."""
    for i in range(n):
        r = 1.2 + i * 0.5
        c = (C["smoke"] if i % 2 else C["smoke_lt"])
        c = (c[0], c[1], c[2], max(80, 210 - i * 35))
        blob(img, x - i * 3, y - (i % 2), r, [c], seed=seed + i, density=0.8)


def damaged():
    img = build_base()
    scorch(img, [(20, 9, 2), (44, 14, 2), (8, 14, 1)], seed=3)
    return img


def heavy():
    img = build_base()
    scorch(img, [(20, 9, 3), (44, 14, 2), (8, 13, 2), (31, 14, 2), (55, 10, 2)], seed=5)
    fire(img, 21, 10, 2.2, 11)
    fire(img, 44, 14, 1.6, 12)
    smoke_trail(img, 18, 8, 4, 20)
    return img


def foam_ring(img, cx, cy, rx, ry, seed, alpha=220):
    rnd = rng(seed)
    foam = (*C["foam"][:3], alpha)
    for i in range(48):
        import math
        a = i / 48 * 2 * math.pi
        x = cx + math.cos(a) * rx + rnd.uniform(-1, 1)
        y = cy + math.sin(a) * ry + rnd.uniform(-0.6, 0.6)
        if rnd.random() < 0.8:
            px(img, round(x), round(y), foam)


def sinking(stage):
    base = heavy()
    water = C["water"]
    img = new(W, H)
    if stage == 0:  # frame 3: settling, heavier fire
        s = tint(darken(base, 0.08), water, 0.12)
        fire(s, 32, 9, 2.0, 30)
        smoke_trail(s, 30, 8, 3, 40)
        paste(img, s, 0, 0)
        foam_ring(img, 32, 12, 30, 8, 1, alpha=140)
    elif stage == 1:  # frame 4: listing hard (narrower from above), awash
        s = tint(darken(base, 0.2), water, 0.3).resize((W, 16), 0)
        paste(img, s, 0, 6)
        fire(img, 30, 12, 2.4, 41)
        smoke_trail(img, 26, 10, 4, 42)
        foam_ring(img, 32, 14, 31, 6, 2)
    elif stage == 2:  # frame 5: breaking in two amidships
        s = tint(darken(base, 0.3), water, 0.4)
        stern = new(W, H)
        stern.paste(s.crop((0, 0, 30, H)), (0, 0))
        bow = new(W, H)
        bow.paste(s.crop((30, 0, W, H)), (30, 0))
        paste(img, rotate(stern, 8), -2, 1)
        paste(img, rotate(bow, -10), 3, 1)
        fire(img, 31, 12, 2.6, 51)
        foam_ring(img, 31, 12, 5, 4, 3)
        foam_ring(img, 32, 12, 31, 8, 4, alpha=160)
    elif stage == 3:  # frame 6: halves going under
        s = fade(tint(darken(base, 0.35), water, 0.6), 0.8)
        stern = new(W, H)
        stern.paste(s.crop((0, 0, 22, H)), (0, 0))
        bow = new(W, H)
        bow.paste(s.crop((38, 0, W, H)), (38, 0))
        paste(img, rotate(stern, 16), 2, 2)
        paste(img, rotate(bow, -18), -2, 2)
        foam_ring(img, 14, 13, 9, 5, 5)
        foam_ring(img, 50, 13, 10, 5, 6)
        foam_ring(img, 32, 12, 4, 3, 7)
    elif stage == 4:  # frame 7: only the tips remain
        s = fade(tint(darken(base, 0.4), water, 0.75), 0.6)
        stern = new(W, H)
        stern.paste(s.crop((2, 8, 10, 16)), (6, 9))
        bow = new(W, H)
        bow.paste(s.crop((54, 9, 63, 15)), (50, 9))
        paste(img, rotate(stern, 25), 0, 0)
        paste(img, rotate(bow, -30), 0, 0)
        foam_ring(img, 12, 13, 6, 3, 8)
        foam_ring(img, 54, 12, 6, 3, 9)
        foam_ring(img, 32, 12, 16, 5, 10, alpha=150)
    else:  # frame 8: last bubble ring
        foam_ring(img, 32, 12, 12, 4, 11, alpha=150)
        rnd = rng(12)
        for _ in range(9):
            bx, by = 32 + rnd.randint(-8, 8), 12 + rnd.randint(-3, 3)
            ring(img, bx, by, 1, (*C["foam"][:3], 200))
        ellipse(img, 26, 10, 38, 14, (*C["water_dk"][:3], 110))
    return img


def build():
    frames = [build_base(), damaged(), heavy()] + [sinking(i) for i in range(6)]
    return strip(frames)
