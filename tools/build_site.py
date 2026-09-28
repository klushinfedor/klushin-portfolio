# -*- coding: utf-8 -*-
"""Генератор статического сайта портфолио Фёдора Клушина."""
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SITE = {
    "name": "Фёдор Клушин",
    "phone": "+7 950 037-08-90",
    "phone_href": "tel:+79500370890",
    "email": "fedor2007kl@gmail.com",
    "tg": "@fod1k",
    "tg_href": "https://t.me/fod1k",
    "behance": "behance.net/fedorklushin",
    "behance_href": "https://www.behance.net/fedorklushin",
    "dprofile": "dprofile.ru/fedorkl",
    "dprofile_href": "https://dprofile.ru/fedorkl",
    "resume": "assets/resume/Fedor-Klushin-resume.pdf",
}

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">'
         '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
         '<link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600'
         '&family=JetBrains+Mono:wght@400;500&family=Unbounded:wght@600;700;800&display=swap" rel="stylesheet">')


def head(base, title, desc):
    return f'''<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:type" content="website">
<link rel="icon" href="{base}assets/favicon.svg" type="image/svg+xml">
{FONTS}
<link rel="stylesheet" href="{base}css/styles.css">
</head>
<body>
<div class="grain" aria-hidden="true"></div>
<a class="skip-link" href="#main">К содержанию</a>'''


def header(base, current):
    def cur(name):
        return ' aria-current="page"' if name == current else ''
    return f'''<header class="site-header">
  <a class="site-header__mark" href="{base}index.html">ФЁДОР&nbsp;КЛУШИН <b>/ BRAND + DIGITAL</b></a>
  <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Меню">
    <span></span><span></span>
  </button>
  <nav class="site-nav" id="site-nav">
    <a href="{base}index.html#work"{cur("work")}>Работы</a>
    <a href="{base}about.html"{cur("about")}>О себе</a>
    <a href="{base}contacts.html"{cur("contacts")}>Контакты</a>
  </nav>
  <span class="site-header__clock" id="clock" aria-hidden="true">СПб&nbsp;—:—</span>
</header>'''


def footer(base):
    s = SITE
    return f'''<footer class="site-footer">
  <div class="site-footer__row">
    <div class="site-footer__links">
      <a href="mailto:{s["email"]}">{s["email"]}</a>
      <a href="{s["phone_href"]}">{s["phone"]}</a>
      <a href="{s["tg_href"]}" target="_blank" rel="noopener">Telegram {s["tg"]}</a>
      <a href="{s["behance_href"]}" target="_blank" rel="noopener">Behance</a>
      <a href="{s["dprofile_href"]}" target="_blank" rel="noopener">Dprofile</a>
    </div>
  </div>
  <p class="site-footer__note">© 2026 {s["name"]} · Санкт-Петербург / удалённо</p>
</footer>
<script src="{base}js/site.js"></script>
</body>
</html>'''


SEAL = '''<div class="seal" aria-hidden="true">
  <svg viewBox="0 0 100 100">
    <g class="seal__ring">
      <path id="sealpath" fill="none" d="M50,50 m-37,0 a37,37 0 1,1 74,0 a37,37 0 1,1 -74,0"/>
      <text><textPath href="#sealpath" startOffset="0">открыт к проектам · 2026 · открыт к проектам · 2026 · </textPath></text>
    </g>
    <circle class="seal__core" cx="50" cy="50" r="17"/>
    <path d="M44 44 L58 44 L58 58 M58 44 L42 60" stroke="var(--accent-ink)" stroke-width="2.4" fill="none"/>
  </svg>
</div>'''

