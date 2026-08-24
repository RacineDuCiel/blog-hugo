from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
STATIC = ROOT / "static"
PAPER = "#F6F1E8"
INK = "#17181C"
MUTED = "#62615D"
COBALT = "#2346B7"
SERIF = "/System/Library/Fonts/NewYork.ttf"
SANS = "/System/Library/Fonts/SFNS.ttf"


def font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


def social_card() -> None:
    image = Image.new("RGB", (1200, 630), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((72, 68, 1128, 72), fill=COBALT)
    draw.text((72, 105), "UNE PUBLICATION PERSONNELLE", font=font(SANS, 24), fill=COBALT)
    draw.text((65, 185), "RacineDuCiel", font=font(SERIF, 126), fill=INK)
    lines = [
        "Des essais et des notes sur les livres, les idées,",
        "les systèmes, le corps et la musique.",
    ]
    for index, line in enumerate(lines):
        draw.text((72, 360 + index * 51), line, font=font(SERIF, 39), fill=MUTED)
    draw.text((72, 555), "RACINEDUCIEL.FR", font=font(SANS, 22), fill=INK)
    image.save(STATIC / "og.png", optimize=True)


def favicon() -> None:
    size = 512
    image = Image.new("RGB", (size, size), PAPER)
    draw = ImageDraw.Draw(image)
    draw.rectangle((0, 0, 30, size), fill=COBALT)
    letter = font(SERIF, 330)
    box = draw.textbbox((0, 0), "R", font=letter)
    x = (size - (box[2] - box[0])) / 2 - box[0] + 8
    y = (size - (box[3] - box[1])) / 2 - box[1] - 5
    draw.text((x, y), "R", font=letter, fill=INK)
    image.save(STATIC / "apple-touch-icon.png", optimize=True)
    image.resize((64, 64), Image.Resampling.LANCZOS).save(STATIC / "favicon.png", optimize=True)
    image.save(STATIC / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])


if __name__ == "__main__":
    STATIC.mkdir(parents=True, exist_ok=True)
    social_card()
    favicon()
