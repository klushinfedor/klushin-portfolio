from pathlib import Path
from io import BytesIO
from PIL import Image, ImageDraw, ImageFont
import fitz
import os
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader

ROOT=Path("assets/cases")
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
SETS={
    "emra": [ROOT/"emra"/(n+".png") for n in ("intro","key-visual","landing","catalog","social")],
    "nora-studio": sorted((ROOT/"nora-studio/pdf").glob("screen-??.jpg")),
    "alea-linen": [ROOT/"alea-linen/pdf"/n for n in ("a1-cover.jpg","a2-palette.jpg","a3-type.jpg","a4-print.jpg","a5-logo.jpg","a6-flax.jpg","a7-care.jpg","board-1.jpg","board-2.jpg")],
    "off-hours": sorted((ROOT/"off-hours/pdf").glob("spread-??.jpg")),
    "veyra": [ROOT/"veyra/logo.png"],
    "darya-t": [ROOT/"darya-t/preview.png"],
}
def watermark(source):
    if source.suffix == ".svg":
        document=fitz.open(stream=source.read_bytes(),filetype="svg")
        image=Image.open(BytesIO(document[0].get_pixmap(alpha=False).tobytes("png"))).convert("RGB")
        document.close()
    else:
        image=Image.open(source).convert("RGB")
    if max(image.size)>2300:
        image.thumbnail((2300,2300),Image.Resampling.LANCZOS)
    w,h=image.size
    overlay=Image.new("RGBA",(w,h),(0,0,0,0))
    tile=Image.new("RGBA",(int(w*1.65),int(h*1.65)),(0,0,0,0))
    draw=ImageDraw.Draw(tile)
    font=ImageFont.truetype(FONT,max(31,int(min(w,h)*.057)))
    phrase="ФЁДОР КЛУШИН  ·  ПОРТФОЛИО"
    bbox=draw.textbbox((0,0),phrase,font=font,stroke_width=1)
    tw=bbox[2]-bbox[0]
    gap=int(w*.20)
    step=max(1,tw+gap)
    for y in range(-int(h*.6),int(h*2),max(160,int(h*.36))):
        for x in range(-int(w*.7),int(w*2),step):
            draw.text((x,y),phrase,font=font,fill=(255,255,255,52),stroke_width=1,stroke_fill=(20,20,20,40))
    rotated=tile.rotate(17,resample=Image.Resampling.BICUBIC,expand=False)
    left=(rotated.width-w)//2; top=(rotated.height-h)//2
    overlay=rotated.crop((left,top,left+w,top+h))
    image=Image.alpha_composite(image.convert("RGBA"),overlay).convert("RGB")
    return image

for slug, images in SETS.items():
    selected=os.environ.get("CASE_PDF_ONLY")
    if selected and slug not in selected.split(","):
        continue
    images=[p.with_name(p.stem+"-client.svg") if p.with_name(p.stem+"-client.svg").exists() else p for p in images]
    assert images and all(p.exists() for p in images),(slug,images)
    output=ROOT/slug/"portfolio-watermarked.pdf"
    pdf=None
    for p in images:
        im=watermark(p)
        w,h=im.size
        if pdf is None: pdf=canvas.Canvas(str(output),pagesize=(w*.55,h*.55),pageCompression=1)
        pdf.setPageSize((w*.55,h*.55))
        buf=BytesIO();im.save(buf,"JPEG",quality=90,optimize=True,subsampling=0);buf.seek(0)
        pdf.drawImage(ImageReader(buf),0,0,width=w*.55,height=h*.55)
        pdf.showPage()
    pdf.setTitle(slug+" — Фёдор Клушин | Портфолио")
    pdf.setAuthor("Фёдор Клушин")
    pdf.save()
    print(slug,len(images),output.stat().st_size)