# --------------------------------------------------------------------------
# CASES
# --------------------------------------------------------------------------
CASES = [
    {
        "slug": "alea-linen", "name": "Alea Linen", "num": "01",
        "tag": "Айдентика · упаковка · print-ready",
        "thumb": "assets/cases/alea-linen/thumb.jpg",
        "kicker": "Packaging &amp; brand system · препресс · 2026",
        "lead": 'Фирменный стиль и <b>система носителей</b> для бренда домашнего льна: '
                'палитра с точными CMYK, редакционная типографика, авторский знак и печатные макеты, готовые к тиражу.',
        "meta": [
            ("Роль", "Айдентика носителей · макеты · препресс"),
            ("Скоуп", "Логотип · гайдлайны · палитра · care card · thank-you card · belly band · этикетки · стикеры"),
            ("Инструменты", "Figma · Illustrator · Photoshop"),
            ("Формат", "Brand system + print-ready · AI · EPS · SVG · PDF/X-4"),
        ],
        "note": "// Клиентский заказ — айдентика и материалы для печати.",
        "sections": [
            {"label": "01 — Палитра", "h": "Тёплые природные нейтрали",
             "p": "Четыре оттенка: бумага, лён, флакс, графит. Значения CMYK — стартовые: перед тиражом обязателен "
                  "цветопробный отпечаток на выбранной бумаге, конвертация по ICC-профилю типографии.",
             "swatches": [
                 ("Paper", "Тёплый белый", "#F6F2EC", "RGB 246 242 236 · CMYK 3 2 6 0"),
                 ("Linen", "Льняной", "#E9E4DA", "RGB 233 228 218 · CMYK 7 7 12 0"),
                 ("Flax", "Лён", "#A79D91", "RGB 167 157 145 · CMYK 30 28 34 5"),
                 ("Charcoal", "Графит", "#3C3A36", "RGB 60 58 54 · CMYK 65 60 60 55"),
             ]},
            {"label": "02 — Типографика", "h": "Редакционный голос, служебная ясность",
             "p": "Антиква для голоса бренда, Inter — для инструкций и мелких этикеток. Medium — логотип и заголовки, "
                  "Regular — поддерживающие фразы, Italic — только имя основателя.",
             "imgs": [("alea-linen/pdf/a3-type.jpg", "Alea Linen — типографическая система")]},
            {"label": "03 — Логотип и знак", "h": "Две компоновки и веточка льна",
             "p": "Два утверждённых лок-апа логотипа — вертикальный и в строку. Плюс авторская векторная веточка льна: "
                  "тонкая незалитая линия, только в цветах Charcoal или Flax.",
             "imgs": [("alea-linen/pdf/a5-logo.jpg", "Alea Linen — логотип, две компоновки"),
                      ("alea-linen/pdf/a6-flax.jpg", "Alea Linen — авторский знак, веточка льна")]},
            {"label": "04 — Символы ухода", "h": "Пиктограммы дополняют, не заменяют",
             "p": "Собственные линейные символы ухода идут рядом с текстовой инструкцией: стирка 40°, без отбеливания, "
                  "утюг на средней температуре, естественная сушка.",
             "imgs": [("alea-linen/pdf/a7-care.jpg", "Alea Linen — символы ухода")]},
            {"label": "05 — Подготовка к печати", "h": "Файлы, готовые к тиражу",
             "p": "Физические размеры каждого носителя, вылеты 3 мм, safe zone, радиусы и отверстия. Технические слои "
                  "(cut · drill · fold · safe · notes) не печатаются. Финал — PDF/X-4, true CMYK, AI и EPS.",
             "imgs": [("alea-linen/pdf/a4-print.jpg", "Alea Linen — подготовка к печати, спецификация")]},
        ],
        "archive": {"title": "Полные развороты гайдлайнов", "wide": True,
                    "pdf": "assets/cases/alea-linen/portfolio-watermarked.pdf",
                    "items": [("alea-linen/pdf/thumbs/board-1.jpg", "alea-linen/pdf/board-1.jpg", "Alea Linen — разворот 1"),
                              ("alea-linen/pdf/thumbs/board-2.jpg", "alea-linen/pdf/board-2.jpg", "Alea Linen — разворот 2")]},
    },
    {
        "slug": "off-hours", "name": "OFF HOURS", "num": "02",
        "tag": "Визуальная система · брендбук · арт-дирекшн",
        "thumb": "assets/cases/off-hours/thumb.jpg",
        "kicker": "Fashion visual identity · art direction · 2026",
        "lead": 'Проект для Primography: <b>визуальная система</b> одёжного бренда — '
                'от материала и силуэта до айдентики, луков, упаковки и digital.',
        "meta": [
            ("Роль", "Visual research · арт-дирекшн · fashion-айдентика · упаковка · digital"),
            ("Скоуп", "Исследование · муд-борд · материалы · стайлинг · луки · логотип · упаковка · соцсети"),
            ("Инструменты", "Figma · Photoshop · Illustrator · AI image tools"),
            ("Формат", "Sketchbook / visual register — 15 разворотов, AW26"),
        ],
        "note": "// Разработано в Primography — визуальное исследование и айдентика, AW26.",
        "sections": [
            {"label": "01 — Материал", "h": "Отправная точка — не цвет, а ткань",
             "p": "Палитра собрана от материала: девять оттенков привязаны к органическому хлопку, вареному индиго и "
                  "структурному трикотажу. Цвет калибруется по тому, как пигмент ложится на волокно.",
             "imgs": [("off-hours/pdf/spread-03.jpg", "OFF HOURS — палитра материалов")]},
            {"label": "02 — Силуэт", "h": "Четыре профиля объёма",
             "p": "Приспущенное на 4 см плечо, удлинённый рост брюк, слои, которые вкладываются друг в друга не тесня. "
                  "Посадка спроектирована под свободу движения.",
             "imgs": [("off-hours/pdf/spread-04.jpg", "OFF HOURS — силуэты, четыре профиля")]},
            {"label": "03 — Айдентика", "h": "Клинический каталог поверх тёплой съёмки",
             "p": "Логотип с широким кернингом, монограмма OH, slash-mark O/H. Моноширинный шрифт режет мягкую "
                  "лайфстайл-картинку и приносит в дневник дизайнера строгую каталожную сетку.",
             "imgs": [("off-hours/pdf/spread-05.jpg", "OFF HOURS — айдентика и типографика")]},
            {"label": "04 — Луки AW26", "h": "Гардероб для постоянной ротации",
             "p": "Шесть луков, каждый — флэтлей с разложенными предметами повседневного карри: часы, камера, книга, "
                  "кофе. Одежда читается как история одного дня, а не витрина.",
             "imgs": [("off-hours/pdf/spread-07.jpg", "OFF HOURS — лук 01, cream cable knit"),
                      ("off-hours/pdf/spread-09.jpg", "OFF HOURS — лук 03, burgundy cardigan")]},
            {"label": "05 — Упаковка", "h": "Трим с полной печатной спецификацией",
             "p": "Хэнг-таг на вареном картоне 450 г/м², тканый damask-лейбл по индиго-фону, canvas tote 380 г/м². "
                  "Каждый носитель — с размерами, материалом и штрихкодом.",
             "imgs": [("off-hours/pdf/spread-13.jpg", "OFF HOURS — упаковка и трим")]},
            {"label": "06 — Digital", "h": "Интерфейс как тихая галерея",
             "p": "Веб и соцсети продолжают вещь: много воздуха, неспешная типографика, экран с одной курируемой "
                  "композицией. Веб-хедер, Instagram post и story — в одном ключе.",
             "imgs": [("off-hours/pdf/spread-14.jpg", "OFF HOURS — digital-применения")]},
        ],
        "archive": {"title": "Полный визуальный архив · 15 разворотов",
                    "pdf": "assets/cases/off-hours/portfolio-watermarked.pdf",
                    "items": [(f"off-hours/pdf/thumbs/spread-{i:02d}.jpg", f"off-hours/pdf/spread-{i:02d}.jpg",
                               f"OFF HOURS — разворот {i}") for i in range(1, 16)]},
    },
    {
        "slug": "nora-studio", "name": "NŌRA Studio", "num": "03",
        "tag": "UI/UX · e-commerce веб-дизайн",
        "thumb": "assets/cases/nora-studio/thumb.jpg",
        "kicker": "E-commerce web design · UI/UX · 2025–2026",
        "lead": 'Клиентский проект: <b>визуальная система</b> интернет-магазина для бренда базовой одежды из '
                'органического хлопка — от философии материала до карточки товара с конфигуратором и мобильной версии.',
        "meta": [
            ("Роль", "UI/UX · веб-дизайн · адаптивные сетки · состояния интерфейса"),
            ("Скоуп", "Главная · карточка товара · конфигуратор · «О бренде» · контакты · мобильная версия"),
            ("Инструменты", "Figma · AI image tools"),
            ("Формат", "E-commerce visual system · client project"),
        ],
        "note": "// Дизайн интернет-магазина для заказчика: макеты страниц и мобильной версии.",
        "sections": [
            {"label": "01 — Материал", "h": "Философия начинается с нитки",
             "p": "100% органический хлопковый поплин: плотное плетение держит форму, но дышит. Три тезиса — ткань, "
                  "драп, слои — заданы как редакционный список с макро-съёмкой.",
             "imgs": [("nora-studio/pdf/screen-03.jpg", "NŌRA — философия материала")]},
            {"label": "02 — Силуэт и размер", "h": "Relaxed everyday",
             "p": "Приспущенное плечо, прямой низ, посадка «свободно, но не оверсайз». Размерная сетка S–L с чертежом "
                  "кроя и гайдом по замерам.",
             "imgs": [("nora-studio/pdf/screen-04.jpg", "NŌRA — силуэт и размерная сетка")]},
            {"label": "03 — Главная", "h": "Один экран — одна мысль",
             "p": "Главная как разворот журнала: крупная съёмка, неспешная типографика, единственная чёрная "
                  "кнопка-акцент. Блоки о материале, atelier stories, тихий CTA.",
             "imgs": [("nora-studio/pdf/screen-07.jpg", "NŌRA — главная страница")], "tall": True},
            {"label": "04 — Карточка товара", "h": "Карточка с конфигуратором",
             "p": "Цвет (Ivory / Sage / Charcoal), размер, статус наличия, подсказка по росту модели. Каждое состояние "
                  "конфигуратора отрисовано отдельно.",
             "imgs": [("nora-studio/pdf/screen-02.jpg", "NŌRA — карточка товара, десктоп"),
                      ("nora-studio/pdf/screen-16.jpg", "NŌRA — состояние конфигуратора")]},
            {"label": "05 — Мобильная версия", "h": "Тот же ритм на телефоне",
             "p": "Длинный спокойный скролл, крупные тач-зоны, конфигуратор укладывается в один экран. Сетка "
                  "перестраивается, иерархия сохраняется.",
             "imgs": [("nora-studio/pdf/screen-12.jpg", "NŌRA — мобильная главная"),
                      ("nora-studio/pdf/screen-13.jpg", "NŌRA — мобильная карточка")], "tall": True},
            {"label": "06 — О бренде", "h": "Страница бренда и запрос",
             "p": "«Less but better», material honesty, everyday utility — три принципа плюс форма запроса для прессы "
                  "и опта.",
             "imgs": [("nora-studio/pdf/screen-08.jpg", "NŌRA — страница «О бренде»")], "tall": True},
        ],
        "archive": {"title": "Полный набор экранов · 22 разворота",
                    "pdf": "assets/cases/nora-studio/portfolio-watermarked.pdf",
                    "items": [(f"nora-studio/pdf/thumbs/screen-{i:02d}.jpg", f"nora-studio/pdf/screen-{i:02d}.jpg",
                               f"NŌRA — экран {i}") for i in range(1, 23)]},
    },
]

