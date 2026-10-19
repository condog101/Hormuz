"""5-inch Mk 45 gun mount. Rotated at runtime around its centre (6, 6)."""
from draw import bevel, disc, new, outline, poly, px, rect
from palette import C

NAME = "turret"
FRAME = (12, 12)
FRAMES = 1


def build():
    img = new(12, 12)
    # barrel first so the housing overlaps its breech
    rect(img, 6, 5, 11, 6, C["hull_dk"])
    rect(img, 6, 5, 11, 5, C["hull"])
    px(img, 11, 5, C["deck"])
    px(img, 11, 6, C["deck"])
    # faceted gunhouse (Mk 45 Mod 4 is a sloped wedge from above)
    poly(img, [(2, 3), (6, 2), (8, 4), (8, 7), (6, 9), (2, 8), (1, 6), (1, 5)], C["hull"])
    bevel(img, light=0.3, dark=-0.3)
    px(img, 3, 5, C["hull_lt"])
    px(img, 4, 4, C["hull_lt"])
    px(img, 5, 7, C["hull_dk"])
    outline(img)
    return img
