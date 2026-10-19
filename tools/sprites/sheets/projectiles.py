"""Small single-purpose sheets: enemy shell, its ground shadow, aim reticle, friendly round."""
from draw import circle, disc, ellipse, new, px, rect, strip
from palette import C


class Shell:
    NAME = "shell"
    FRAME = (4, 4)
    FRAMES = 1

    @staticmethod
    def build():
        img = new(4, 4)
        rect(img, 1, 0, 2, 3, C["black"])
        rect(img, 0, 1, 3, 2, C["black"])
        rect(img, 1, 1, 2, 2, C["deck"])
        px(img, 1, 1, C["smoke_lt"])
        return img


class ShellShadow:
    NAME = "shell_shadow"
    FRAME = (6, 6)
    FRAMES = 1

    @staticmethod
    def build():
        img = new(6, 6)
        ellipse(img, 0, 1, 5, 4, (*C["black"][:3], 110))
        return img


class Reticle:
    NAME = "reticle"
    FRAME = (16, 16)
    FRAMES = 2

    @staticmethod
    def frame(i):
        img = new(16, 16)
        red = C["fire_red"] if i == 0 else C["fire_orange"]
        r = 6 if i == 0 else 5
        circle(img, 7.5, 7.5, r, red, thickness=1.2)
        # cardinal ticks pointing inward
        gap = 1 if i == 0 else 2
        for k in range(3):
            px(img, 7, 0 + gap + k - 1, red)
            px(img, 8, 0 + gap + k - 1, red)
            px(img, 7, 15 - gap - k + 1, red)
            px(img, 8, 15 - gap - k + 1, red)
            px(img, 0 + gap + k - 1, 7, red)
            px(img, 0 + gap + k - 1, 8, red)
            px(img, 15 - gap - k + 1, 7, red)
            px(img, 15 - gap - k + 1, 8, red)
        if i == 1:
            disc(img, 7.5, 7.5, 1, C["fire_yellow"])
        return img

    @classmethod
    def build(cls):
        return strip([cls.frame(0), cls.frame(1)])


class Round:
    NAME = "round"
    FRAME = (6, 3)
    FRAMES = 1

    @staticmethod
    def build():
        img = new(6, 3)
        px(img, 0, 1, (*C["fire_orange"][:3], 120))
        px(img, 1, 1, C["fire_orange"])
        rect(img, 2, 0, 4, 2, C["fire_yellow"])
        px(img, 2, 0, (*C["fire_yellow"][:3], 140))
        px(img, 2, 2, (*C["fire_yellow"][:3], 140))
        px(img, 3, 1, C["white"])
        px(img, 4, 1, C["white"])
        px(img, 5, 1, C["fire_yellow"])
        return img