CASE_BY_SLUG = {c["slug"]: c for c in CASES}


def img_button(base, src, alt, tall=False):
    cls = "spread__img spread__img--tall" if tall else "spread__img"
    full = base + "assets/cases/" + src
    return (f'<button class="{cls}" data-full="{full}" aria-label="Открыть изображение: {alt}">'
            f'<img src="{full}" alt="{alt}" loading="lazy"></button>')


def render_section(base, sec):
    if "swatches" in sec:
        chips = "".join(
            f'<div class="sw"><div class="sw__chip" style="background:{hx}"></div>'
            f'<div class="sw__body"><div class="sw__name">{n} · {ru}</div>'
            f'<div class="sw__hex">{hx}<br>{sub}</div></div></div>'
            for n, ru, hx, sub in sec["swatches"])
        content = f'<div class="swatches">{chips}</div>'
    else:
        tall = sec.get("tall", False)
        btns = "".join(img_button(base, s, a, tall) for s, a in sec["imgs"])
        if len(sec["imgs"]) > 1:
            content = f'<div class="spread__imgs spread__imgs--pair">{btns}</div>'
        else:
            content = f'<div class="spread__imgs">{btns}</div>'
    return f'''<section class="spread reveal">
  <div class="spread__head">
    <span class="spread__label">{sec["label"]}</span>
    <h2 class="spread__h">{sec["h"]}</h2>
    <p class="spread__p">{sec["p"]}</p>
  </div>
  {content}
</section>'''


