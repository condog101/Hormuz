"""Floating gold record: gold disc, black groove rings, cream label; frame 1 is the glint."""
from draw import bevel, circle, disc, new, outline, px, strip
from palette import C

NAME = "pickup"
FRAME = (12, 12)
FRAMES = 2


def frame(i):
    img = new(12, 12)
    disc(img, 5.5, 5.5, 5.2, C["gold"])
    circle(img, 5.5, 5.5, 4.0, C["black"])
    circle(img, 5.5, 5.5, 2.6, C["gold_dk"])
    disc(img, 5.5, 5.5, 1.6, C["cream"])
    px(img, 5, 5, C["black"])
    px(img, 6, 6, C["black"])
    bevel(img, light=0.3, dark=-0.3)
    outline(img)
    if i == 1:
        for x, y in [(2, 2), (3, 2), (2, 3), (1, 1), (4, 1), (8, 9), (9, 8)]:
            px(img, x, y, C["white"])
    return img


def build():
    return strip([frame(0), frame(1)])
