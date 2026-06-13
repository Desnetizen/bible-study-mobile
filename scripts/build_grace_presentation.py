from pathlib import Path
from math import sin, cos, pi

from PIL import Image, ImageDraw, ImageFilter
from pptx import Presentation
from pptx.dml.color import RGBColor
from pptx.enum.shapes import MSO_SHAPE
from pptx.enum.text import PP_ALIGN, MSO_VERTICAL_ANCHOR
from pptx.util import Inches, Pt


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "grace-presentation"
OUT_PATH = ROOT / "Grace presentation.generated.pptx"


COLORS = {
    "cream": "F6F1E7",
    "paper": "FFFDF8",
    "ink": "17313D",
    "teal": "1F5A64",
    "gold": "C8A24D",
    "olive": "72835B",
    "rose": "9E5B54",
    "sand": "E7D7BF",
    "slate": "52606D",
    "soft_blue": "BFD8E1",
}


def rgb(hex_value):
    hex_value = hex_value.lstrip("#")
    return RGBColor(int(hex_value[0:2], 16), int(hex_value[2:4], 16), int(hex_value[4:6], 16))


def ensure_assets():
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    make_vineyard_sunrise(ASSET_DIR / "vineyard-sunrise.png")
    make_open_bible(ASSET_DIR / "bible-sunlight.png")
    make_justice_scales(ASSET_DIR / "justice-scales.png")
    make_mercy_courtyard(ASSET_DIR / "mercy-courtyard.png")


def gradient_background(img, top_hex, bottom_hex):
    w, h = img.size
    top = tuple(int(top_hex[i:i+2], 16) for i in (0, 2, 4))
    bottom = tuple(int(bottom_hex[i:i+2], 16) for i in (0, 2, 4))
    px = img.load()
    for y in range(h):
        t = y / (h - 1)
        col = tuple(int(top[i] * (1 - t) + bottom[i] * t) for i in range(3))
        for x in range(w):
            px[x, y] = col


