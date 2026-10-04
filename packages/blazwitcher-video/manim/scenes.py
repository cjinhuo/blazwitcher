"""Transparent, deterministic graphic layers. All product copy lives in Remotion."""

from manim import (
    Circle, Create, FadeIn, FadeOut, LaggedStart, Line, RoundedRectangle,
    Scene, Transform, VGroup, WHITE, UP, RIGHT, smooth,
)

PURPLE = "#A855F7"
PINK = "#EC4899"
BLUE = "#2DB7F5"
INK = "#CBD0DF"


def tab_card(color, width=2.65):
    body = RoundedRectangle(width=width, height=1.03, corner_radius=0.14)
    body.set_fill(WHITE, opacity=0.98).set_stroke(INK, width=1.4)
    dot = Circle(radius=0.095, color=color, fill_opacity=1, stroke_width=0)
    dot.move_to(body.get_left() + RIGHT * 0.27 + UP * 0.17)
    title = Line(dot.get_center() + RIGHT * 0.22, dot.get_center() + RIGHT * 1.48)
    title.set_stroke("#9294A4", width=4)
    subtitle = Line(body.get_left() + RIGHT * 0.48, body.get_right() - RIGHT * 0.3)
    subtitle.shift(UP * -0.16).set_stroke("#E0E0EB", width=3)
    return VGroup(body, dot, title, subtitle)


POSITIONS = [
    (-4.5, 1.8, -0.12), (-1.1, 2.1, 0.07), (2.6, 1.8, -0.05),
    (-3.0, 0.1, 0.10), (0.4, 0.3, -0.08), (3.8, 0.0, 0.11),
    (-4.2, -1.8, -0.04), (-0.6, -1.6, 0.09), (3.0, -1.8, -0.07),
]


class TabSwarm(Scene):
    def construct(self):
        cards = VGroup(*[
            tab_card([PURPLE, BLUE, PINK][i % 3]).rotate(a).move_to([x, y, 0])
            for i, (x, y, a) in enumerate(POSITIONS)
        ])
        self.play(LaggedStart(*[FadeIn(c, shift=UP * -0.18) for c in cards], lag_ratio=0.06), run_time=0.8)
        self.play(*[c.animate.shift(UP * (0.10 if i % 2 else -0.10)) for i, c in enumerate(cards)], run_time=1.8)
        self.wait(0.4)
        self.play(FadeOut(cards, scale=0.94), run_time=0.4)


class TabGrouping(Scene):
    def construct(self):
        colors = [PURPLE, BLUE, PINK]
        cards = VGroup(*[
            tab_card(colors[i % 3]).rotate(a).move_to([x, y, 0])
            for i, (x, y, a) in enumerate(POSITIONS)
        ])
        self.play(FadeIn(cards), run_time=0.4)
        self.wait(0.5)
        frames = VGroup(*[
            RoundedRectangle(width=3.08, height=4.60, corner_radius=0.22)
            .set_fill(color, opacity=0.055).set_stroke(color, width=2, opacity=0.5)
            .move_to([x, 0, 0])
            for x, color in zip([-3.50, 0, 3.50], colors)
        ])
        self.play(LaggedStart(*[Create(f) for f in frames], lag_ratio=0.1), run_time=0.5)
        targets = [
            tab_card(colors[i % 3]).move_to([(i % 3 - 1) * 3.5, 1.15 - (i // 3) * 1.15, 0])
            for i in range(9)
        ]
        self.play(*[Transform(card, target) for card, target in zip(cards, targets)], run_time=1.4, rate_func=smooth)
        self.wait(1.8)
        self.play(FadeOut(VGroup(cards, frames)), run_time=0.4)
