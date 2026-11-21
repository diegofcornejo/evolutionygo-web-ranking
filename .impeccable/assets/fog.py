"""Render a horizontally tileable fog texture: white ink, density in alpha.

Usage: python3 -I fog.py <out.png> <seed> [peak 0..1]
"""
import sys

import numpy as np
from PIL import Image

W, H = 2048, 512
out, seed = sys.argv[1], int(sys.argv[2])
rng = np.random.default_rng(seed)


def periodic_value_noise(cells_x, cells_y):
    grid = rng.random((cells_y + 1, cells_x))
    xs = np.linspace(0, cells_x, W, endpoint=False)
    ys = np.linspace(0, cells_y, H, endpoint=False)
    x0 = np.floor(xs).astype(int)
    y0 = np.floor(ys).astype(int)
    fx = xs - x0
    fy = ys - y0
    sx = fx * fx * (3 - 2 * fx)
    sy = fy * fy * (3 - 2 * fy)
    x1 = (x0 + 1) % cells_x
    a = grid[y0][:, x0]
    b = grid[y0][:, x1]
    c = grid[y0 + 1][:, x0]
    d = grid[y0 + 1][:, x1]
    top = a + (b - a) * sx
    bottom = c + (d - c) * sx
    return top + (bottom - top) * sy[:, None]


noise = np.zeros((H, W))
amp, total = 1.0, 0.0
for cx, cy in [(4, 2), (8, 4), (16, 8), (32, 16), (64, 32)]:
    noise += amp * periodic_value_noise(cx, cy)
    total += amp
    amp *= 0.5
noise /= total

# Billowy fog: push mids apart, keep wisps soft.
fog = np.clip((noise - 0.32) / 0.5, 0, 1) ** 1.6

# A soft band: zero at the top and bottom edges, densest at `peak`.
y = np.linspace(0, 1, H)[:, None]
peak = float(sys.argv[3]) if len(sys.argv) > 3 else 0.55
rise = np.clip(y / peak, 0, 1)
fall = np.clip((1 - y) / (1 - peak), 0, 1)
envelope = (np.sin(np.minimum(rise, fall) * np.pi / 2)) ** 1.4
alpha = np.clip((fog * 1.25 + 0.18) * envelope, 0, 1)

rgba = np.zeros((H, W, 4), dtype=np.uint8)
rgba[..., :3] = 255
rgba[..., 3] = (alpha * 255).astype(np.uint8)
Image.fromarray(rgba, 'RGBA').save(out)
