"""Drive-by lowrider: side view of a '64 hardtop facing LEFT, candy paint, gold trim, chrome spokes.

Frames 0-4 candy red, 5-9 blue (same body, different paint):
 0 level   1 front up (hydraulics)   2 rear up   3 firing (two gunmen, muzzle flash)   4 wrecked
"""
from draw import blob, disc, new, outline, paste, px, rect, strip
from palette import C

NAME = "lowrider"
FRAME = (24, 12)
FRAMES = 10

RED = (C["candy"], C["candy_dk"], (236, 70, 80, 255))
BLUE = (C["water_lt"], C["water"], C["steel"])
WHEELS = (5, 18)  # wheel centre x (front, rear)


def body(paint, firing=False, wrecked=False):
    """Body only (no wheels), sitting on rows 2..9."""
    main, dark, lite = paint
    if wrecked:
        main, dark, lite = C["deck"], C["black"], C["hull_dk"]
    img = new(24, 12)
    # long low hull: hood, cabin, trunk
    rect(img, 1, 5, 22, 8, main)
    rect(img, 0, 6, 0, 8, main)  # front bumper overhang
    rect(img, 23, 6, 23, 7, main)
    rect(img, 1, 5, 22, 5, lite)  # lit beltline
    rect(img, 1, 8, 22, 8, dark)  # rocker shadow
    rect(img, 0, 7, 23, 7, C["gold"])  # gold trim line
    # roof and pillars
    rect(img, 8, 2, 16, 2, dark)
    rect(img, 7, 3, 17, 4, main)
    rect(img, 8, 3, 11, 4, C["black"])  # tinted windows
    rect(img, 13, 3, 16, 4, C["black"])
    px(img, 8, 3, C["deck"])
    px(img, 13, 3, C["deck"])
    # chrome bumpers, headlight, tail light
    px(img, 0, 6, C["chrome"])
    px(img, 0, 8, C["chrome"])
    px(img, 1, 6, C["fire_yellow"] if not wrecked else C["deck"])
    px(img, 23, 6, C["fire_red"] if not wrecked else C["deck"])
    px(img, 23, 7, C["chrome"])
    if firing:
        # two gunmen leaning out of the windows, muzzle flashes over the roof
        for wx in (9, 14):
            px(img, wx, 3, C["skin_dk"])
            px(img, wx + 1, 3, C["skin_dk"])
            px(img, wx, 2, paint[0])  # bandana in the crew colour
            px(img, wx + 1, 1, C["deck"])  # gun
            px(img, wx + 1, 0, C["deck"])
        blob(img, 10, 0, 1.6, [C["white"], C["fire_yellow"]], seed=31)
        blob(img, 15, 0, 1.6, [C["white"], C["fire_yellow"]], seed=32)
    if wrecked:
        for x, y in [(3, 6), (9, 5), (15, 6), (20, 5), (12, 8)]:
            px(img, x, y, C["rock_dk"])
    return img


def tilt(img, mode):
    """Hydraulics: lift the front (mode 1) or rear (mode 2) by shifting columns up."""
    if mode == 0:
        return img
    out = new(24, 12)
    for x in range(24):
        f = (23 - x) / 23 if mode == 1 else x / 23
        dy = round(f * 2)
        for y in range(12):
            c = img.getpixel((x, y))
            if c[3] and y - dy >= 0:
                out.putpixel((x, y - dy), c)
    return out


def wheels(img, flat=False):
    for cx in WHEELS:
        if flat:
            rect(img, cx - 2, 10, cx + 2, 11, C["black"])
            px(img, cx, 10, C["hull_dk"])
            continue
        disc(img, cx, 9.5, 2.0, C["black"])
        px(img, cx, 9, C["chrome"])  # spokes
        px(img, cx - 1, 10, C["chrome"])
        px(img, cx + 1, 10, C["chrome"])
        px(img, cx, 10, C["gold"])  # gold hub
        px(img, cx - 1, 9, C["hull_lt"])
        px(img, cx + 1, 9, C["hull_lt"])


def frame(paint, i):
    img = new(24, 12)
    if i == 4:
        paste(img, body(paint, wrecked=True), 0, 1)
        wheels(img, flat=True)
        outline(img)
        blob(img, 12, 5, 2.4, [C["fire_yellow"], C["fire_orange"], C["fire_red"]], seed=40, density=0.9)
        blob(img, 6, 4, 1.6, [C["fire_yellow"], C["fire_orange"]], seed=41, density=0.9)
        blob(img, 17, 2, 2.0, [(*C["smoke"][:3], 210)], seed=42, density=0.8)
        blob(img, 20, 1, 1.4, [(*C["smoke_lt"][:3], 170)], seed=43, density=0.8)
        return img
    b = body(paint, firing=(i == 3))
    paste(img, tilt(b, i if i in (1, 2) else 0), 0, 0)
    wheels(img)
    return outline(img)


def build():
    return strip([frame(p, i) for p in (RED, BLUE) for i in range(5)])
