"""Big Don: satirical caricature bust for the popup portrait (parody of Donald Trump).

Orange tan, pale goggle-tan around the eyes, enormous swept golden hair, dark
suit and an extra-long red tie, now with a red bandana, two gold rope chains
with a $ medallion, a gold grill and a studio backdrop (foam wall, mic, ON AIR).
Big Don always wears his shades.
Frames: 0 mouth closed, 1 half open, 2 wide open, 3 blink (hidden by the shades), 4 grin.
"""
from draw import (
    bevel, dither, disc, ellipse, new, outline, paste, poly, px, rect, rng, strip, tiny_text,
)
from palette import C

NAME = "potus"
FRAME = (64, 64)
FRAMES = 5

FOAM = (34, 32, 40, 255)
FOAM_LT = (52, 50, 60, 255)


def background():
    """Recording studio: acoustic foam wall, a mic on a stand at the left, an ON AIR lamp."""
    img = new(64, 64, C["black"])
    # foam wedges: 8px cells with a lit diagonal ridge
    for cy in range(0, 64, 8):
        for cx in range(0, 64, 8):
            rect(img, cx, cy, cx + 7, cy + 7, FOAM)
            for k in range(8):
                px(img, cx + k, cy + k, FOAM_LT)
            px(img, cx, cy, C["black"])
    # a darker floor line where the desk would be
    rect(img, 0, 52, 63, 63, C["black"])
    dither(img, 0, 52, 63, 63, FOAM)
    # mic on a boom stand, left
    rect(img, 6, 34, 6, 63, C["hull_dk"])
    rect(img, 5, 33, 7, 33, C["hull"])
    rect(img, 7, 24, 7, 33, C["hull"])
    ellipse(img, 3, 18, 11, 28, C["chrome"])
    dither(img, 4, 19, 10, 27, C["hull_dk"])
    rect(img, 6, 28, 8, 30, C["hull_dk"])
    px(img, 5, 20, C["white"])
    # ON AIR lamp, top right (stacked so the hair does not cover it)
    rect(img, 50, 1, 63, 15, C["black"])
    rect(img, 51, 2, 62, 14, C["candy"])
    tiny_text(img, 53, 3, "ON", C["cream"])
    tiny_text(img, 51, 9, "AIR", C["cream"])
    px(img, 51, 2, C["fire_orange"])
    # frame edge
    rect(img, 0, 0, 63, 0, C["gold_dk"])
    rect(img, 0, 0, 0, 63, C["gold_dk"])
    rect(img, 0, 63, 63, 63, C["black"])
    rect(img, 63, 0, 63, 63, C["black"])
    return img


def chains(img):
    """Two gold rope chains over the shirt V, with a $ medallion on the longer one."""
    for y0, depth in ((47, 6), (48, 10)):
        for i, x in enumerate(range(21, 44)):
            t = (x - 32) / 11.0
            y = y0 + round(depth * (1 - t * t))
            px(img, x, y, C["gold"] if i % 2 == 0 else C["gold_dk"])
    disc(img, 32, 59, 3, C["gold"])
    px(img, 30, 58, C["cream"])
    tiny_text(img, 31, 57, "$", C["gold_dk"])


def body():
    img = new(64, 64)
    # suit shoulders
    poly(img, [(4, 63), (6, 52), (14, 47), (26, 45), (38, 45), (50, 47), (58, 52), (60, 63)], C["suit"])
    dither(img, 6, 50, 14, 63, C["suit_lt"])
    # lapels
    poly(img, [(25, 45), (31, 60), (27, 63), (20, 50)], C["suit_lt"])
    poly(img, [(39, 45), (33, 60), (37, 63), (44, 50)], C["suit_lt"])
    # shirt V
    poly(img, [(26, 45), (38, 45), (32, 59)], C["white"])
    # collar points
    poly(img, [(26, 45), (31, 48), (28, 50)], C["hull_lt"])
    poly(img, [(38, 45), (33, 48), (36, 50)], C["hull_lt"])
    # extra-long red tie, past the bottom of the frame
    rect(img, 31, 47, 33, 49, C["tie"])
    poly(img, [(31, 50), (33, 50), (35, 63), (29, 63)], C["tie"])
    px(img, 31, 47, (236, 70, 80, 255))
    for y in range(52, 63, 3):
        px(img, 32, y, (160, 20, 34, 255))
    # neck
    rect(img, 26, 40, 38, 46, C["skin_dk"])
    chains(img)
    return img


