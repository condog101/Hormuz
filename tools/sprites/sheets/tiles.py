"""Opaque 16x16 terrain tiles for the procedurally painted coastline.

 0-3 deep water (animated variants)   4 sand        5 dark sand / dune
 6 rock        7 dark rock            8 north shore (land top, water bottom)
 9 south shore (water top, land bottom)            10 cliff north   11 cliff south
12 scrub on sand   13 village building  14 shallow water   15 surf / foam

Shoreline curves use a 16px period so neighbouring edge tiles join seamlessly.
"""
import math

from draw import dither, new, px, rect, rng, strip
from palette import C

NAME = "tiles"
FRAME = (16, 16)
FRAMES = 16
T = 16


def solid(c):
    return new(T, T, c)


def h(x, y, seed):
    """Deterministic per-pixel hash in [0, 1)."""
    v = (x * 374761393 + y * 668265263 + seed * 2147483647) & 0xFFFFFFFF
    v = ((v ^ (v >> 13)) * 1274126177) & 0xFFFFFFFF
    return (v ^ (v >> 16)) / 0xFFFFFFFF


def water(variant):
    img = solid(C["water"])
    for y in range(T):
        for x in range(T):
            if h(x, y, 1) < 0.18:
                px(img, x, y, C["water_dk"])
    # short wave crests drifting one step per variant
    for k, (wx, wy) in enumerate([(2, 3), (9, 6), (4, 11), (12, 13)]):
        x0 = (wx + variant * 2 + k) % T
        for d in range(3):
            px(img, (x0 + d) % T, wy, C["water_lt"])
        px(img, (x0 + 1) % T, wy - 1, C["water_lt"])
    sx, sy = [(5, 8), (13, 2), (8, 14), (1, 10)][variant]
    px(img, sx, sy, C["foam"])
    return img


def speckle(base, specks, seed):
    img = solid(base)
    for y in range(T):
        for x in range(T):
            r = h(x, y, seed)
            acc = 0.0
            for c, p in specks:
                acc += p
                if r < acc:
                    px(img, x, y, c)
                    break
    return img


def sand():
    return speckle(C["sand"], [(C["sand_lt"], 0.12), (C["ochre"], 0.08)], 4)


def dune():
    img = speckle(C["ochre"], [(C["sand"], 0.1), (C["rock_lt"], 0.05)], 5)
    for y0 in (3, 9, 14):  # wind ripples
        for x in range(T):
            y = y0 + round(math.sin(x / T * 2 * math.pi) * 1)
            px(img, x, y, C["sand_lt"])
            px(img, x, y + 1, C["rock_lt"])
    return img


def rock():
    img = speckle(C["rock"], [(C["rock_lt"], 0.14), (C["rock_dk"], 0.1)], 6)
    for x, y in [(3, 4), (4, 5), (5, 5), (10, 10), (11, 11), (11, 12)]:
        px(img, x, y, C["rock_dk"])
    for x, y in [(3, 3), (10, 9)]:
        px(img, x, y, C["sand"])
    return img


def rock_dark():
    return speckle(C["rock_dk"], [(C["rock"], 0.14), (C["black"], 0.05)], 7)


def shore_line(x):
    return 8 + round(math.sin(x / T * 2 * math.pi) * 1.5)


def north_shore():
    img = water(0)
    land = sand()
    for x in range(T):
        sy = shore_line(x)
        for y in range(0, sy):
            px(img, x, y, land.getpixel((x, y)))
        px(img, x, sy - 1, C["sand_lt"])  # wet sand highlight
        px(img, x, sy, C["foam"])
        px(img, x, sy + 1, C["shallow"])
        if x % 3 != 0:
            px(img, x, sy + 2, C["shallow"])
        if x % 4 == 1:
            px(img, x, sy + 3, C["foam"])
    return img