def build_case(case):
    base = "../"
    idx = CASES.index(case)
    nxt = CASES[(idx + 1) % len(CASES)]
    secs = "\n".join(render_section(base, s) for s in case["sections"])
    meta = "\n".join(f'    <div><dt>{k}</dt><dd>{v}</dd></div>' for k, v in case["meta"])

    arch = case["archive"]
    wide = " sheet--wide" if arch.get("wide") else ""
    cells = "\n".join(
        f'    <button class="sheet__cell" data-full="{base}assets/cases/{full}" aria-label="{alt}">'
        f'<img src="{base}assets/cases/{th}" alt="{alt}" loading="lazy"></button>'
        for th, full, alt in arch["items"])
    archive_html = f'''<section class="archive reveal">
  <div class="archive__head">
    <span>{arch["title"]}</span>
    <a class="archive__dl" href="{base}{arch["pdf"]}" download>Скачать PDF</a>
  </div>
  <div class="sheet{wide}">
{cells}
  </div>
</section>'''

    html = f'''{head(base, f'{case["name"]} — кейс Фёдора Клушина', case["kicker"].replace("&amp;", "и"))}
{header(base, "work")}
<main id="main">
  <section class="case-hero">
    <p class="case-hero__kicker">{case["kicker"]}</p>
    <h1>{case["name"]}</h1>
    <p class="case-hero__lead">{case["lead"]}</p>
  </section>

  <dl class="case-meta">
{meta}
    <p class="note">{case["note"]}</p>
  </dl>

  <div class="story">
{secs}
  </div>

{archive_html}

  <nav class="next-case">
    <a class="next-case__link" href="{base}work/{nxt["slug"]}.html"><span>Следующий проект →</span>{nxt["name"]}</a>
  </nav>
</main>

<div class="lightbox" id="lightbox" role="dialog" aria-modal="true" aria-label="Просмотр изображения">
  <button class="lightbox__close" type="button">Закрыть ✕</button>
  <img alt="" id="lightbox-img">
</div>
{footer(base)}'''
    write(f'work/{case["slug"]}.html', html)


