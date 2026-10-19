"""Guest features: caricature busts of Ice Cube and 2Pac for the popup portrait, on the same studio
backdrop as Big Don. Every line they say in the game is fictional; these are cartoons, not likenesses.

Frames: 0 Ice Cube (mouth closed), 1 Ice Cube (mouth open), 2 2Pac (mouth closed), 3 2Pac (mouth open).
"""
from draw import dither, disc, ellipse, new, outline, paste, poly, px, rect, strip
from palette import C

from .potus import background

NAME = "guests"
FRAME = (64, 64)
FRAMES = 4

SKIN = C["rock_lt"]
SHADE = C["rock"]
HI = C["ochre"]


def chain(img, y0=47, depth=9):
    for i, x in enumerate(range(22, 43)):
        t = (x - 32) / 10.0
        y = y0 + round(depth * (1 - t * t))
        px(img, x, y, C["gold"] if i % 2 == 0 else C["gold_dk"])


def head(img, top, cap=False):
    # ears
    ellipse(img, 15, 26, 20, 34, SHADE)
    ellipse(img, 44, 26, 49, 34, SHADE)
    px(img, 17, 29, SKIN)
    px(img, 46, 29, SKIN)
    # head and jaw (light from top-left)
    ellipse(img, 18, top, 46, 44, SKIN)
    rect(img, 19, 22, 45, 38, SKIN)
    for y in range(20, 42):
        px(img, 44, y, SHADE)
        px(img, 45, y, SHADE)
    rect(img, 24, 43, 40, 44, SHADE)
    if not cap:
        # shine on the scalp
        for x, y in [(24, top + 3), (25, top + 2), (26, top + 2), (23, top + 4), (27, top + 2)]:
            px(img, x, y, HI)
    # neck
    rect(img, 26, 41, 38, 47, SHADE)


def nose(img, stud=False):
    rect(img, 30, 29, 34, 34, SKIN)
    rect(img, 33, 30, 34, 34, SHADE)
    px(img, 29, 34, SHADE)
    px(img, 35, 34, SHADE)
    px(img, 30, 34, C["rock_dk"])
    px(img, 34, 34, C["rock_dk"])
    px(img, 31, 30, HI)
    if stud:
        px(img, 29, 33, C["chrome"])


def eyes(img, y, lids):
    for cx in (25, 39):
        rect(img, cx - 2, y, cx + 1, y + 1, C["white"])
        px(img, cx, y, C["black"])
        px(img, cx - 1, y + 1, C["black"])
        if lids:
            rect(img, cx - 2, y - 1, cx + 1, y - 1, C["rock_dk"])


def goatee(img, full_circle):
    rect(img, 28, 36, 36, 36, C["black"])  # moustache
    px(img, 27, 37, C["black"])
    px(img, 37, 37, C["black"])
    rect(img, 30, 41, 34, 44, C["black"])  # goatee
    px(img, 31, 45, C["black"])
    px(img, 32, 45, C["black"])
    px(img, 33, 45, C["black"])
    if full_circle:
        for y in range(37, 42):
            px(img, 27, y, C["black"])
            px(img, 37, y, C["black"])
        px(img, 28, 41, C["black"])
        px(img, 36, 41, C["black"])


def mouth(img, open_, smile):
    if open_:
        rect(img, 29, 38, 35, 40, C["black"])
        rect(img, 30, 38, 34, 38, C["white"])
        px(img, 32, 40, C["candy_dk"])
    elif smile:
        rect(img, 29, 39, 35, 39, C["rock_dk"])
        px(img, 28, 38, C["rock_dk"])
        px(img, 36, 38, C["rock_dk"])
    else:  # flat, unimpressed
        rect(img, 29, 39, 35, 39, C["rock_dk"])
        rect(img, 30, 40, 34, 40, SHADE)


