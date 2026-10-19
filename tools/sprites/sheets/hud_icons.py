"""HUD icons, 16x16: hull, life, score, CIWS, level flag, speaker."""
from draw import bevel, disc, ellipse, new, outline, poly, px, rect, strip
from palette import C

NAME = "hud_icons"
FRAME = (16, 16)
FRAMES = 6


def hull():
    img = new(16, 16)
    poly(img, [(2, 2), (13, 2), (13, 8), (7.5, 14), (2, 8)], C["steel"])
    poly(img, [(4, 4), (11, 4), (11, 8), (7.5, 12), (4, 8)], C["suit_lt"])
    rect(img, 7, 5, 8, 10, C["white"])  # anchor shank
    rect(img, 5, 6, 10, 6, C["white"])
    px(img, 5, 9, C["white"])
    px(img, 10, 9, C["white"])
    px(img, 6, 10, C["white"])
    px(img, 9, 10, C["white"])
    bevel(img)
    return outline(img)


def life():
    img = new(16, 16)
    poly(img, [(1, 6), (10, 6), (14, 8), (10, 10), (1, 10)], C["hull"])
    rect(img, 5, 7, 8, 9, C["hull_lt"])
    px(img, 11, 8, C["deck"])
    bevel(img)
    return outline(img)


def star():
    img = new(16, 16)
    pts = []
    import math
    for i in range(10):
        r = 7 if i % 2 == 0 else 3
        a = -math.pi / 2 + i * math.pi / 5
        pts.append((7.5 + math.cos(a) * r, 8 + math.sin(a) * r))
    poly(img, pts, C["fire_yellow"])
    bevel(img, light=0.4, dark=-0.25)
    px(img, 6, 6, C["white"])
    return outline(img)


def ciws():
    img = new(16, 16)
    rect(img, 3, 11, 12, 13, C["hull_dk"])  # mount base
    ellipse(img, 4, 2, 11, 10, C["white"])  # radar radome
    rect(img, 4, 7, 11, 10, C["hull_lt"])
    rect(img, 11, 8, 14, 9, C["deck"])  # gatling barrels
    bevel(img)
    px(img, 6, 4, C["white"])
    return outline(img)


def flag():
    img = new(16, 16)
    rect(img, 3, 1, 3, 14, C["hull_lt"])  # pole
    rect(img, 4, 2, 12, 8, C["white"])
    for y in (3, 5, 7):
        rect(img, 4, y, 12, y, C["fire_red"])
    rect(img, 4, 2, 7, 5, C["suit_lt"])
    px(img, 5, 3, C["white"])
    rect(img, 2, 14, 5, 14, C["hull_dk"])
    return outline(img)


def speaker():
    img = new(16, 16)
    rect(img, 2, 6, 4, 9, C["hull_lt"])
    poly(img, [(4, 6), (8, 2), (8, 13), (4, 9)], C["hull_lt"])
    bevel(img)
    outline(img)
    for y in range(6, 10):
        px(img, 10, y, C["white"])
    for y in range(4, 12):
        px(img, 12 + (1 if 5 < y < 10 else 0), y, C["white"])
    return img


def build():
    return strip([hull(), life(), star(), ciws(), flag(), speaker()])
