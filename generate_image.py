#!/usr/bin/env python3
"""Generate a comic-style image similar to the reference."""

from PIL import Image, ImageDraw, ImageFont

FONT_PATH = "/usr/share/fonts/opentype/ipafont-gothic/ipag.ttf"


def get_font(size):
    try:
        return ImageFont.truetype(FONT_PATH, size)
    except Exception:
        return ImageFont.load_default()


def wrap_text(draw, text, font, max_width):
    lines = []
    for paragraph in text.split("\n"):
        line = ""
        for char in paragraph:
            test = line + char
            bbox = draw.textbbox((0, 0), test, font=font)
            if bbox[2] - bbox[0] > max_width and line:
                lines.append(line)
                line = char
            else:
                line = test
        if line:
            lines.append(line)
    return lines


def draw_speech_bubble(draw, x, y, w, h, text, font, tail_pts=None):
    r = 28
    draw.rounded_rectangle([x, y, x + w, y + h], radius=r, fill="white", outline="black", width=3)
    if tail_pts:
        draw.polygon(tail_pts, fill="white")
        draw.line([tail_pts[0], tail_pts[2]], fill="black", width=3)
        draw.line([tail_pts[1], tail_pts[2]], fill="black", width=3)
        # Re-draw bubble border on top to clean up overlap
        draw.rounded_rectangle([x, y, x + w, y + h], radius=r, outline="black", width=3)

    pad = 22
    lines = wrap_text(draw, text, font, w - pad * 2)
    line_h = font.size + 8
    total_h = len(lines) * line_h
    ty = y + (h - total_h) // 2
    for i, line in enumerate(lines):
        bbox = draw.textbbox((0, 0), line, font=font)
        lw = bbox[2] - bbox[0]
        lx = x + (w - lw) // 2
        draw.text((lx, ty + i * line_h), line, fill="black", font=font)


def draw_claude_robot(draw, cx, cy):
    """Orange blocky robot - Claude mascot style."""
    fill = "#E06030"
    ol = "black"
    lw = 4

    # Head rectangle
    hx, hy, hw, hh = cx - 95, cy - 200, 190, 200
    draw.rectangle([hx, hy, hx + hw, hy + hh], fill=fill, outline=ol, width=lw)

    # Side ear bumps
    bw, bh = 38, 85
    draw.rectangle([hx - bw, hy + 58, hx, hy + 58 + bh], fill=fill, outline=ol, width=lw)
    draw.rectangle([hx + hw, hy + 58, hx + hw + bw, hy + 58 + bh], fill=fill, outline=ol, width=lw)

    # Eyes (black squares)
    es = 44
    draw.rectangle([hx + 22, hy + 58, hx + 22 + es, hy + 58 + es], fill="black")
    draw.rectangle([hx + hw - 22 - es, hy + 58, hx + hw - 22, hy + 58 + es], fill="black")

    # Smile
    draw.arc([hx + 28, hy + 118, hx + hw - 28, hy + hh - 8],
             start=5, end=175, fill="black", width=5)

    # Teeth (white rectangles in smile area)
    for i in range(3):
        tx = hx + 44 + i * 36
        draw.rectangle([tx, hy + hh - 50, tx + 26, hy + hh - 18], fill="white", outline="black", width=2)

    # Body
    bx, by = cx - 110, cy + 10
    draw.rectangle([bx, by, bx + 220, by + 190], fill=fill, outline=ol, width=lw)

    # Legs
    lleg_x = bx + 18
    rleg_x = bx + 220 - 18 - 72
    leg_y = by + 190
    draw.rectangle([lleg_x, leg_y, lleg_x + 72, leg_y + 85], fill=fill, outline=ol, width=lw)
    draw.rectangle([rleg_x, leg_y, rleg_x + 72, leg_y + 85], fill=fill, outline=ol, width=lw)


