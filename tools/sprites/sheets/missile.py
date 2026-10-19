"""Anti-ship cruise missile, nose right, rocket exhaust flicker at the tail."""
from draw import bevel, new, outline, px, rect, strip
from palette import C

NAME = "missile"
FRAME = (16, 6)
FRAMES = 2


def frame(i):
    img = new(16, 6)
    rect(img, 4, 2, 13, 3, C["white"])
    px(img, 14, 2, C["fire_red"])
    px(img, 14, 3, C["fire_red"])
    rect(img, 11, 2, 11, 3, C["fire_red"])  # warhead band
    # tail fins
    px(img, 5, 1, C["hull"])
    px(img, 4, 1, C["hull"])
    px(img, 5, 4, C["hull"])
    px(img, 4, 4, C["hull"])
    # mid wings
    px(img, 8, 1, C["hull_lt"])
    px(img, 8, 4, C["hull_lt"])
    bevel(img, light=0.0, dark=-0.25)
    outline(img)
    # exhaust
    if i == 0:
        px(img, 2, 2, C["fire_yellow"])
        px(img, 2, 3, C["fire_yellow"])
        px(img, 1, 2, C["fire_orange"])
        px(img, 1, 3, C["fire_orange"])
        px(img, 0, 2, (*C["fire_red"][:3], 160))
    else:
        px(img, 2, 2, C["white"])
        px(img, 2, 3, C["fire_yellow"])
        px(img, 1, 3, C["fire_orange"])
        px(img, 1, 2, C["fire_yellow"])
        px(img, 0, 3, (*C["fire_red"][:3], 160))
        px(img, 0, 2, (*C["fire_orange"][:3], 120))
    return img


def build():
    return strip([frame(0), frame(1)])
