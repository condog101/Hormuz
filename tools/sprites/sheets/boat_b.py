"""Crips zig-zag attack boat: angular blue/black hull with steel highlights, a twin-engine stern
and a blue pennant."""
from draw import bevel, new, outline, poly, px, rect, strip
from palette import C

NAME = "boat_b"
FRAME = (16, 8)
FRAMES = 2


def body():
    img = new(16, 8)
    poly(img, [(2, 1), (9, 1), (14, 3), (14, 4), (9, 6), (2, 6)], C["water_lt"])
    bevel(img, light=0.2, dark=-0.35)
    for x, y in [(2, 1), (3, 1), (4, 1), (5, 1), (6, 1), (7, 1), (8, 1), (9, 1), (10, 2), (11, 2), (2, 2)]:
        px(img, x, y, C["steel"])  # lit edges
    # black stripe and cockpit
    rect(img, 6, 2, 8, 5, C["black"])
    rect(img, 9, 3, 12, 4, C["suit"])
    px(img, 7, 3, C["skin_dk"])
    px(img, 10, 3, C["steel"])
    # twin outboards
    px(img, 1, 2, C["black"])
    px(img, 1, 5, C["black"])
    # explosive charge on the bow
    px(img, 12, 3, C["fire_yellow"])
    px(img, 12, 4, C["fire_orange"])
    # stern mast with a blue pennant
    px(img, 3, 3, C["deck"])
    px(img, 2, 0, C["water"])
    px(img, 1, 0, C["water_dk"])
    return outline(img)


def frame(i):
    img = body()
    foam = C["foam"]
    pts = [(0, 1), (0, 6), (1, 0), (1, 7)] if i == 0 else [(0, 2), (0, 5), (1, 1), (1, 6)]
    for x, y in pts:
        if img.getpixel((x, y))[3] == 0:
            px(img, x, y, foam)
    return img


def build():
    return strip([frame(0), frame(1)])
