"""HUD icons, 16x16: hull, life, gold record (score), CIWS, microphone, speaker."""
from draw import bevel, circle, disc, ellipse, new, outline, poly, px, rect, strip
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


def record():
    img = new(16, 16)
    disc(img, 7.5, 8, 6.4, C["gold"])
    circle(img, 7.5, 8, 5.0, C["black"])
    circle(img, 7.5, 8, 3.4, C["gold_dk"])
    disc(img, 7.5, 8, 2.0, C["cream"])
    px(img, 7, 8, C["black"])
    px(img, 8, 8, C["black"])
    bevel(img, light=0.35, dark=-0.25)
    px(img, 4, 4, C["white"])
    px(img, 5, 3, C["white"])
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


def mic():
    img = new(16, 16)
    ellipse(img, 5, 1, 10, 8, C["chrome"])  # head
    for y in range(2, 8):
        for x in range(5, 11):
            if (x + y) % 2 == 0 and img.getpixel((x, y))[3]:
                px(img, x, y, C["hull_dk"])
    rect(img, 6, 8, 9, 10, C["hull_dk"])  # collar
    rect(img, 7, 10, 8, 13, C["hull"])  # stem
    rect(img, 5, 14, 10, 14, C["gold"])  # base
    px(img, 6, 3, C["white"])
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
    return strip([hull(), life(), record(), ciws(), mic(), speaker()])