def face(img):
    # ears
    ellipse(img, 15, 27, 20, 35, C["skin_dk"])
    ellipse(img, 44, 27, 49, 35, C["skin_dk"])
    px(img, 17, 30, C["skin"])
    px(img, 46, 30, C["skin"])
    # square-ish head with heavy jowls
    rect(img, 18, 18, 46, 40, C["skin"])
    poly(img, [(18, 38), (46, 38), (43, 44), (21, 44)], C["skin"])
    # jaw/shadow side (light from top-left)
    for y in range(22, 44):
        px(img, 45, y, C["skin_dk"])
        px(img, 46, y, C["skin_dk"])
    rect(img, 23, 43, 41, 44, C["skin_dk"])
    for y in range(36, 43):
        px(img, 44, y, C["skin_dk"])
    # pale goggle-tan around the eyes
    ellipse(img, 21, 26, 29, 32, C["skin_lt"])
    ellipse(img, 35, 26, 43, 32, C["skin_lt"])
    # cheek blush
    dither(img, 21, 34, 25, 36, C["fire_orange"])
    dither(img, 39, 34, 43, 36, C["fire_orange"])
    # nose
    rect(img, 31, 29, 33, 35, C["skin"])
    rect(img, 33, 30, 34, 35, C["skin_dk"])
    px(img, 30, 35, C["skin_dk"])
    px(img, 32, 36, C["skin_dk"])
    px(img, 31, 30, C["skin_lt"])
    # chin crease
    rect(img, 29, 43, 35, 43, C["rock"])