def cube(open_):
    img = new(64, 64)
    # black jacket over a white tee
    poly(img, [(4, 63), (6, 52), (14, 47), (26, 45), (38, 45), (50, 47), (58, 52), (60, 63)], C["black"])
    dither(img, 6, 50, 16, 63, C["deck"])
    rect(img, 26, 46, 38, 63, C["white"])
    rect(img, 26, 46, 38, 47, C["hull_lt"])  # crew neck
    poly(img, [(25, 46), (29, 63), (22, 63), (20, 50)], C["deck"])  # jacket fronts
    poly(img, [(39, 46), (35, 63), (42, 63), (44, 50)], C["deck"])
    head(img, 12, cap=True)
    # hair under the brim at the temples
    rect(img, 18, 19, 21, 24, C["black"])
    rect(img, 43, 19, 46, 24, C["black"])
    # flat-brim cap, no logo
    rect(img, 18, 6, 46, 18, C["black"])  # fitted crown with rounded top corners
    for x, y in [(18, 6), (19, 6), (20, 6), (18, 7), (18, 8), (46, 6), (45, 6), (44, 6), (46, 7), (46, 8)]:
        px(img, x, y, (0, 0, 0, 0))
    rect(img, 21, 5, 43, 5, C["black"])
    for y in range(6, 18):
        px(img, 32, y, C["deck"])  # panel seam
    for x in range(21, 30):
        px(img, x, 7, C["deck"])  # crown highlight
    rect(img, 16, 18, 48, 21, C["black"])  # the brim, dead straight, seen edge-on
    rect(img, 16, 18, 48, 18, C["deck"])
    rect(img, 17, 21, 47, 21, C["hull_dk"])  # brim underside
    px(img, 32, 4, C["black"])  # button
    # heavy scowl brows sloping down to the nose
    for i in range(8):
        dy = i // 3
        rect(img, 21 + i, 23 + dy, 21 + i, 24 + dy, C["black"])
        rect(img, 43 - i, 23 + dy, 43 - i, 24 + dy, C["black"])
    eyes(img, 27, lids=True)
    nose(img)
    goatee(img, full_circle=True)
    mouth(img, open_, smile=False)
    chain(img)
    disc(img, 32, 57, 1.6, C["gold"])
    return outline(img)


def pac(open_):
    img = new(64, 64)
    # bare shoulders and a black tank top
    poly(img, [(4, 63), (6, 52), (14, 47), (26, 45), (38, 45), (50, 47), (58, 52), (60, 63)], SKIN)
    dither(img, 48, 50, 58, 63, SHADE)
    poly(img, [(18, 63), (20, 50), (24, 47), (40, 47), (44, 50), (46, 63)], C["black"])
    rect(img, 21, 46, 24, 50, C["black"])  # straps
    rect(img, 40, 46, 43, 50, C["black"])
    poly(img, [(25, 47), (39, 47), (32, 52)], SKIN)  # neckline
    head(img, 7)
    # black bandana tied round the head, knotted at the front with the tails sticking up
    rect(img, 18, 15, 46, 19, C["black"])
    rect(img, 19, 15, 45, 15, C["deck"])
    for x in range(20, 45, 4):
        px(img, x, 17, C["deck"])
    rect(img, 30, 13, 34, 20, C["black"])  # knot
    px(img, 31, 14, C["deck"])
    poly(img, [(30, 14), (27, 11), (28, 10), (31, 13)], C["black"])  # tails
    poly(img, [(34, 14), (37, 11), (36, 10), (33, 13)], C["black"])
    px(img, 28, 11, C["deck"])
    # arched brows
    for x0 in (21, 35):
        for i in range(8):
            y = 22 if 2 <= i <= 5 else 23
            px(img, x0 + i, y, C["black"])
    eyes(img, 26, lids=False)
    nose(img, stud=True)
    goatee(img, full_circle=False)
    mouth(img, open_, smile=True)
    chain(img, y0=46, depth=10)
    rect(img, 32, 55, 32, 60, C["gold"])  # small cross
    rect(img, 30, 57, 34, 57, C["gold"])
    px(img, 33, 58, C["gold_dk"])
    return outline(img)


def build():
    frames = []
    for fig in (cube(False), cube(True), pac(False), pac(True)):
        bg = background()
        paste(bg, fig, 0, 0)
        frames.append(bg)
    return strip(frames)