# --------------------------------------------------------------------------
# HOME
# --------------------------------------------------------------------------
def build_home():
    base = ""
    rows = ""
    figs = ""
    for i, c in enumerate(CASES):
        rows += f'''      <a class="row" href="work/{c["slug"]}.html" data-thumb="{i}">
        <span class="row__idx">{c["num"]}</span>
        <span class="row__name">{c["name"]}</span>
        <span class="row__tag">{c["tag"]}</span>
        <img class="row__mini" src="{c["thumb"]}" alt="{c["name"]} — превью" loading="lazy" width="74" height="56">
      </a>
'''
        figs += f'  <div class="preview__fig" data-thumb="{i}"><img src="{c["thumb"]}" alt="" loading="lazy"></div>\n'

    ticker = ('Брендинг <i>✳</i> Упаковка <i>✳</i> Карточки товара <i>✳</i> E‑commerce визуалы <i>✳</i> '
              'Веб‑дизайн <i>✳</i> Препресс <i>✳</i>')

    html = f'''{head(base, "Фёдор Клушин — Brand &amp; Digital Design", "Портфолио графического и веб-дизайнера: брендинг, упаковка, e-commerce визуалы и веб-дизайн. Санкт-Петербург / удалённо.")}
{header(base, "work")}
<main id="main">
  <section class="hero">
    {SEAL}
    <p class="hero__eyebrow reveal">Brand &amp; Digital Design · Санкт‑Петербург / удалённо</p>

    <h1 class="wordmark">
      <span class="line"><span>Фёдор</span></span>
      <span class="line line--out"><span>Клушин</span></span>
    </h1>

    <dl class="hero__facts reveal">
      <div><dt>Роль</dt><dd>Графический&nbsp;+ веб‑дизайнер</dd></div>
      <div><dt>База</dt><dd>Санкт‑Петербург · удалённо</dd></div>
      <div><dt>Фокус</dt><dd>Печать · брендинг · digital</dd></div>
      <div><dt>Инструменты</dt><dd>Figma · Ps · Ai · InDesign · Tilda</dd></div>
    </dl>

    <div class="hero__foot">
      <p class="hero__lead reveal">Выстраиваю <b>визуальный образ бренда</b> целиком — айдентика, упаковка, карточки товаров, сайт — от концепции до печати и вёрстки.</p>
      <a class="scrollcue reveal" href="#work">Листай <span>↓</span></a>
    </div>
  </section>

  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <span>{ticker}</span>
      <span>{ticker}</span>
    </div>
  </div>

  <section class="section" id="work" data-preview>
    <div class="section__head reveal">
      <span>Избранное</span>
      <span>(0{len(CASES)})</span>
    </div>
    <div class="work__list">
{rows}    </div>
  </section>

  <section class="home-about reveal">
    <p>Графический и веб‑дизайнер на стыке печати, брендинга и digital. Ценю чистую иерархию, внимание к деталям и спокойную работу с правками.</p>
    <a class="textlink" href="about.html">Подробнее о себе →</a>
  </section>

  <section class="cta-block" id="contact">
    <a class="cta-block__title reveal" href="mailto:{SITE["email"]}">Напишите<span class="arw">↗</span></a>
    <div class="contact-grid">
      <div class="contact-grid__col reveal"><span>Почта</span><a href="mailto:{SITE["email"]}">{SITE["email"]}</a></div>
      <div class="contact-grid__col reveal"><span>Телефон</span><a href="{SITE["phone_href"]}">{SITE["phone"]}</a></div>
      <div class="contact-grid__col reveal"><span>Telegram</span><a href="{SITE["tg_href"]}" target="_blank" rel="noopener">{SITE["tg"]}</a></div>
      <div class="contact-grid__col reveal"><span>Dprofile</span><a href="{SITE["dprofile_href"]}" target="_blank" rel="noopener">{SITE["dprofile"]}</a></div>
    </div>
  </section>
</main>

<div class="preview" id="preview" aria-hidden="true">
{figs}</div>
{footer(base)}'''
    write("index.html", html)


