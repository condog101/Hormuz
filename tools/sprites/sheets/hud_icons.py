"""HUD icons, 16x16: hull, life, gold record (score), CIWS, microphone, speaker, and the three main-gun
weapons: THE NINE (pistol), THE PUMP (shotgun), THE 808 (drum machine pad with a shockwave)."""
from draw import bevel, circle, disc, ellipse, new, outline, poly, px, rect, strip
from palette import C

NAME = "hud_icons"
FRAME = (16, 16)
FRAMES = 9


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


def nine():
    img = new(16, 16)
    rect(img, 2, 4, 13, 7, C["deck"])  # slide
    rect(img, 2, 4, 13, 4, C["hull_lt"])
    rect(img, 12, 5, 13, 5, C["black"])  # muzzle
    poly(img, [(4, 8), (8, 8), (7, 14), (3, 14)], C["deck"])  # grip
    rect(img, 4, 9, 6, 13, C["rock_dk"])
    rect(img, 8, 8, 10, 10, C["deck"])  # trigger guard
    px(img, 9, 9, (0, 0, 0, 0))
    px(img, 4, 12, C["gold"])
    bevel(img)
    return outline(img)


def pump():
    img = new(16, 16)
    rect(img, 1, 5, 14, 6, C["deck"])  # barrel
    rect(img, 1, 5, 14, 5, C["hull_lt"])
    rect(img, 7, 7, 11, 8, C["rock"])  # pump grip
    rect(img, 7, 7, 11, 7, C["rock_lt"])
    poly(img, [(0, 6), (5, 6), (5, 9), (1, 12), (0, 11)], C["rock"])  # stock
    rect(img, 1, 7, 3, 9, C["rock_lt"])
    px(img, 14, 4, C["chrome"])  # bead sight
    bevel(img)
    return outline(img)


def boom():
    img = new(16, 16)
    rect(img, 3, 4, 12, 13, C["deck"])  # drum machine pad
    rect(img, 3, 4, 12, 4, C["hull_dk"])
    for x, y in [(5, 7), (8, 7), (5, 10), (8, 10)]:  # pads
        rect(img, x, y, x + 1, y + 1, C["candy"] if (x, y) == (5, 7) else C["fire_orange"])
    rect(img, 11, 7, 11, 11, C["gold"])
    bevel(img)
    outline(img)
    circle(img, 7.5, 8.5, 7.4, C["gold"])  # shockwave
    return img


def build():
    return strip([hull(), life(), record(), ciws(), mic(), speaker(), nine(), pump(), boom()])
