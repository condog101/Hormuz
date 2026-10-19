"""Coastal artillery emplacement: sandbag ring with a gun pointing south (down)."""
import math

from draw import bevel, blob, dither, disc, new, outline, px, rect, rng, strip
from palette import C

NAME = "artillery"
FRAME = (24, 24)
FRAMES = 3
CX, CY = 12, 10


def sandbags(img):
    for i in range(14):
        a = i / 14 * 2 * math.pi
        x = CX + math.cos(a) * 8
        y = CY + math.sin(a) * 7
        disc(img, x, y, 1.6, C["sand"] if i % 2 else C["ochre"])
    bevel(img, light=0.25, dark=-0.3)


def emplacement(firing=False):
    img = new(24, 24)
    sandbags(img)
    disc(img, CX, CY, 5.5, C["rock_dk"])  # pit
    dither(img, CX - 5, CY - 5, CX + 5, CY + 5, C["rock"], only_opaque=True)
    disc(img, CX, CY, 3, C["olive"])  # gun carriage
    px(img, CX - 1, CY - 1, C["sand_lt"])
    rect(img, CX - 1, CY + 2, CX, CY + 11, C["deck"])  # barrel south
    rect(img, CX - 1, CY + 2, CX - 1, CY + 11, C["hull_dk"])
    rect(img, CX - 1, CY + 11, CX, CY + 11, C["black"])
    if firing:
        blob(img, CX - 0.5, CY + 14, 3, [C["white"], C["fire_yellow"], C["fire_orange"]], seed=4)
        for x, y in [(CX - 4, CY + 13), (CX + 3, CY + 13), (CX - 0.5, CY + 18)]:
            px(img, x, y, C["fire_yellow"])
    return outline(img)


def crater():
    img = new(24, 24)
    rnd = rng(9)
    disc(img, CX, CY + 1, 8, C["rock"])
    disc(img, CX, CY + 1, 6, C["rock_dk"])
    disc(img, CX + 1, CY + 2, 3, C["black"])
    for _ in range(14):  # scattered sandbags and debris
        a = rnd.uniform(0, 2 * math.pi)
        d = rnd.uniform(7, 10)
        px(img, CX + math.cos(a) * d, CY + 1 + math.sin(a) * d, rnd.choice([C["sand"], C["ochre"], C["deck"]]))
    rect(img, CX + 3, CY + 4, CX + 8, CY + 5, C["deck"])  # bent barrel
    outline(img)
    for i, (x, y, r) in enumerate([(CX - 2, CY - 3, 2.5), (CX - 4, CY - 6, 2), (CX - 6, CY - 9, 1.5)]):
        c = C["smoke"] if i % 2 == 0 else C["smoke_lt"]
        blob(img, x, y, r, [(*c[:3], 200 - i * 40)], seed=20 + i, density=0.85)
    px(img, CX + 1, CY + 2, C["fire_orange"])
    px(img, CX, CY + 3, C["fire_red"])
    return img


def build():
    return strip([emplacement(), emplacement(firing=True), crater()])
