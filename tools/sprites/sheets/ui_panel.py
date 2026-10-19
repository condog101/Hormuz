"""9-slice UI panel (16px borders): navy fill, 2px steel frame, corner rivets."""
from draw import new, px, rect
from palette import C

NAME = "ui_panel"
FRAME = (48, 48)
FRAMES = 1


def build():
    img = new(48, 48)
    rect(img, 0, 0, 47, 47, C["black"])
    rect(img, 1, 1, 46, 46, C["steel"])
    rect(img, 2, 2, 45, 45, C["hull_lt"])
    # bottom/right of the frame in shade
    rect(img, 1, 46, 46, 46, C["hull_dk"])
    rect(img, 46, 1, 46, 46, C["hull_dk"])
    rect(img, 2, 45, 45, 45, C["hull"])
    rect(img, 45, 2, 45, 45, C["hull"])
    rect(img, 3, 3, 44, 44, C["black"])
    rect(img, 4, 4, 43, 43, C["suit"])
    rect(img, 4, 4, 43, 4, C["suit_lt"])  # inner top light
    # rounded outer corners
    for x, y in [(0, 0), (47, 0), (0, 47), (47, 47)]:
        px(img, x, y, (0, 0, 0, 0))
    # rivets in each 16px corner cell
    for cx, cy in [(7, 7), (40, 7), (7, 40), (40, 40)]:
        px(img, cx, cy, C["steel"])
        px(img, cx + 1, cy, C["hull"])
        px(img, cx, cy + 1, C["hull"])
        px(img, cx + 1, cy + 1, C["hull_dk"])
    return img
