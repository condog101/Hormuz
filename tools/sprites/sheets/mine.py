"""Moored contact mine: dark sphere, horns, blinking beacon."""
from draw import bevel, disc, new, outline, px, strip
from palette import C

NAME = "mine"
FRAME = (12, 12)
FRAMES = 2


def frame(i):
    img = new(12, 12)
    # horns
    for x, y in [(5, 1), (6, 1), (5, 10), (6, 10), (1, 5), (1, 6), (10, 5), (10, 6), (2, 2), (9, 2), (2, 9), (9, 9)]:
        px(img, x, y, C["hull_dk"])
    disc(img, 5.5, 5.5, 3.6, C["deck"])
    bevel(img, light=0.35, dark=-0.4)
    px(img, 4, 4, C["hull"])
    px(img, 4, 3, C["hull_lt"])
    # rust streak
    px(img, 7, 7, C["rock"])
    px(img, 6, 8, C["rock"])
    outline(img)
    light = C["fire_red"] if i == 0 else C["fire_yellow"]
    px(img, 6, 5, light)
    if i == 1:
        px(img, 6, 4, (*C["fire_orange"][:3], 160))
        px(img, 7, 5, (*C["fire_orange"][:3], 160))
    return img


def build():
    return strip([frame(0), frame(1)])
