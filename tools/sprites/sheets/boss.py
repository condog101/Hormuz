"""The opps' mothership: fast-attack-craft tender with speaker stacks on deck, a satellite dish
on the deckhouse and gold trim. Drawn bow-right, then flipped so it faces LEFT."""
from draw import bevel, blob, disc, flip_h, new, outline, px, rect, ring, rng, strip
from palette import C

NAME = "boss"
FRAME = (48, 20)
FRAMES = 3
CY = 10


def half_width(x):
    if x < 2 or x > 46:
        return 0
    if x == 2:
        return 6
    if x <= 28:
        return 7
    return max(1, round(7 * ((46 - x) / 18) ** 0.55))


def base():
    img = new(48, 20)
    for x in range(2, 47):
        hw = half_width(x)
        for y in range(CY - hw, CY + hw):
            img.putpixel((x, y), C["hull_dk"])
    # disruptive camo blotches on the hull sides
    rnd = rng(77)
    for _ in range(26):
        x, y = rnd.randint(3, 42), rnd.randint(3, 16)
        if img.getpixel((x, y))[3]:
            px(img, x, y, C["olive"])
            px(img, x + 1, y, C["olive"])
    bevel(img, light=0.18, dark=-0.35)
    # stern well deck / launch ramp for the swarm boats
    rect(img, 2, 6, 7, 13, C["black"])
    rect(img, 3, 7, 6, 12, C["water_dk"])
    # speaker stacks on the deck: black cabinets, chrome cones, gold badges
    for by in (3, 13):
        rect(img, 9, by, 15, by + 3, C["black"])
        px(img, 10, by + 1, C["chrome"])
        px(img, 13, by + 1, C["chrome"])
        px(img, 10, by + 2, C["hull_dk"])
        px(img, 13, by + 2, C["hull_dk"])
        px(img, 15, by + 3, C["gold"])
    # deckhouse + bridge
    rect(img, 18, 5, 30, 14, C["hull"])
    rect(img, 18, 5, 30, 5, C["gold"])
    rect(img, 18, 5, 18, 14, C["gold"])
    rect(img, 18, 14, 30, 14, C["gold_dk"])
    rect(img, 30, 6, 30, 13, C["water_dk"])  # bridge windows
    rect(img, 23, 8, 25, 11, C["deck"])  # mast base
    # satellite dish on the deckhouse roof
    disc(img, 25, 9.5, 2.4, C["chrome"])
    ring(img, 25, 9.5, 2, C["hull_lt"])
    px(img, 25, 9, C["black"])
    px(img, 26, 9, C["hull_dk"])
    px(img, 27, 8, C["black"])
    # flag + green/white/red stripe on the roof (generic hostile marking)
    px(img, 20, 7, C["olive"])
    px(img, 20, 8, C["white"])
    px(img, 20, 9, C["fire_red"])
    # bow deck gun
    disc(img, 36, 9.5, 2.2, C["hull"])
    rect(img, 37, 9, 43, 10, C["deck"])
    ring(img, 36, 9.5, 2, C["deck"])
    # gold-trimmed missile canisters either side of the deckhouse
    rect(img, 16, 3, 20, 4, C["hull_lt"])
    rect(img, 16, 15, 20, 16, C["hull_lt"])
    px(img, 20, 3, C["gold"])
    px(img, 20, 16, C["gold"])
    return outline(img)


def damaged():
    img = base()
    rnd = rng(81)
    for _ in range(30):
        x, y = rnd.randint(8, 40), rnd.randint(3, 16)
        if img.getpixel((x, y))[3] and img.getpixel((x, y)) != C["black"]:
            px(img, x, y, C["black"] if rnd.random() < 0.5 else C["deck"])
    blob(img, 27, 7, 1.5, [C["fire_yellow"], C["fire_orange"]], seed=82)
    return img


def burning():
    img = damaged()
    blob(img, 24, 10, 3.2, [C["fire_yellow"], C["fire_orange"], C["fire_red"]], seed=90, density=0.9)
    blob(img, 12, 13, 2.2, [C["fire_yellow"], C["fire_orange"], C["fire_red"]], seed=91, density=0.9)
    blob(img, 38, 7, 1.8, [C["fire_yellow"], C["fire_orange"]], seed=92, density=0.9)
    # smoke drifts toward the stern (the ship moves bow-first)
    for i, (x, y, r) in enumerate([(19, 6, 2.2), (14, 4, 2.6), (8, 3, 2.4)]):
        c = C["smoke"] if i % 2 == 0 else C["smoke_lt"]
        blob(img, x, y, r, [(*c[:3], 200 - i * 40)], seed=93 + i, density=0.8)
    return img


def build():
    return strip([flip_h(base()), flip_h(damaged()), flip_h(burning())])
