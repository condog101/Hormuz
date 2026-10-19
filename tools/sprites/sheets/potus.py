"""Satirical 'Commander in Chief' caricature bust for the popup portrait.

A generic cartoon politician: orange tan, pale goggle-tan around the eyes,
enormous swept golden hair, dark suit and an extra-long red tie.
Frames: 0 mouth closed, 1 half open, 2 wide open, 3 blink.
"""
from draw import (
    bevel, dither, disc, ellipse, new, outline, paste, poly, px, rect, rng, strip,
)
from palette import C

NAME = "potus"
FRAME = (64, 64)
FRAMES = 4


def background():
    img = new(64, 64, C["water_dk"])
    # vertical gradient into deep navy
    for y in range(64):
        for x in range(64):
            if y > 40 and (x + y) % 2 == 0:
                px(img, x, y, C["suit"])
            elif y > 52:
                px(img, x, y, C["suit"])
    # a few stars like a press-room backdrop
    rnd = rng(3)
    for _ in range(9):
        x, y = rnd.randint(3, 60), rnd.randint(3, 30)
        px(img, x, y, C["steel"])
    rect(img, 0, 0, 63, 0, C["steel"])
    rect(img, 0, 63, 63, 63, C["black"])
    rect(img, 0, 0, 0, 63, C["steel"])
    rect(img, 63, 0, 63, 63, C["black"])
    return img


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


def mouth(img, state):
    if state == 0:  # pursed, the classic pout
        ellipse(img, 28, 37, 36, 41, C["fire_red"])
        rect(img, 30, 39, 34, 39, C["rock_dk"])
        rect(img, 30, 37, 33, 37, (236, 120, 110, 255))
    elif state == 1:
        ellipse(img, 27, 37, 37, 41, C["fire_red"])
        rect(img, 29, 38, 35, 40, C["black"])
        rect(img, 30, 38, 34, 38, C["white"])
    else:
        ellipse(img, 26, 36, 38, 43, C["fire_red"])
        ellipse(img, 27, 37, 37, 42, C["black"])
        rect(img, 29, 37, 35, 37, C["white"])
        ellipse(img, 29, 40, 35, 42, C["tie"])  # tongue


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


def figure(state, blink=False):
    img = body()
    face(img)
    hair(img)
    eyes(img, blink)
    mouth(img, state)
    return outline(img)


def frame(i):
    bg = background()
    fig = figure(0 if i == 3 else i, blink=(i == 3))
    paste(bg, fig, 0, 0)
    return bg


def build():
    return strip([frame(i) for i in range(FRAMES)])