def add_round_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def make_vineyard_sunrise(path):
    w, h = 1800, 1013
    img = Image.new("RGBA", (w, h))
    gradient_background(img, "A8B7D1", "F7D6A1")
    draw = ImageDraw.Draw(img, "RGBA")

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    for r, alpha in [(430, 26), (320, 48), (220, 76), (100, 110)]:
      gdraw.ellipse((w * 0.67 - r, h * 0.18 - r, w * 0.67 + r, h * 0.18 + r), fill=(255, 236, 180, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(20))
    img.alpha_composite(glow)

    for idx, y in enumerate([0.48, 0.56, 0.66]):
        color = [(138, 164, 113), (110, 138, 88), (79, 105, 70)][idx]
        points = [(0, h * y + idx * 20), (w * 0.22, h * y - 70), (w * 0.52, h * y + 40), (w, h * y - 20 + idx * 8), (w, h), (0, h)]
        draw.polygon(points, fill=color)

    for i in range(18):
        x = (i * 83) % w
        y = h * 0.22 + (i % 3) * 20
        pts = [(x - 120, y + 210), (w * 0.5, h * 0.65 + i * 2), (x + 460, y + 20)]
        draw.line(pts, fill=(66, 98, 52), width=26 - (i % 4) * 3, joint="curve")

    for i in range(24):
        x = 60 + (i * 89) % (w - 120)
        y = h * 0.78 + (i % 5) * 8
        draw.ellipse((x - 15, y - 24, x + 15, y + 24), fill=(48, 38, 26))

    draw.polygon([(0, h * 0.82), (w, h * 0.82), (w, h), (0, h)], fill=(48, 38, 26))
    draw.polygon([(0, h * 0.72), (w * 0.18, h * 0.63), (w * 0.4, h * 0.7), (w * 0.65, h * 0.61), (w, h * 0.68), (w, h), (0, h)], fill=(57, 70, 40))
    img.convert("RGB").save(path)


def make_open_bible(path):
    w, h = 1800, 1013
    img = Image.new("RGBA", (w, h))
    gradient_background(img, "F4E7CF", "E4D1B8")
    draw = ImageDraw.Draw(img, "RGBA")

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((w * 0.25, h * 0.08, w * 0.78, h * 0.58), fill=(255, 255, 245, 120))
    glow = glow.filter(ImageFilter.GaussianBlur(45))
    img.alpha_composite(glow)

    draw.rounded_rectangle((w * 0.17, h * 0.58, w * 0.83, h * 0.79), radius=18, fill=(108, 70, 31))
    draw.rounded_rectangle((w * 0.19, h * 0.61, w * 0.81, h * 0.77), radius=14, fill=(85, 53, 20))

    left = (w * 0.19, h * 0.23, w * 0.47, h * 0.68)
    right = (w * 0.46, h * 0.23, w * 0.74, h * 0.68)
    draw.rounded_rectangle(left, radius=16, fill=(255, 249, 238))
    draw.rounded_rectangle(right, radius=16, fill=(255, 253, 247))
    for col in range(26):
        x1 = 26 + col * 8
        x2 = w * 0.27 + 26 + col * 8
        draw.rectangle((x1, 18, x1 + 3, h * 0.34), fill=(70, 70, 70, 80))
        draw.rectangle((x2, 18, x2 + 3, h * 0.34), fill=(70, 70, 70, 80))

    draw.arc((w * 0.47, h * 0.12, w * 0.59, h * 0.24), start=0, end=360, fill=(255, 243, 200), width=2)
    draw.ellipse((w * 0.52 - 38, h * 0.18 - 38, w * 0.52 + 38, h * 0.18 + 38), fill=(255, 243, 200, 230))
    img.convert("RGB").save(path)


def make_justice_scales(path):
    w, h = 1800, 1013
    img = Image.new("RGBA", (w, h))
    gradient_background(img, "202833", "0F141A")
    draw = ImageDraw.Draw(img, "RGBA")

    glow = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    gdraw.ellipse((w * 0.22, h * 0.1, w * 0.74, h * 0.68), fill=(255, 219, 140, 52))
    glow = glow.filter(ImageFilter.GaussianBlur(60))
    img.alpha_composite(glow)

    draw.rectangle((0, h * 0.72, w, h), fill=(30, 30, 32))
    gold = (176, 138, 72)
    draw.line((w * 0.5, h * 0.16, w * 0.5, h * 0.64), fill=gold, width=10)
    draw.ellipse((w * 0.5 - 18, h * 0.16 - 18, w * 0.5 + 18, h * 0.16 + 18), fill=gold)
    draw.line((w * 0.28, h * 0.26, w * 0.72, h * 0.26), fill=gold, width=7)
    for side in (-1, 1):
        x = w * 0.5 + side * w * 0.18
        draw.line((w * 0.5 + side * w * 0.08, h * 0.26, x, h * 0.42), fill=gold, width=4)
        draw.arc((x - 52, h * 0.5 - 52, x + 52, h * 0.5 + 52), start=0, end=360, fill=gold, width=4)
        draw.line((x, h * 0.42, x - 55 * side, h * 0.5), fill=gold, width=4)
        draw.line((x, h * 0.42, x + 55 * side, h * 0.5), fill=gold, width=4)
    img.convert("RGB").save(path)


def make_mercy_courtyard(path):
    w, h = 1800, 1013
    img = Image.new("RGBA", (w, h))
    gradient_background(img, "D4D0C6", "BFA58B")
    draw = ImageDraw.Draw(img, "RGBA")

    draw.rectangle((0, h * 0.66, w, h), fill=(165, 146, 126))
    draw.rectangle((0, 0, w, h * 0.16), fill=(255, 255, 255, 20))
    for i in range(4):
        x = w * 0.14 + i * w * 0.18
        draw.rectangle((x, h * 0.14, x + 32, h * 0.66), fill=(197, 184, 162))
    draw.rectangle((w * 0.11, h * 0.62, w * 0.89, h * 0.62 + 28), fill=(239, 235, 225))
    draw.rectangle((w * 0.22, h * 0.54, w * 0.78, h * 0.54 + 20), fill=(239, 235, 225))

    # Jesus
    draw.ellipse((w * 0.28 - 26, h * 0.52 - 152, w * 0.28 + 26, h * 0.52 - 88), fill=(111, 81, 59))
    draw.polygon([(w * 0.28 - 44, h * 0.52 - 90), (w * 0.28 - 8, h * 0.52 - 140), (w * 0.28 + 36, h * 0.52 - 92), (w * 0.28 + 54, h * 0.52 + 28), (w * 0.28 - 58, h * 0.52 + 28)], fill=(231, 224, 214))
    draw.polygon([(w * 0.28 - 54, h * 0.52 - 92), (w * 0.28 - 16, h * 0.52 - 138), (w * 0.28, h * 0.52 - 70), (w * 0.28 - 8, h * 0.52 + 10)], fill=(210, 196, 175))
    draw.polygon([(w * 0.28 + 38, h * 0.52 - 88), (w * 0.28 + 94, h * 0.52 - 4), (w * 0.28 + 72, h * 0.52 + 4), (w * 0.28 + 18, h * 0.52 - 48)], fill=(183, 140, 100))
    draw.line((w * 0.28 + 24, h * 0.52 - 8, w * 0.28 + 98, h * 0.52 + 10), fill=(233, 220, 199), width=8)

    # Woman
    draw.ellipse((w * 0.56 - 20, h * 0.62 - 114, w * 0.56 + 20, h * 0.62 - 66), fill=(92, 70, 90))
    draw.polygon([(w * 0.56 - 58, h * 0.62 - 40), (w * 0.56 - 10, h * 0.62 - 118), (w * 0.56 + 54, h * 0.62 - 42), (w * 0.56 + 34, h * 0.62 + 18), (w * 0.56 - 42, h * 0.62 + 18)], fill=(86, 108, 122))
    draw.polygon([(w * 0.56 - 68, h * 0.62 - 38), (w * 0.56 - 10, h * 0.62 - 104), (w * 0.56 - 2, h * 0.62 - 44)], fill=(159, 122, 79))

    # Onlookers
    for px, py, color in [(0.15, 0.3, (119, 96, 79)), (0.74, 0.28, (126, 103, 84)), (0.78, 0.18, (61, 74, 87))]:
        x, y = w * px, h * py
        draw.ellipse((x - 18, y - 18, x + 18, y + 18), fill=color)
        draw.rectangle((x - 14, y + 18, x + 14, y + 88), fill=color)
    img.convert("RGB").save(path)


def add_header(slide, title, section=""):
    slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, Inches(13.333), Inches(0.65)).fill.solid()
    slide.shapes[-1].fill.fore_color.rgb = rgb(COLORS["teal"])
    slide.shapes[-1].line.fill.background()
    slide.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(0.65), Inches(13.333), Inches(0.06)).fill.solid()
    slide.shapes[-1].fill.fore_color.rgb = rgb(COLORS["gold"])
    slide.shapes[-1].line.fill.background()
    tx = slide.shapes.add_textbox(Inches(0.55), Inches(0.18), Inches(9.2), Inches(0.22))
    p = tx.text_frame.paragraphs[0]
    run = p.add_run()
    run.text = title
    run.font.name = "Georgia"
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = RGBColor(255, 255, 255)
    tx.text_frame.margin_left = 0
    tx.text_frame.margin_right = 0
    tx.text_frame.margin_top = 0
    tx.text_frame.margin_bottom = 0
    if section:
        tx2 = slide.shapes.add_textbox(Inches(10.2), Inches(0.18), Inches(2.55), Inches(0.22))
        p2 = tx2.text_frame.paragraphs[0]
        p2.alignment = PP_ALIGN.RIGHT
        r2 = p2.add_run()
        r2.text = section
        r2.font.name = "Aptos"
        r2.font.size = Pt(9)
        r2.font.italic = True
        r2.font.color.rgb = RGBColor(234, 223, 201)
        tx2.text_frame.margin_left = 0
        tx2.text_frame.margin_right = 0
        tx2.text_frame.margin_top = 0
        tx2.text_frame.margin_bottom = 0


