"""Print SVG path data for jagged lightning bolts (midpoint displacement + branches).

Usage: python3 -I bolts.py
"""
import random


def bolt(rng, x0, y0, x1, y1, depth=5, spread=0.22):
    points = [(x0, y0), (x1, y1)]
    offset = spread * ((x1 - x0) ** 2 + (y1 - y0) ** 2) ** 0.5
    for _ in range(depth):
        nxt = [points[0]]
        for (ax, ay), (bx, by) in zip(points, points[1:]):
            mx, my = (ax + bx) / 2, (ay + by) / 2
            dx, dy = bx - ax, by - ay
            length = (dx * dx + dy * dy) ** 0.5 or 1
            nx, ny = -dy / length, dx / length
            d = rng.uniform(-offset, offset)
            nxt += [(mx + nx * d, my + ny * d), (bx, by)]
        points = nxt
        offset *= 0.5
    return points


def to_d(points):
    head, *rest = points
    return f"M{head[0]:.0f} {head[1]:.0f}" + "".join(f"L{x:.0f} {y:.0f}" for x, y in rest)


def strike(seed, x0, y0, x1, y1):
    rng = random.Random(seed)
    trunk = bolt(rng, x0, y0, x1, y1)
    paths = [to_d(trunk)]
    for _ in range(2):
        i = rng.randrange(len(trunk) // 4, len(trunk) * 2 // 3)
        bx, by = trunk[i]
        side = rng.choice([-1, 1])
        ex, ey = bx + side * rng.uniform(50, 100), by + rng.uniform(50, 110)
        paths.append(to_d(bolt(rng, bx, by, ex, ey, depth=4, spread=0.25)))
    return paths


for name, args in {
    'A': (7, 240, 0, 310, 260),
    'B': (13, 1190, 10, 1140, 280),
    'C': (29, 1380, 20, 1290, 330),
    # Narrow screens only see roughly x 250-1190: shorter bolts in the margins beside the title.
    'AN': (41, 380, 0, 330, 230),
    'BN': (53, 1060, 0, 1110, 250),
}.items():
    trunk, *branches = strike(*args)
    print(f'{name}_TRUNK = "{trunk}"')
    for j, b in enumerate(branches):
        print(f'{name}_BRANCH{j} = "{b}"')
