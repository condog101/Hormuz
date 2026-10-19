"""Album-cover title plate: STRAIGHT OUTTA / HORMUZ in Press Start 2P, red and gold stripe, spray speckle."""
from draw import font_text, font_text_width, new, px, rect, rng
from palette import C

NAME = "title_logo"
FRAME = (232, 104)
FRAMES = 1

W, H = FRAME


def build():
    img = new(W, H, C["black"])
    # chrome / gold frame
    rect(img, 0, 0, W - 1, H - 1, C["gold_dk"])
    rect(img, 1, 1, W - 2, H - 2, C["gold"])
    rect(img, 0, 0, W - 1, 0, C["chrome"])
    rect(img, 0, 0, 0, H - 1, C["chrome"])
    rect(img, 2, 2, W - 3, H - 3, C["black"])
    # spray speckle in the plate corners
    rnd = rng(1991)
    for _ in range(170):
        x, y = rnd.randint(3, W - 4), rnd.randint(3, H - 4)
        d = min(x, W - 1 - x) + min(y, H - 1 - y)
        if rnd.random() < max(0.05, 1 - d / 40):
            px(img, x, y, C["gold_dk"] if rnd.random() < 0.6 else C["candy_dk"])
    # STRAIGHT OUTTA
    top = "STRAIGHT OUTTA"
    tw = font_text_width(top, 16)
    font_text(img, (W - tw) // 2 + 1, 13, top, 16, C["black"])
    font_text(img, (W - tw) // 2, 12, top, 16, C["cream"])
    # HORMUZ with a candy drop shadow
    big = "HORMUZ"
    bw = font_text_width(big, 32)
    bx = (W - bw) // 2
    font_text(img, bx + 3, 39, big, 32, C["candy_dk"])
    font_text(img, bx + 2, 38, big, 32, C["candy"])
    font_text(img, bx, 36, big, 32, C["gold"])
    # chrome highlight on the top row of the big letters
    for x in range(bx, bx + bw):
        if img.getpixel((x, 36)) == C["gold"]:
            px(img, x, 36, C["cream"])
    # red stripe with gold rules
    rect(img, 2, 80, W - 3, 80, C["gold"])
    rect(img, 2, 81, W - 3, 89, C["candy"])
    rect(img, 2, 86, W - 3, 89, C["candy_dk"])
    rect(img, 2, 90, W - 3, 90, C["gold"])
    # stripe slashes
    for k in range(6, W - 6, 14):
        for y in range(81, 90):
            px(img, k + (89 - y) // 2, y, C["black"])
    # bottom line
    rect(img, 2, 96, W - 3, 96, C["gold_dk"])
    return img