def draw_anime_girl(draw, cx, cy):
    """Anime-style girl with teal twin tails."""
    skin = "#FFD5B0"
    hair = "#4ECFB0"
    dark = "#1a1a2e"
    ol = "black"
    lw = 3

    # --- Twin tail hair (behind everything) ---
    # Left tail: flowing down-left
    lt = [
        (cx - 68, cy - 95),
        (cx - 90, cy - 110),
        (cx - 145, cy + 50),
        (cx - 160, cy + 150),
        (cx - 130, cy + 160),
        (cx - 100, cy + 90),
        (cx - 55, cy - 70),
    ]
    draw.polygon(lt, fill=hair, outline=ol, width=lw)

    # Right tail: flowing down-right
    rt = [
        (cx + 68, cy - 95),
        (cx + 90, cy - 110),
        (cx + 145, cy + 50),
        (cx + 160, cy + 150),
        (cx + 130, cy + 160),
        (cx + 100, cy + 90),
        (cx + 55, cy - 70),
    ]
    draw.polygon(rt, fill=hair, outline=ol, width=lw)

    # Hair clips
    clip_color = "#cc3344"
    for sx in [-1, 1]:
        cx2 = cx + sx * 75
        draw.rectangle([cx2 - 10, cy - 115, cx2 + 10, cy - 85],
                       fill=clip_color, outline=ol, width=2)

    # --- Face (head ellipse) ---
    head_top = cy - 175
    head_bot = cy - 30
    draw.ellipse([cx - 78, head_top, cx + 78, head_bot], fill=skin, outline=ol, width=lw)

    # --- Hair on head ---
    # Back portion (sides)
    draw.rectangle([cx - 78, cy - 175, cx - 60, cy - 90], fill=hair)
    draw.rectangle([cx + 60, cy - 175, cx + 78, cy - 90], fill=hair)

    # Top hair
    hp = [
        (cx - 80, cy - 130),
        (cx - 75, cy - 180),
        (cx - 40, cy - 195),
        (cx, cy - 200),
        (cx + 40, cy - 195),
        (cx + 75, cy - 180),
        (cx + 80, cy - 130),
        (cx + 65, cy - 110),
        (cx, cy - 105),
        (cx - 65, cy - 110),
    ]
    draw.polygon(hp, fill=hair, outline=ol, width=lw)

    # Bangs (covering forehead slightly)
    bp = [
        (cx - 78, cy - 140),
        (cx - 55, cy - 110),
        (cx - 30, cy - 100),
        (cx + 30, cy - 100),
        (cx + 55, cy - 110),
        (cx + 78, cy - 140),
    ]
    draw.polygon(bp, fill=hair, outline=ol, width=lw)

    face_mid_y = (head_top + head_bot) // 2

    # --- Eyes ---
    ey = face_mid_y + 10
    # Left eye
    draw.ellipse([cx - 48, ey - 16, cx - 12, ey + 16], fill="#3CC8A0", outline=ol, width=2)
    draw.ellipse([cx - 42, ey - 9, cx - 18, ey + 9], fill="black")
    draw.ellipse([cx - 40, ey - 12, cx - 33, ey - 5], fill="white")
    # Right eye
    draw.ellipse([cx + 12, ey - 16, cx + 48, ey + 16], fill="#3CC8A0", outline=ol, width=2)
    draw.ellipse([cx + 18, ey - 9, cx + 42, ey + 9], fill="black")
    draw.ellipse([cx + 33, ey - 12, cx + 40, ey - 5], fill="white")

    # Eyebrows
    draw.arc([cx - 48, ey - 34, cx - 12, ey - 14], start=200, end=340, fill=hair, width=4)
    draw.arc([cx + 12, ey - 34, cx + 48, ey - 14], start=200, end=340, fill=hair, width=4)

    # Blush
    blush = "#FFB0A8"
    draw.ellipse([cx - 65, ey + 10, cx - 35, ey + 24], fill=blush)
    draw.ellipse([cx + 35, ey + 10, cx + 65, ey + 24], fill=blush)

    # Mouth (open / surprised)
    mouth_y = ey + 42
    draw.ellipse([cx - 16, mouth_y - 12, cx + 16, mouth_y + 12],
                 fill="#CC6677", outline=ol, width=2)

    # --- Neck ---
    neck_top = head_bot - 10
    neck_bot = neck_top + 45
    draw.rectangle([cx - 22, neck_top, cx + 22, neck_bot], fill=skin, outline=ol, width=lw)

    # --- Body (dark jacket) ---
    body_top = neck_bot - 5
    body_w = 180
    body_h = 210
    draw.rectangle([cx - body_w // 2, body_top, cx + body_w // 2, body_top + body_h],
                   fill=dark, outline=ol, width=lw)

    # White shirt/collar V
    v_pts = [
        (cx - 22, body_top),
        (cx + 22, body_top),
        (cx + 12, body_top + 70),
        (cx - 12, body_top + 70),
    ]
    draw.polygon(v_pts, fill="white", outline=ol, width=2)

    # --- Arms ---
    arm_top = body_top + 20
    arm_bot = body_top + body_h - 20
    # Left arm
    draw.polygon([
        (cx - body_w // 2, arm_top),
        (cx - body_w // 2 - 45, arm_top + 30),
        (cx - body_w // 2 - 60, arm_bot),
        (cx - body_w // 2, arm_bot),
    ], fill=dark, outline=ol, width=lw)
    # Right arm
    draw.polygon([
        (cx + body_w // 2, arm_top),
        (cx + body_w // 2 + 45, arm_top + 30),
        (cx + body_w // 2 + 60, arm_bot),
        (cx + body_w // 2, arm_bot),
    ], fill=dark, outline=ol, width=lw)

    # Hands (clasped, resting)
    hands_y = arm_bot - 10
    draw.ellipse([cx - 95, hands_y, cx + 95, hands_y + 50], fill=skin, outline=ol, width=lw)
    # Finger lines
    for fx in [-50, -20, 10, 40]:
        draw.line([(cx + fx, hands_y + 5), (cx + fx, hands_y + 42)], fill=ol, width=2)

    # --- Question marks ---
    q_font = get_font(44)
    draw.text((cx + 95, cy - 165), "？", fill="black", font=q_font)
    draw.text((cx + 135, cy - 140), "？", fill="black", font=q_font)


def main():
    W, H = 1080, 1080
    img = Image.new("RGB", (W, H), "white")
    draw = ImageDraw.Draw(img)

    font_lbl = get_font(26)
    font_med = get_font(34)
    font_bot = get_font(54)

    # Characters
    claude_cx, claude_cy = 280, 560
    girl_cx, girl_cy = 760, 580

    draw_claude_robot(draw, claude_cx, claude_cy)
    draw_anime_girl(draw, girl_cx, girl_cy)

    # ---- Speech bubble 1: top-left (Claude speaking) ----
    b1x, b1y, b1w, b1h = 60, 25, 720, 145
    tail1 = [(b1x + 50, b1y + b1h), (b1x + 110, b1y + b1h), (claude_cx - 30, 350)]
    draw_speech_bubble(draw, b1x, b1y, b1w, b1h,
                       "ストーリーズ台本、投稿文、\n商品設計、完了しました",
                       font_med, tail_pts=tail1)
    draw.text((b1x + 18, b1y + 8), "Claude Code", fill="#666666", font=font_lbl)

    # ---- Speech bubble 2: right (girl speaking) ----
    b2x, b2y, b2w, b2h = 530, 195, 490, 105
    tail2 = [(b2x + 30, b2y + b2h), (b2x + 90, b2y + b2h), (girl_cx - 40, 455)]
    draw_speech_bubble(draw, b2x, b2y, b2w, b2h,
                       "私「…私の仕事は?」",
                       font_med, tail_pts=tail2)

    # ---- Speech bubble 3: bottom-left (Claude speaking) ----
    b3x, b3y, b3w, b3h = 30, 820, 510, 145
    tail3 = [(b3x + 60, b3y), (b3x + 130, b3y), (claude_cx - 10, 790)]
    draw_speech_bubble(draw, b3x, b3y, b3w, b3h,
                       "確認と投稿ボタンを\n押すことです",
                       font_med, tail_pts=tail3)
    draw.text((b3x + 18, b3y + 8), "Claude Code", fill="#666666", font=font_lbl)

    # ---- Bottom bold text ----
    bottom_text = "AIに全部任せて、私は確認係に…?"
    bbox = draw.textbbox((0, 0), bottom_text, font=font_bot)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, 985), bottom_text, fill="black", font=font_bot)

    out = "/home/user/Hiina88/comic.png"
    img.save(out)
    print(f"Saved {out}")


if __name__ == "__main__":
    main()