def add_footer(slide, num):
    tx = slide.shapes.add_textbox(Inches(12.58), Inches(7.03), Inches(0.35), Inches(0.16))
    p = tx.text_frame.paragraphs[0]
    p.alignment = PP_ALIGN.RIGHT
    r = p.add_run()
    r.text = f"{num:02d}"
    r.font.name = "Aptos"
    r.font.size = Pt(8)
    r.font.color.rgb = rgb(COLORS["slate"])
    tx.text_frame.margin_left = 0
    tx.text_frame.margin_right = 0
    tx.text_frame.margin_top = 0
    tx.text_frame.margin_bottom = 0


def textbox(slide, left, top, width, height, text, font="Aptos", size=18, color="17313D", bold=False, italic=False, align=PP_ALIGN.LEFT, fit=False):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = MSO_VERTICAL_ANCHOR.TOP
    p = tf.paragraphs[0]
    p.alignment = align
    run = p.add_run()
    run.text = text
    run.font.name = font
    run.font.size = Pt(size)
    run.font.bold = bold
    run.font.italic = italic
    run.font.color.rgb = rgb(color)
    if fit:
        tf.auto_size = 1
    return box


def multi_line_box(slide, left, top, width, height, lines, font="Aptos", size=16, color="17313D", bullet=False):
    box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = box.text_frame
    tf.word_wrap = True
    tf.margin_left = 0
    tf.margin_right = 0
    tf.margin_top = 0
    tf.margin_bottom = 0
    tf.vertical_anchor = MSO_VERTICAL_ANCHOR.TOP
    for i, line in enumerate(lines):
        p = tf.paragraphs[0] if i == 0 else tf.add_paragraph()
        p.level = 0
        if bullet:
          p.bullet = True
        run = p.add_run()
        run.text = line
        run.font.name = font
        run.font.size = Pt(size)
        run.font.color.rgb = rgb(color)
        p.space_after = Pt(9)
    return box