def eyes(img, blink):
    # brows: pale blond, furrowed
    for x0, slope in ((21, 1), (35, -1)):
        for i in range(8):
            y = 25 + (i // 4 if slope > 0 else (7 - i) // 4)
            px(img, x0 + i, y, C["hair_dk"])
    for cx in (25, 39):
        if blink:
            rect(img, cx - 2, 29, cx + 1, 29, C["skin_dk"])
            px(img, cx - 2, 28, C["skin_dk"])
        else:
            rect(img, cx - 2, 28, cx + 1, 29, C["white"])
            px(img, cx, 28, C["water"])
            px(img, cx, 29, C["black"])
            px(img, cx - 1, 29, C["water"])
            rect(img, cx - 2, 27, cx + 1, 27, C["skin_dk"])  # heavy lids


def shades(img):
    """Big black shades with a chrome glint; drawn over the eyes."""
    for x0 in (20, 34):
        rect(img, x0, 26, x0 + 9, 31, C["black"])
        px(img, x0, 26, (0, 0, 0, 0))
        px(img, x0 + 9, 26, (0, 0, 0, 0))
        px(img, x0, 31, (0, 0, 0, 0))
        px(img, x0 + 9, 31, (0, 0, 0, 0))
        rect(img, x0 + 1, 26, x0 + 8, 26, C["hull_dk"])
        px(img, x0 + 2, 27, C["chrome"])
        px(img, x0 + 3, 27, C["chrome"])
        px(img, x0 + 2, 28, C["hull_lt"])
    rect(img, 30, 28, 33, 28, C["black"])  # bridge
    rect(img, 17, 27, 19, 27, C["black"])  # arms
    rect(img, 44, 27, 47, 27, C["black"])


def grill(img, x0, x1, y):
    """Gold teeth with darker separators."""
    for x in range(x0, x1 + 1):
        px(img, x, y, C["gold"] if (x - x0) % 2 == 0 else C["gold_dk"])


def mouth(img, state):
    if state == 0:  # pursed, the classic pout
        ellipse(img, 28, 37, 36, 41, C["fire_red"])
        rect(img, 30, 39, 34, 39, C["rock_dk"])
        rect(img, 30, 37, 33, 37, (236, 120, 110, 255))
    elif state == 1:
        ellipse(img, 27, 37, 37, 41, C["fire_red"])
        rect(img, 29, 38, 35, 40, C["black"])
        grill(img, 30, 34, 38)
    elif state == 2:
        ellipse(img, 26, 36, 38, 43, C["fire_red"])
        ellipse(img, 27, 37, 37, 42, C["black"])
        grill(img, 29, 35, 37)
        ellipse(img, 29, 40, 35, 42, C["tie"])  # tongue
    else:  # wide grin, all grill
        ellipse(img, 25, 36, 39, 42, C["fire_red"])
        rect(img, 27, 38, 37, 40, C["black"])
        grill(img, 27, 37, 38)
        grill(img, 28, 36, 39)
        px(img, 25, 38, C["skin_dk"])
        px(img, 39, 38, C["skin_dk"])


def hair(img):
    hair, dk, hl = C["hair"], C["hair_dk"], C["sand_lt"]
    # back volume, wider than the head
    ellipse(img, 12, 3, 50, 20, hair)
    # temples / sides combed back
    rect(img, 15, 16, 19, 28, hair)
    rect(img, 45, 16, 48, 27, hair)
    # forehead peeking out under the swoop
    rect(img, 20, 17, 44, 25, C["skin"])
    rect(img, 21, 21, 43, 21, C["skin_dk"])  # forehead furrow
    # the swoop: a huge forelock sweeping left-to-right and curling over the brow
    poly(img, [(14, 12), (30, 9), (46, 12), (52, 17), (51, 22), (46, 21), (40, 18), (28, 19), (18, 21)], hair)
    poly(img, [(46, 15), (53, 19), (52, 24), (48, 22)], hair)
    # strands
    for i, (x0, y0) in enumerate([(16, 10), (20, 8), (26, 7), (32, 7), (38, 9), (44, 12)]):
        for k in range(10):
            x, y = x0 + k, y0 + k // 3
            px(img, x, y, dk if i % 2 == 0 else hl)
    for x in range(20, 50):
        y = 19 if x < 40 else 19 + (x - 40) // 3
        px(img, x, y, dk)
    px(img, 52, 23, dk)
    px(img, 51, 24, dk)
    # top highlight
    for x in range(22, 36):
        px(img, x, 6 + (1 if x < 26 or x > 32 else 0), hl)


def bandana(img):
    """Red bandana across the brow, knotted on the right, under the forelock."""
    rect(img, 18, 22, 46, 24, C["candy"])
    dither(img, 19, 22, 45, 24, C["candy_dk"], phase=1)
    rect(img, 18, 22, 46, 22, C["candy_dk"])
    # knot and tails
    rect(img, 46, 21, 49, 25, C["candy"])
    px(img, 47, 22, C["candy_dk"])
    poly(img, [(49, 23), (54, 26), (53, 30), (50, 26)], C["candy"])
    poly(img, [(49, 24), (52, 31), (50, 31), (48, 26)], C["candy_dk"])


def figure(state, blink=False):
    img = body()
    face(img)
    hair(img)
    bandana(img)
    eyes(img, blink)
    mouth(img, state)
    shades(img)  # always on: the shades never come off, even mid-verse
    return outline(img)


def frame(i):
    bg = background()
    if i == 3:
        fig = figure(0, blink=True)
    elif i == 4:
        fig = figure(3)
    else:
        fig = figure(i)
    paste(bg, fig, 0, 0)
    return bg


def build():
    return strip([frame(i) for i in range(FRAMES)])