# --------------------------------------------------------------------------
# ABOUT
# --------------------------------------------------------------------------
def build_about():
    base = ""
    html = f'''{head(base, "О себе — Фёдор Клушин", "Графический и веб-дизайнер на стыке печати, брендинга и digital. Айдентика, упаковка, карточки товаров, веб — от концепции до печати и вёрстки.")}
{header(base, "about")}
<main id="main">
  <header class="page-hero">
    <p class="page-hero__kicker">О себе</p>
    <h1>Профиль</h1>
  </header>

  <section class="about">
    <div class="prose reveal">
      <p>Графический и веб‑дизайнер, работающий на стыке печати, брендинга и digital. Выстраиваю визуальный образ бренда целиком: айдентика, упаковка, карточки товаров, макеты сайта — от концепции до технически выверенного результата, готового к печати или к вёрстке.</p>
      <p>Работаю в Санкт‑Петербурге и удалённо. Ценю чистую визуальную иерархию, внимание к техническим деталям и спокойную работу с правками. Быстро осваиваю новые инструменты, системно веду файлы и версии.</p>
      <a class="btn" href="{SITE["resume"]}" download>Скачать резюме (PDF) ↓</a>
    </div>

    <div class="spec reveal">
      <div class="spec__group">
        <h2>Что делаю</h2>
        <ul class="spec__list">
          <li>Айдентика бренда: логотип, гайдлайны, брендбук</li>
          <li>Упаковка, бирки и вложения в заказ</li>
          <li>Карточки товаров и рекламные e‑commerce‑визуалы</li>
          <li>Макеты к печати: вылеты, safe zones, CMYK, размеры</li>
          <li>Серийная вёрстка многостраничных материалов (InDesign)</li>
          <li>Веб‑дизайн: адаптивные сетки, состояния интерфейса</li>
          <li>Сборка сайтов на Tilda · цели в Яндекс Метрике</li>
          <li>Ретушь, цветокоррекция и AI‑визуалы</li>
        </ul>
      </div>
      <div class="spec__group">
        <h2>Инструменты</h2>
        <ul class="spec__list">
          <li>Figma · Adobe Photoshop · Adobe Illustrator · InDesign</li>
          <li>Tilda · Яндекс Метрика</li>
          <li>AI image tools · Claude · Gemini</li>
          <li>Microsoft Office · Google Workspace</li>
        </ul>
      </div>
      <div class="spec__group">
        <h2>Опыт</h2>
        <ul class="spec__list">
          <li>Primography — помощник по графдизайну и печати: препресс, цветокоррекция, техпроверка файлов</li>
          <li>Югория — специалист по продажам и работе с клиентами: CRM, коммуникация, сроки</li>
        </ul>
      </div>
      <div class="spec__group">
        <h2>Языки и образование</h2>
        <ul class="spec__list">
          <li>Русский — родной · Английский — B2</li>
          <li>Высшая банковская школа (КАП), Страховое дело · 2023–2026</li>
        </ul>
      </div>
    </div>
  </section>
</main>
{footer(base)}'''
    write("about.html", html)


