"""Golden studio mic floating on the water (guest-feature pickup); frame 1 is the glint."""
from draw import bevel, ellipse, new, outline, px, rect, strip
from palette import C

NAME = "mic"
FRAME = (12, 12)
FRAMES = 2


def frame(i):
    img = new(12, 12)
    ellipse(img, 3, 0, 8, 6, C["gold"])  # head
    for y in range(1, 6):
        for x in range(3, 9):
            if (x + y) % 2 == 0 and img.getpixel((x, y))[3]:
                px(img, x, y, C["gold_dk"])
    rect(img, 4, 6, 7, 7, C["gold_dk"])  # collar
    rect(img, 5, 8, 6, 10, C["gold"])  # handle
    rect(img, 5, 10, 6, 10, C["gold_dk"])
    bevel(img, light=0.3, dark=-0.2)
    px(img, 4, 2, C["cream"])
    outline(img)
    if i == 1:
        for x, y in [(1, 1), (2, 2), (0, 0), (10, 4), (9, 5), (10, 8)]:
            px(img, x, y, C["white"])
    return img


def build():
    return strip([frame(0), frame(1)])
