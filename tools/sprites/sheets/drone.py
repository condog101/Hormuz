"""Delta-wing loitering munition, nose right, pusher prop at the tail."""
from draw import bevel, new, outline, poly, px, rect, strip
from palette import C

NAME = "drone"
FRAME = (20, 12)
FRAMES = 2


def frame(i):
    img = new(20, 12)
    # swept delta wing
    poly(img, [(15, 5), (15, 6), (5, 11), (3, 11), (6, 6), (6, 5), (3, 0), (5, 0)], C["hull_lt"])
    # fuselage
    rect(img, 4, 5, 17, 6, C["hull"])
    px(img, 18, 5, C["hull_dk"])
    px(img, 18, 6, C["hull_dk"])
    bevel(img, light=0.15, dark=-0.3)
    # wingtip fins
    px(img, 3, 0, C["hull_dk"])
    px(img, 3, 11, C["hull_dk"])
    # warhead band + seeker
    px(img, 15, 5, C["fire_red"])
    px(img, 15, 6, C["fire_red"])
    px(img, 17, 5, C["deck"])
    outline(img)
    # prop blur at the tail
    blur = [(1, 3), (1, 4), (1, 7), (1, 8), (2, 5), (2, 6)] if i == 0 else [(1, 4), (2, 3), (2, 8), (1, 7), (0, 5), (0, 6)]
    for x, y in blur:
        px(img, x, y, (*C["smoke_lt"][:3], 170))
    return img


def build():
    return strip([frame(0), frame(1)])
