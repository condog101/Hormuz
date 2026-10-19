"""Fast inshore attack speedboat: white fibreglass hull, olive deck, gunman."""
from draw import bevel, new, outline, poly, px, rect, strip
from palette import C

NAME = "boat_a"
FRAME = (16, 8)
FRAMES = 2


def body():
    img = new(16, 8)
    poly(img, [(3, 1), (11, 1), (14, 3), (14, 4), (11, 6), (3, 6)], C["white"])
    bevel(img, light=0.0, dark=-0.25)
    rect(img, 5, 2, 10, 5, C["olive"])
    rect(img, 5, 2, 10, 2, C["sand"])
    px(img, 4, 3, C["black"])  # outboard motor
    px(img, 4, 4, C["black"])
    px(img, 8, 3, C["skin_dk"])  # gunman
    px(img, 9, 3, C["deck"])
    px(img, 10, 3, C["deck"])  # gun barrel
    px(img, 11, 3, C["deck"])
    px(img, 12, 3, C["hull_lt"])  # windscreen glint
    px(img, 12, 4, C["water_lt"])
    return outline(img)


def frame(i):
    img = body()
    foam = C["foam"]
    wake = [(0, 2), (1, 3), (2, 4), (0, 5), (1, 3)] if i == 0 else [(1, 2), (0, 3), (2, 3), (1, 5), (0, 4)]
    for x, y in wake:
        if img.getpixel((x, y))[3] == 0:
            px(img, x, y, foam)
    px(img, 15 - i, 0 if i == 0 else 7, foam)  # bow spray
    return img


def build():
    return strip([frame(0), frame(1)])
