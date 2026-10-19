"""Floating damage-control crate: hazard-striped with a red cross; glint frame."""
from draw import bevel, new, outline, px, rect, strip
from palette import C

NAME = "pickup"
FRAME = (12, 12)
FRAMES = 2


def frame(i):
    img = new(12, 12)
    rect(img, 1, 1, 10, 10, C["fire_yellow"])
    for k in range(-10, 12, 3):  # hazard stripes on the rim
        for t in range(2):
            for x in range(1, 11):
                y = x + k + t
                if 1 <= y <= 10 and (x in (1, 2, 9, 10) or y in (1, 2, 9, 10)):
                    px(img, x, y, C["black"])
    rect(img, 3, 3, 8, 8, C["white"])
    rect(img, 5, 4, 6, 7, C["fire_red"])
    rect(img, 4, 5, 7, 6, C["fire_red"])
    bevel(img, light=0.25, dark=-0.25)
    outline(img)
    if i == 1:
        for x, y in [(2, 2), (3, 2), (2, 3), (1, 1), (4, 1)]:
            px(img, x, y, C["white"])
    return img


def build():
    return strip([frame(0), frame(1)])