def rounded_box(slide, left, top, width, height, fill, line="C8A24D", radius=True):
    shape = slide.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE if radius else MSO_SHAPE.RECTANGLE, Inches(left), Inches(top), Inches(width), Inches(height))
    shape.fill.solid()
    shape.fill.fore_color.rgb = rgb(fill)
    shape.line.color.rgb = rgb(line)
    shape.line.width = Pt(1)
    return shape


def verse_box(slide, ref, verse, left, top, width, height):
    rounded_box(slide, left, top, width, height, "FFF9EE")
    textbox(slide, left + 0.18, top + 0.08, width - 0.36, 0.16, ref, font="Georgia", size=10, color="72835B", bold=True)
    textbox(slide, left + 0.18, top + 0.26, width - 0.36, height - 0.34, verse, font="Georgia", size=14, color="17313D", italic=True, fit=True)


def question(slide, text, left, top, width):
    rounded_box(slide, left, top, width, 0.46, "FFF7E9")
    textbox(slide, left + 0.16, top + 0.08, width - 0.3, 0.22, text, font="Aptos", size=12, color="17313D")


def build_deck():
    prs = Presentation()
    prs.slide_width = Inches(13.333)
    prs.slide_height = Inches(7.5)
    blank = prs.slide_layouts[6]

    slides = []

    # Slide 1
    s = prs.slides.add_slide(blank)
    s.background.fill.solid()
    s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    s.shapes.add_picture(str(ASSET_DIR / "vineyard-sunrise.png"), 0, 0, width=prs.slide_width, height=prs.slide_height)
    overlay = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, 0, prs.slide_width, prs.slide_height)
    overlay.fill.solid()
    overlay.fill.fore_color.rgb = rgb("17313D")
    overlay.fill.transparency = 0.45
    overlay.line.fill.background()
    lower = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(4.9), prs.slide_width, Inches(2.6))
    lower.fill.solid()
    lower.fill.fore_color.rgb = rgb("17313D")
    lower.fill.transparency = 0.2
    lower.line.fill.background()
    s.shapes.add_shape(MSO_SHAPE.RECTANGLE, Inches(0.7), Inches(5.15), Inches(5.1), Inches(0.08)).fill.solid()
    s.shapes[-1].fill.fore_color.rgb = rgb(COLORS["gold"])
    s.shapes[-1].line.fill.background()
    textbox(s, 0.72, 5.32, 8.7, 0.6, "Grace, Justice denied or Mercy required", font="Georgia", size=24, color="FFFFFF", bold=True)
    textbox(s, 0.74, 5.98, 7.8, 0.3, "Matthew 20:1-16, John 8:1-11, and the scandal of mercy", size=12, color="F7EEDC")
    textbox(s, 0.74, 6.32, 5, 0.18, "Adventist church discussion deck", size=9, color="E8D6B4", italic=True)
    slides.append(s)

    # Slide 2
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "Grace, Justice denied or Mercy required", "Opening")
    s.shapes.add_picture(str(ASSET_DIR / "justice-scales.png"), Inches(8.0), Inches(0.9), width=Inches(5.0), height=Inches(5.9))
    textbox(s, 0.8, 1.05, 5.4, 0.8, "When does grace feel unfair?", font="Georgia", size=24, color=COLORS["ink"], bold=True)
    multi_line_box(s, 0.82, 2.0, 5.2, 1.8, [
        "Start with the feeling in the room.",
        "Most people understand grace as kindness.",
        "But Matthew 20 shows why grace can feel like a threat to fairness, rank, and deservedness.",
    ], size=16, color=COLORS["ink"])
    question(s, "What is your first reaction to the workers who arrived late?", 0.72, 4.38, 5.8)
    question(s, "Where do we see ourselves in the parable?", 0.72, 4.95, 5.8)
    verse_box(s, "Matthew 20:15", "“Am I not allowed to do what I choose with what belongs to me?”", 0.8, 5.65, 5.75, 0.95)
    slides.append(s)

    # Slide 3
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    add_header(s, "Matthew 20:1-16", "The story")
    rounded_box(s, 0.65, 0.98, 6.0, 5.95, "FFFDF8")
    s.shapes.add_picture(str(ASSET_DIR / "vineyard-sunrise.png"), Inches(7.0), Inches(1.0), width=Inches(5.7), height=Inches(5.85))
    textbox(s, 0.95, 1.3, 5.4, 0.8, "The landowner hires workers at different hours, yet pays each the same wage.", font="Georgia", size=20, color=COLORS["ink"], bold=True)
    multi_line_box(s, 1.0, 2.15, 5.1, 2.2, [
        "The complaint is not simply about money.",
        "It is about comparison.",
        "The early workers measure generosity by rank, output, and time served.",
        "Jesus closes the story with a kingdom reversal: the last become first.",
    ], size=15, color=COLORS["ink"])
    verse_box(s, "Matthew 20:13-15", "“Friend, I am doing you no wrong ... Is your eye evil because I am good?”", 0.95, 4.75, 5.2, 1.15)
    slides.append(s)

    # Slide 4
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "What Grace Is", "Definition")
    s.shapes.add_picture(str(ASSET_DIR / "bible-sunlight.png"), Inches(7.4), Inches(0.95), width=Inches(5.4), height=Inches(5.95))
    textbox(s, 0.8, 1.05, 5.9, 0.45, "Grace is God giving what we cannot earn.", font="Georgia", size=22, color=COLORS["teal"], bold=True)
    multi_line_box(s, 0.85, 1.8, 6.0, 2.4, [
        "Grace is favor, gift, rescue, welcome, and divine initiative.",
        "It is not wages for good performance.",
        "It is not God pretending sin does not matter.",
        "Grace is generosity that reaches sinners, not rewards achievers.",
    ], size=15, color=COLORS["ink"])
    question(s, "How would you explain grace to a teenager in one sentence?", 0.72, 4.4, 5.9)
    verse_box(s, "Ephesians 2:8-9", "“By grace are ye saved through faith ... it is the gift of God.”", 0.85, 5.0, 6.0, 1.05)
    slides.append(s)

    # Slide 5
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    add_header(s, "What Grace Is Not", "Clarifying")
    s.shapes.add_picture(str(ASSET_DIR / "justice-scales.png"), Inches(7.6), Inches(1.0), width=Inches(5.0), height=Inches(5.8))
    textbox(s, 0.78, 1.0, 5.6, 0.45, "Grace is not a loophole.", font="Georgia", size=22, color=COLORS["rose"], bold=True)
    multi_line_box(s, 0.86, 1.9, 5.2, 2.25, [
        "Not permission to stay unchanged.",
        "Not the softening of holiness.",
        "Not the cancellation of justice.",
        "Not a divine shrug.",
        "Bonhoeffer called out the danger of “cheap grace.”",
    ], size=15, color=COLORS["ink"])
    verse_box(s, "Titus 2:11-12", "“The grace of God ... teaches us to say No to ungodliness.”", 0.86, 4.85, 5.55, 1.0)
    question(s, "What happens when grace is treated as permission?", 0.86, 6.0, 5.6)
    slides.append(s)

    # Slide 6
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "Grace Words", "Theological vocabulary")
    rounded_box(s, 0.75, 1.05, 11.8, 5.65, "FFFDF8", line=COLORS["sand"])
    items = [
        ("Common grace", "God’s kindness shown broadly in creation, restraint, and providence."),
        ("Prevenient grace", "Grace that goes before, stirring response before conversion."),
        ("Irresistible / effectual grace", "Grace understood by Calvinists as bringing the elect surely to faith."),
        ("Sanctifying grace", "Grace that forms character and holiness after conversion."),
        ("Marvelous grace", "A worshipful way to speak about grace’s wonder."),
        ("Sufficient grace", "Grace enough for weakness, pain, and endurance."),
    ]
    for i, (title, desc) in enumerate(items):
        row = i // 2
        col = i % 2
        x = 1.1 + col * 5.95
        y = 1.5 + row * 1.57
        rounded_box(s, x, y, 5.25, 1.22, "F3F6F1" if i % 2 else "FFF5E5", line=COLORS["gold"])
        textbox(s, x + 0.15, y + 0.12, 5.0, 0.18, title, font="Georgia", size=12, color=COLORS["teal"], bold=True)
        textbox(s, x + 0.15, y + 0.36, 4.95, 0.5, desc, size=11, color=COLORS["ink"])
    question(s, "Which of these terms have you heard used differently in church?", 0.95, 6.0, 11.3)
    slides.append(s)

    # Slide 7
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    add_header(s, "Why We Need Grace", "Human need")
    s.shapes.add_picture(str(ASSET_DIR / "bible-sunlight.png"), Inches(7.3), Inches(1.0), width=Inches(5.65), height=Inches(5.8))
    multi_line_box(s, 0.8, 1.15, 6.0, 2.8, [
        "Because guilt is real.",
        "Because the heart bends toward comparison, pride, and self-justification.",
        "Because we cannot heal ourselves by pretending we are fine.",
        "Because forgiveness is deeper than improvement.",
        "Because mercy meets us where merit cannot.",
    ], size=15, color=COLORS["ink"])
    verse_box(s, "Romans 3:23-24", "“For all have sinned ... and are justified freely by his grace.”", 0.8, 4.55, 6.0, 1.02)
    question(s, "What changes when we stop trying to earn what can only be received?", 0.8, 5.95, 6.0)
    slides.append(s)

    # Slide 8
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "Biblical Examples of Grace", "Scripture")
    rounded_box(s, 0.75, 1.02, 11.85, 5.95, "FFFDF8", line=COLORS["sand"])
    examples = [
        ("Noah", "Grace preserved a remnant through judgment."),
        ("Abraham", "Grace called one man to become a blessing to the nations."),
        ("David", "Grace restored a king after sin and repentance."),
        ("Prodigal son", "Grace ran to meet the one who had already failed."),
        ("Paul", "Grace turned an enemy into a messenger."),
    ]
    for i, (title, desc) in enumerate(examples):
        y = 1.5 + i * 0.95
        rounded_box(s, 1.0, y, 5.45, 0.72, "F4EDE0" if i % 2 == 0 else "EEF5F2", line=COLORS["gold"])
        textbox(s, 1.18, y + 0.12, 1.1, 0.18, title, font="Georgia", size=13, color=COLORS["teal"], bold=True)
        textbox(s, 2.3, y + 0.12, 3.95, 0.18, desc, size=12, color=COLORS["ink"])
    s.shapes.add_picture(str(ASSET_DIR / "bible-sunlight.png"), Inches(7.5), Inches(1.3), width=Inches(4.7), height=Inches(4.0))
    question(s, "Which example best matches the people you are speaking to?", 0.98, 6.1, 6.1)
    slides.append(s)

    # Slide 9
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    add_header(s, "Grace and Justice", "The tension")
    s.shapes.add_picture(str(ASSET_DIR / "justice-scales.png"), Inches(7.35), Inches(1.0), width=Inches(5.55), height=Inches(5.8))
    multi_line_box(s, 0.82, 1.15, 6.0, 2.45, [
        "Justice asks, What is owed?",
        "Mercy asks, What can be spared?",
        "Grace asks, What can be given that is not earned?",
        "In the gospel, justice is not erased; it is fulfilled through mercy in Christ.",
    ], size=15, color=COLORS["ink"])
    verse_box(s, "Psalm 85:10", "Mercy and truth are met together; righteousness and peace have kissed each other.", 0.82, 4.35, 6.0, 1.12)
    question(s, "How does this keep grace from becoming sentimental?", 0.82, 5.95, 6.0)
    slides.append(s)

    # Slide 10
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "Grace in Church Life", "Practice")
    s.shapes.add_picture(str(ASSET_DIR / "vineyard-sunrise.png"), Inches(7.05), Inches(1.0), width=Inches(5.8), height=Inches(5.85))
    multi_line_box(s, 0.82, 1.15, 6.0, 2.7, [
        "Grace welcomes the latecomer.",
        "Grace forgives the slow learner.",
        "Grace corrects without humiliation.",
        "Grace leaves room for growth.",
        "Grace sounds like truth spoken with mercy.",
    ], size=15, color=COLORS["ink"])
    question(s, "What would a grace-shaped Sabbath school class sound like?", 0.82, 4.45, 6.0)
    verse_box(s, "James 2:13", "Mercy triumphs over judgment.", 0.82, 5.05, 6.0, 0.9)
    question(s, "Where do we need more mercy in our church culture?", 0.82, 6.02, 6.0)
    slides.append(s)

    # Slide 8
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "Why Grace Feels Unfair", "The offense")
    s.shapes.add_picture(str(ASSET_DIR / "justice-scales.png"), Inches(7.45), Inches(1.0), width=Inches(5.4), height=Inches(5.8))
    multi_line_box(s, 0.82, 1.25, 5.8, 1.9, [
        "It upsets our accounting.",
        "It levels people who expected hierarchy.",
        "It welcomes latecomers without apology.",
        "It breaks the link between status and blessing.",
    ], size=16, color=COLORS["ink"])
    question(s, "Who are the “late workers” in our churches and communities?", 0.82, 3.5, 6.1)
    question(s, "Why do we instinctively want grace to be rationed?", 0.82, 4.12, 6.1)
    verse_box(s, "Matthew 20:10-12", "“These who were hired last worked only one hour ...”", 0.82, 5.0, 5.95, 1.0)
    slides.append(s)

    # Slide 9
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    add_header(s, "The Landowner Answers", "Matthew 20")
    s.shapes.add_picture(str(ASSET_DIR / "vineyard-sunrise.png"), Inches(7.05), Inches(0.95), width=Inches(5.8), height=Inches(5.95))
    multi_line_box(s, 0.8, 1.1, 6.0, 2.7, [
        "The landowner insists he has not been unjust.",
        "He keeps his promise to the first workers.",
        "Then he chooses generosity for the rest.",
        "The issue is not fairness versus fraud.",
        "The issue is fairness versus generosity.",
    ], size=15, color=COLORS["ink"])
    verse_box(s, "Matthew 20:13-15", "“I am not being unfair to you ... I want to give to the one who was hired last the same as I gave you.”", 0.82, 4.55, 6.0, 1.2)
    question(s, "Do we want grace for ourselves and contracts for everyone else?", 0.82, 6.05, 6.0)
    slides.append(s)

    # Slide 10
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "John 8", "Mercy and holiness")
    s.shapes.add_picture(str(ASSET_DIR / "mercy-courtyard.png"), Inches(7.35), Inches(0.95), width=Inches(5.55), height=Inches(5.95))
    multi_line_box(s, 0.82, 1.1, 6.0, 2.75, [
        "The accusers want punishment.",
        "Jesus exposes their own sin without excusing hers.",
        "He protects the woman from condemnation and calls her away from sin.",
        "Grace does not deny truth; it rescues the sinner inside it.",
    ], size=15, color=COLORS["ink"])
    verse_box(s, "John 8:7, 11", "“He that is without sin among you, let him first cast a stone ... Neither do I condemn thee: go, and sin no more.”", 0.82, 4.55, 6.0, 1.22)
    question(s, "How does Jesus hold mercy and holiness together here?", 0.82, 6.08, 6.0)
    slides.append(s)

    # Slide 11
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    add_header(s, "Voices on Grace", "Quotes")
    rounded_box(s, 0.7, 1.0, 11.9, 5.85, "FFFDF8", line=COLORS["sand"])
    quotes = [
        (0.98, 1.35, 3.55, 1.5, "Bonhoeffer", "“Cheap grace is grace without discipleship.”", "F4E6D5"),
        (4.88, 1.35, 3.55, 1.5, "C. S. Lewis", "“Pride is the complete anti-God state of mind.”", "E5F0EE"),
        (8.78, 1.35, 3.55, 1.5, "Spurgeon", "“It is not thy hold on Christ that saves thee; it is Christ.”", "F6E8E2"),
        (1.95, 3.55, 9.3, 1.45, "A biblical summary", "“By grace are ye saved through faith ... not of works, lest any man should boast.”", "FFF2D9"),
    ]
    for x, y, w, h, title, quote, fill in quotes:
        rounded_box(s, x, y, w, h, fill, line=COLORS["gold"])
        textbox(s, x + 0.15, y + 0.12, w - 0.3, 0.16, title, font="Georgia", size=11, color=COLORS["teal"], bold=True)
        textbox(s, x + 0.16, y + 0.37, w - 0.32, h - 0.46, quote, font="Georgia", size=15, color=COLORS["ink"], italic=True, fit=True)
    question(s, "Which quote best challenges how we talk about grace in church?", 0.95, 5.9, 8.7)
    slides.append(s)

    # Slide 12
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["paper"])
    add_header(s, "Discussion", "Questions")
    s.shapes.add_picture(str(ASSET_DIR / "vineyard-sunrise.png"), Inches(8.25), Inches(0.95), width=Inches(4.6), height=Inches(5.95))
    multi_line_box(s, 0.82, 1.15, 6.5, 3.0, [
        "Use these to open the room up:",
        "1. When has grace felt unfair to you?",
        "2. Which is harder for you: receiving grace or giving it?",
        "3. How does this parable challenge Adventist community life?",
        "4. What does grace ask us to change after it forgives us?",
    ], size=16, color=COLORS["ink"])
    verse_box(s, "Luke 7:47", "“Her sins, which are many, are forgiven; for she loved much.”", 0.82, 4.75, 6.3, 1.0)
    question(s, "Which question should we leave space to answer out loud?", 0.82, 6.05, 6.3)
    slides.append(s)

    # Slide 13
    s = prs.slides.add_slide(blank)
    s.background.fill.solid(); s.background.fill.fore_color.rgb = rgb(COLORS["cream"])
    add_header(s, "Closing", "Invitation")
    s.shapes.add_picture(str(ASSET_DIR / "bible-sunlight.png"), 0, Inches(0.95), width=prs.slide_width, height=Inches(6.55))
    overlay = s.shapes.add_shape(MSO_SHAPE.RECTANGLE, 0, Inches(0.95), prs.slide_width, Inches(6.55))
    overlay.fill.solid()
    overlay.fill.fore_color.rgb = rgb("17313D")
    overlay.fill.transparency = 0.46
    overlay.line.fill.background()
    textbox(s, 0.92, 2.0, 7.5, 1.2, "Grace does not deny justice.\nIt reveals mercy at the heart of God.", font="Georgia", size=24, color="FFFFFF", bold=True)
    multi_line_box(s, 0.95, 3.35, 7.2, 1.15, [
        "So the question is not whether God is good enough to forgive.",
        "The question is whether we will receive the gift, and then live like people who have received it.",
    ], size=14, color="F6EFD9")
    rounded_box(s, 0.95, 5.08, 4.6, 1.0, "FFF1D3", line=COLORS["gold"])
    textbox(s, 1.17, 5.38, 4.15, 0.22, "“The last shall be first.”", font="Georgia", size=20, color=COLORS["ink"], bold=True, italic=True, align=PP_ALIGN.CENTER)
    slides.append(s)

    for idx, slide in enumerate(slides, 1):
        add_footer(slide, idx)

    prs.save(OUT_PATH)


if __name__ == "__main__":
    ensure_assets()
    build_deck()