def south_shore():
    img = water(2)
    land = sand()
    for x in range(T):
        sy = T - shore_line(x)
        for y in range(sy, T):
            px(img, x, y, land.getpixel((x, y)))
        px(img, x, sy, C["sand_lt"])
        px(img, x, sy - 1, C["foam"])
        px(img, x, sy - 2, C["shallow"])
        if x % 3 != 0:
            px(img, x, sy - 3, C["shallow"])
        if x % 4 == 1:
            px(img, x, sy - 4, C["foam"])
    return img


def cliff_north():
    img = water(1)
    top = rock()
    for x in range(T):
        edge = 6 + round(math.sin(x / T * 2 * math.pi + 1) * 1)
        for y in range(0, edge):
            px(img, x, y, top.getpixel((x, y)))
        # south-facing cliff face is in shadow (light from top-left)
        for y in range(edge, edge + 4):
            px(img, x, y, C["rock_dk"] if (x + y) % 3 else C["black"])
        px(img, x, edge + 4, C["foam"])
        for y in range(edge + 5, min(T, edge + 8)):
            if (x + y) % 2 == 0:
                px(img, x, y, C["water_dk"])  # cliff shadow on the water
    return img


def cliff_south():
    img = water(3)
    bottom = rock()
    for x in range(T):
        edge = 10 + round(math.sin(x / T * 2 * math.pi + 1) * 1)
        for y in range(edge, T):
            px(img, x, y, bottom.getpixel((x, y)))
        # north-facing face catches the light
        for y in range(edge - 3, edge):
            px(img, x, y, C["rock_lt"] if (x + y) % 3 else C["sand"])
        px(img, x, edge - 4, C["foam"])
        if x % 2 == 0:
            px(img, x, edge - 5, C["shallow"])
    return img


def scrub():
    img = sand()
    for cx, cy in [(4, 4), (11, 7), (6, 12), (13, 13)]:
        for dx, dy in [(0, 0), (1, 0), (0, 1), (1, 1), (-1, 0), (0, -1)]:
            px(img, cx + dx, cy + dy, C["olive"])
        px(img, cx, cy - 1, (140, 150, 80, 255))  # lit top
        px(img, cx + 1, cy + 2, C["ochre"])  # shadow
        px(img, cx + 2, cy + 1, C["ochre"])
    return img


def village():
    img = sand()
    # shadow (cast down-right)
    rect(img, 4, 5, 13, 13, C["ochre"])
    # flat-roofed whitewashed house
    rect(img, 3, 3, 11, 11, C["sand_lt"])
    rect(img, 3, 3, 11, 3, C["white"])
    rect(img, 3, 3, 3, 11, C["white"])
    rect(img, 4, 4, 10, 10, C["foam"])
    dither(img, 5, 5, 10, 10, C["sand_lt"], only_opaque=False)
    rect(img, 7, 11, 8, 12, C["rock_dk"])  # doorway
    px(img, 9, 5, C["water"])  # water tank
    px(img, 10, 5, C["water"])
    return img


def shallow():
    img = solid(C["shallow"])
    for y in range(T):
        for x in range(T):
            r = h(x, y, 14)
            if r < 0.14:
                px(img, x, y, C["water_lt"])
            elif r < 0.2:
                px(img, x, y, C["sand"])
    for x0, y in [(2, 4), (9, 11)]:
        for d in range(3):
            px(img, x0 + d, y, C["foam"])
    return img


def surf():
    img = solid(C["foam"])
    for y in range(T):
        for x in range(T):
            r = h(x, y, 15)
            if r < 0.3:
                px(img, x, y, C["shallow"])
            elif r < 0.38:
                px(img, x, y, C["white"])
    return img


def build():
    tiles = [water(0), water(1), water(2), water(3), sand(), dune(), rock(), rock_dark(),
             north_shore(), south_shore(), cliff_north(), cliff_south(), scrub(), village(), shallow(), surf()]
    out = strip(tiles)
    assert all(p[3] == 255 for p in out.getdata()), "tiles must be fully opaque"
    return out
