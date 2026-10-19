"""Shore anti-ship missile battery: launcher truck with tubes pointing south."""
from draw import bevel, blob, new, outline, px, rect, rng, strip
from palette import C

NAME = "battery"
FRAME = (24, 24)
FRAMES = 3


def truck(launching=False):
    img = new(24, 24)
    # chassis + cab (cab at the top, tubes aimed down the beach)
    rect(img, 7, 2, 16, 20, C["olive"])
    rect(img, 8, 2, 15, 6, C["sand"])  # cab roof
    rect(img, 9, 5, 14, 5, C["water_dk"])  # windscreen (facing aft/north)
    bevel(img, light=0.25, dark=-0.3)
    # two launch canisters
    for x0 in (8, 12):
        rect(img, x0, 8, x0 + 3, 20, C["hull_dk"])
        rect(img, x0, 8, x0, 20, C["hull"])
        rect(img, x0 + 1, 20, x0 + 2, 20, C["black"])
    # wheels
    for y in (4, 11, 16):
        px(img, 6, y, C["black"])
        px(img, 6, y + 1, C["black"])
        px(img, 17, y, C["black"])
        px(img, 17, y + 1, C["black"])
    # camo netting rolled along the chassis edges
    for y in range(8, 20, 2):
        px(img, 7, y, C["rock_dk"])
        px(img, 16, y + 1, C["rock_dk"])
    if launching:
        # missile leaving the right tube, backblast at the top
        rect(img, 13, 18, 14, 22, C["white"])
        px(img, 13, 23, C["fire_red"])
        px(img, 14, 23, C["fire_red"])
    img = outline(img)
    if launching:
        blob(img, 13.5, 4, 3.5, [C["white"], C["fire_yellow"], C["fire_orange"], C["smoke_lt"]], seed=7)
        blob(img, 9, 1, 2, [(*C["smoke_lt"][:3], 190)], seed=8)
    return img


def wreck():
    img = new(24, 24)
    rnd = rng(13)
    rect(img, 7, 4, 16, 19, C["rock_dk"])
    rect(img, 8, 9, 11, 19, C["deck"])
    rect(img, 12, 11, 15, 17, C["black"])
    for _ in range(18):
        px(img, rnd.randint(4, 19), rnd.randint(2, 22), rnd.choice([C["deck"], C["rock_dk"], C["olive"]]))
    outline(img)
    blob(img, 12, 12, 2.5, [C["fire_yellow"], C["fire_orange"], C["fire_red"]], seed=14, density=0.8)
    blob(img, 10, 7, 2.5, [(*C["smoke"][:3], 210)], seed=15, density=0.85)
    blob(img, 8, 3, 2, [(*C["smoke_lt"][:3], 150)], seed=16, density=0.8)
    return img


def build():
    return strip([truck(), truck(launching=True), wreck()])