# --------------------------------------------------------------------------
# CONTACTS
# --------------------------------------------------------------------------
def build_contacts():
    base = ""
    s = SITE
    html = f'''{head(base, "Контакты — Фёдор Клушин", "Связаться с Фёдором Клушиным: email, телефон, Telegram, Behance, Dprofile. Санкт-Петербург / удалённо.")}
{header(base, "contacts")}
<main id="main">
  <header class="page-hero">
    <p class="page-hero__kicker">Контакты</p>
    <h1>Написать</h1>
  </header>

  <section class="contacts">
    <p class="contacts__lead reveal">Открыт к задачам по брендингу, упаковке, карточкам товаров и веб‑дизайну. Санкт‑Петербург и удалённо.</p>
    <ul class="contacts__list reveal">
      <li><span>Почта</span><a href="mailto:{s["email"]}">{s["email"]}</a></li>
      <li><span>Телефон</span><a href="{s["phone_href"]}">{s["phone"]}</a></li>
      <li><span>Telegram</span><a href="{s["tg_href"]}" target="_blank" rel="noopener">{s["tg"]}</a></li>
      <li><span>Behance</span><a href="{s["behance_href"]}" target="_blank" rel="noopener">{s["behance"]}</a></li>
      <li><span>Dprofile</span><a href="{s["dprofile_href"]}" target="_blank" rel="noopener">{s["dprofile"]}</a></li>
    </ul>
  </section>
</main>
{footer(base)}'''
    write("contacts.html", html)


# --------------------------------------------------------------------------
def write(rel, content):
    path = os.path.join(ROOT, rel.replace("/", os.sep))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", rel, len(content), "bytes")


if __name__ == "__main__":
    build_home()
    build_about()
    build_contacts()
    for c in CASES:
        build_case(c)
