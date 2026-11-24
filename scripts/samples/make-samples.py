"""Makes the made-up sample launches and TV advertisers for WeekLaunch.

Writes logo and screenshot SVGs to public/samples/ and the database rows to
scripts/samples/samples.json. Every brand here is invented, and every link
points at example.com. Run from the project root:

    python3 scripts/samples/make-samples.py

Image paths are stored relative to the site (pass a base URL to make them absolute).
"""

import json
import math
import os
import sys

BASE = (sys.argv[1] if len(sys.argv) > 1 else "").rstrip("/")
OUT = "public/samples"

# name, tagline, tags, votes, color, shape, extra
products = [
    ("Tidylane", "Calm inbox triage for busy founders", ["Productivity", "AI"], 214, "#2f6fdf", "wave",
     {"plan": "premium"}),
    ("Quillmate", "Write release notes straight from your commits", ["DevTool", "AI"], 187, "#7a4fd6", "quill", {}),
    ("Ledgerleaf", "Bookkeeping that sorts itself out", ["Finance"], 163, "#1f9d6b", "leaf", {}),
    ("Pixelfern", "Turn rough sketches into clean UI mockups", ["Design", "AI"], 151, "#e0569b", "fern",
     {"plan": "premium"}),
    ("Signalbox", "Uptime alerts that only ping you when it matters", ["DevTool", "Analytics"], 138, "#e8772e", "bolt", {}),
    ("Brightloop", "Weekly product analytics in plain English", ["Analytics"], 126, "#f2b705", "loop",
     {"boosted": True}),
    ("Mapleform", "Forms that feel like a friendly chat", ["Marketing", "Productivity"], 117, "#c8442f", "bubble", {}),
    ("Nookdesk", "A focus timer that lives in your Mac menu bar", ["Productivity"], 109, "#3b8f8a", "timer",
     {"mac": ("freemium", ["app_store", "download"], True)}),
    ("Cobaltcast", "Plan a month of social posts in ten minutes", ["Social Media"], 98, "#2446a8", "cast", {}),
    ("Driftnote", "Voice memos that turn into tidy notes", ["AI", "Productivity"], 91, "#8a5cf6", "mic",
     {"mac": ("free", ["download", "homebrew"], True)}),
    ("Ferrypay", "Invoices with payment links built in", ["Finance"], 84, "#0e7c86", "boat", {}),
    ("Lumenkit", "Accessible color palettes from one brand color", ["Design"], 77, "#d9a400", "sun", {}),
    ("Queuebird", "A waitlist page with referrals built in", ["Marketing"], 69, "#4f7cf7", "bird", {}),
    ("Stackpine", "See your API costs per customer", ["DevTool", "Analytics"], 61, "#2e7d4f", "pine", {}),
    ("Hearthly", "Shared calendars for small teams", ["Productivity"], 54, "#d2552b", "home", {}),
    ("Orbitgram", "Track what people say about your product", ["Social Media", "Analytics"], 47, "#5b3fc4", "orbit", {}),
    ("Snapframe", "Clean screenshots of your app in one click", ["Design"], 39, "#111827", "frame",
     {"mac": ("paid", ["app_store"], True)}),
    ("Coinjar", "Envelope budgeting for couples", ["Finance"], 31, "#b7791f", "jar", {}),
    ("Promptshelf", "Save and share your best AI prompts", ["AI"], 22, "#9b2c6f", "shelf", {}),
    ("Echoleaf", "Turn blog posts into short podcast episodes", ["AI", "Marketing"], 12, "#16807a", "echo", {}),
]

descriptions = {
    "Tidylane": "Tidylane reads your inbox each morning and sorts it into reply now, read later and archive, so you start the day with ten emails instead of a hundred. It learns from what you open and never sends anything on its own.",
    "Quillmate": "Connect a repo and Quillmate turns merged pull requests into readable release notes, grouped into new, improved and fixed. Edit the draft, then publish it to your changelog or copy it as Markdown.",
    "Ledgerleaf": "Ledgerleaf connects to your business bank account and sorts every transaction into the right category. At month end you get a profit and loss report you can hand to your accountant.",
    "Pixelfern": "Snap a photo of a whiteboard sketch and Pixelfern turns it into a tidy mockup with real buttons, inputs and spacing. Export to PNG or keep editing in the browser.",
    "Signalbox": "Signalbox checks your site and API every minute from five regions. It only alerts you when a problem lasts, so a single slow request doesn't wake you up at 3 am.",
    "Brightloop": "Brightloop connects to your analytics and sends a short weekly email that says what changed and why, in plain sentences. No dashboards to dig through.",
    "Mapleform": "Mapleform asks one question at a time, like a friendly chat, which keeps people answering. Responses land in a spreadsheet, Slack or your CRM.",
    "Nookdesk": "Nookdesk sits in your Mac menu bar and runs focus sessions with gentle breaks. It can mute notifications while you work and shows a simple weekly streak.",
    "Cobaltcast": "Write once and Cobaltcast drafts posts for each network, spreads them over the month and publishes on time. See everything on one calendar.",
    "Driftnote": "Record a voice memo on your Mac and Driftnote turns it into clean notes with a title, key points and to-dos. Everything stays on your device.",
    "Ferrypay": "Send an invoice with a pay button built in. Ferrypay reminds late clients for you and marks invoices paid the moment money arrives.",
    "Lumenkit": "Pick one brand color and Lumenkit builds a full palette that passes contrast checks, with light and dark versions ready to paste into your CSS.",
    "Queuebird": "Launch a waitlist page in minutes. Queuebird gives every sign-up a referral link, so people move up the list by inviting friends.",
    "Stackpine": "Stackpine tags every API call with the customer who made it, so you can see which accounts cost you the most and price your plans with confidence.",
    "Hearthly": "Hearthly gives small teams one shared calendar for time off, launches and on-call, with a simple view of who's around this week.",
    "Orbitgram": "Orbitgram watches social sites and forums for mentions of your product and sends a daily digest, so you can reply while the conversation is fresh.",
    "Snapframe": "Snapframe captures any window on your Mac and places it on a clean background with a soft shadow, ready for your landing page or a tweet.",
    "Coinjar": "Coinjar splits your shared money into envelopes like rent, food and fun, and shows both of you what's left in each one.",
    "Promptshelf": "Keep your best AI prompts in one place, add variables, and share collections with your team or the whole internet.",
    "Echoleaf": "Paste a blog post link and Echoleaf turns it into a short, natural-sounding podcast episode with its own feed.",
}

premium_extras = {
    "Tidylane": (["Sorts your inbox before you wake up", "Never sends email on its own", "Works with Gmail and Outlook"],
                 [{"q": "Does Tidylane read my email?", "a": "It reads subject lines and senders to sort messages. Nothing is stored after sorting."}]),
    "Pixelfern": (["Works from a phone photo", "Real spacing and components", "Export to PNG or keep editing"],
                  [{"q": "What can I export?", "a": "PNG images today, with Figma export coming soon."}]),
}

ads = [
    {"spot": 1, "brand": "Harborly", "tagline": "The simple CRM for indie founders",
     "details": "Free for your first 500 contacts.", "color": "#f2c14e", "shape": "harbor", "logo": "#1d4ed8"},
    {"spot": 2, "brand": "Parcelpost", "tagline": "Newsletters that land in the inbox",
     "details": "Start free, upgrade at 1,000 readers.", "color": "#7fd1ae", "shape": "parcel", "logo": "#0f766e"},
]


# ---------- logos: a white geometric mark on a rounded brand-color square
def mark(shape):
    s = {
        "wave": '<path d="M28 66c10-14 20-14 30 0s20 14 30 0 20-14 30 0" fill="none" stroke="#fff" stroke-width="10" stroke-linecap="round"/><path d="M28 86c10-14 20-14 30 0s20 14 30 0" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="10" stroke-linecap="round"/>',
        "quill": '<path d="M92 30C60 36 42 60 38 96l12-6c4-22 18-40 42-60z" fill="#fff"/><path d="M38 96l-6 8" stroke="#fff" stroke-width="6" stroke-linecap="round"/>',
        "leaf": '<path d="M34 92C34 54 58 34 96 32c0 38-22 62-60 60z" fill="#fff"/><path d="M38 90L80 48" stroke="currentColor" stroke-width="5" stroke-linecap="round"/>',
        "fern": '<path d="M64 98V34" stroke="#fff" stroke-width="7" stroke-linecap="round"/>' + "".join(
            f'<path d="M64 {44+i*12}l{-16+i*2} -8M64 {44+i*12}l{16-i*2} -8" stroke="#fff" stroke-width="6" stroke-linecap="round"/>' for i in range(5)),
        "bolt": '<path d="M70 26L40 70h22l-6 32 32-46H66z" fill="#fff"/>',
        "loop": '<circle cx="52" cy="64" r="20" fill="none" stroke="#fff" stroke-width="10"/><circle cx="78" cy="64" r="20" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="10"/>',
        "bubble": '<path d="M30 40a10 10 0 0 1 10-10h48a10 10 0 0 1 10 10v30a10 10 0 0 1-10 10H58L42 96V80h-2a10 10 0 0 1-10-10z" fill="#fff"/>',
        "timer": '<circle cx="64" cy="68" r="28" fill="none" stroke="#fff" stroke-width="9"/><path d="M64 68V52M56 30h16" stroke="#fff" stroke-width="8" stroke-linecap="round"/>',
        "cast": '<path d="M34 46a40 40 0 0 1 48 48M34 62a24 24 0 0 1 32 32" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round"/><circle cx="38" cy="90" r="7" fill="#fff"/>',
        "mic": '<rect x="52" y="28" width="24" height="44" rx="12" fill="#fff"/><path d="M40 62a24 24 0 0 0 48 0M64 86v12" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/>',
        "boat": '<path d="M28 74h72l-12 20H40z" fill="#fff"/><path d="M62 30v40H40z" fill="#fff" fill-opacity=".75"/><path d="M66 36v34h22z" fill="#fff"/>',
        "sun": '<circle cx="64" cy="64" r="16" fill="#fff"/>' + "".join(
            f'<path d="M{64+26*math.cos(a):.1f} {64+26*math.sin(a):.1f}L{64+36*math.cos(a):.1f} {64+36*math.sin(a):.1f}" stroke="#fff" stroke-width="7" stroke-linecap="round"/>'
            for a in [i * math.pi / 4 for i in range(8)]),
        "bird": '<path d="M30 70c18-4 30-18 34-36 6 16 18 26 34 28-10 8-22 12-36 12-8 8-18 12-30 12 6-4 8-10 8-16z" fill="#fff"/>',
        "pine": '<path d="M64 26L40 62h14L36 88h56L74 62h14z" fill="#fff"/><path d="M64 88v12" stroke="#fff" stroke-width="8"/>',
        "home": '<path d="M30 62L64 32l34 30v34H30z" fill="#fff"/><rect x="56" y="72" width="16" height="24" rx="2" fill="currentColor"/>',
        "orbit": '<ellipse cx="64" cy="64" rx="36" ry="16" fill="none" stroke="#fff" stroke-width="7" transform="rotate(-25 64 64)"/><circle cx="64" cy="64" r="12" fill="#fff"/>',
        "frame": '<rect x="30" y="38" width="68" height="52" rx="8" fill="none" stroke="#fff" stroke-width="8"/><circle cx="64" cy="64" r="11" fill="#fff"/>',
        "jar": '<path d="M44 40h40v8c8 6 10 14 10 24v14a10 10 0 0 1-10 10H44a10 10 0 0 1-10-10V72c0-10 2-18 10-24z" fill="#fff"/><circle cx="64" cy="76" r="8" fill="currentColor"/>',
        "shelf": '<path d="M30 96h68M30 66h68" stroke="#fff" stroke-width="7" stroke-linecap="round"/><rect x="38" y="36" width="12" height="28" rx="2" fill="#fff"/><rect x="54" y="42" width="12" height="22" rx="2" fill="#fff"/><rect x="72" y="72" width="16" height="22" rx="2" fill="#fff"/>',
        "echo": '<circle cx="46" cy="64" r="9" fill="#fff"/><path d="M62 46a26 26 0 0 1 0 36M74 36a40 40 0 0 1 0 56" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/>',
        "harbor": '<path d="M64 30v58M44 50h40M36 76a28 28 0 0 0 56 0" fill="none" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle cx="64" cy="30" r="7" fill="#fff"/>',
        "parcel": '<path d="M64 28l34 18v38L64 102 30 84V46z" fill="#fff"/><path d="M30 46l34 18 34-18M64 64v38" fill="none" stroke="currentColor" stroke-width="5"/>',
    }
    return s[shape]


def logo_svg(color, shape):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" color="{color}">'
            f'<rect width="128" height="128" rx="28" fill="{color}"/>{mark(shape)}</svg>')


# ---------- screenshots: a made-up app window in the brand color
def shot_svg(name, color, tagline, variant):
    bars = "".join(
        f'<rect x="{360+i*70}" y="{560-h}" width="44" height="{h}" rx="6" fill="{color}" fill-opacity="{0.35+0.08*(i%4)}"/>'
        for i, h in enumerate([120, 180, 150, 240, 200, 290, 260, 330, 300, 380, 340, 420][: 12])
    )
    rows = "".join(
        f'<rect x="360" y="{180+i*78}" width="820" height="60" rx="12" fill="#fff" stroke="#e5e7eb"/>'
        f'<circle cx="396" cy="{210+i*78}" r="14" fill="{color}" fill-opacity="{0.25+0.15*(i%3)}"/>'
        f'<rect x="424" y="{198+i*78}" width="{260-i*18}" height="10" rx="5" fill="#1f2937" fill-opacity=".7"/>'
        f'<rect x="424" y="{216+i*78}" width="{380-i*25}" height="8" rx="4" fill="#9ca3af"/>'
        f'<rect x="1080" y="{198+i*78}" width="76" height="24" rx="12" fill="{color}" fill-opacity=".15"/>'
        for i in range(6)
    )
    body = bars if variant == 1 else rows
    side = "".join(
        f'<rect x="60" y="{200+i*44}" width="{150-(i%3)*20}" height="12" rx="6" fill="#9ca3af" fill-opacity=".7"/>' for i in range(8))
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1270 760">
<rect width="1270" height="760" fill="#f3f4f6"/>
<rect x="0" y="0" width="1270" height="48" fill="#e5e7eb"/>
<circle cx="28" cy="24" r="7" fill="#f87171"/><circle cx="50" cy="24" r="7" fill="#fbbf24"/><circle cx="72" cy="24" r="7" fill="#34d399"/>
<rect x="420" y="14" width="430" height="20" rx="10" fill="#fff"/>
<rect x="0" y="48" width="290" height="712" fill="#fff" stroke="#e5e7eb"/>
<rect x="40" y="84" width="40" height="40" rx="10" fill="{color}"/>
<text x="94" y="112" font-family="Helvetica, Arial, sans-serif" font-size="22" font-weight="700" fill="#111827">{name}</text>
{side}
<text x="360" y="120" font-family="Helvetica, Arial, sans-serif" font-size="30" font-weight="700" fill="#111827">{"This week" if variant == 1 else "Today"}</text>
<text x="360" y="152" font-family="Helvetica, Arial, sans-serif" font-size="17" fill="#6b7280">{tagline}</text>
{body}
<rect x="1040" y="92" width="150" height="44" rx="10" fill="{color}"/>
<rect x="1068" y="110" width="94" height="10" rx="5" fill="#fff" fill-opacity=".9"/>
</svg>'''


os.makedirs(f"{OUT}/logos", exist_ok=True)
os.makedirs(f"{OUT}/shots", exist_ok=True)

rows = []
for name, tagline, tags, votes, color, shape, extra in products:
    slug = name.lower()
    open(f"{OUT}/logos/{slug}.svg", "w").write(logo_svg(color, shape))
    for v in (1, 2):
        open(f"{OUT}/shots/{slug}-{v}.svg", "w").write(shot_svg(name, color, tagline, v))
    premium = extra.get("plan") == "premium"
    hl, faqs = premium_extras.get(name, ([], []))
    row = {
        "slug": slug,
        "name": name,
        "tagline": tagline,
        "description": descriptions[name],
        "website": f"https://example.com/{slug}",
        "tags": tags,
        "logo_glyph": name[:2].upper(),
        "logo_from": color,
        "logo_to": color,
        "logo_url": f"{BASE}/samples/logos/{slug}.svg",
        "screenshots": [f"{BASE}/samples/shots/{slug}-1.svg", f"{BASE}/samples/shots/{slug}-2.svg"],
        "highlights": hl,
        "faqs": faqs,
        "plan": "premium" if premium else "free",
        "boosted": bool(extra.get("boosted")),
        "status": "approved",
        "maker_id": None,
        "maker_name": "WeekLaunch samples",
        "verified": False,
        "upvotes_count": votes,
        "is_sample": True,
        # Same columns on every row, so a batch insert doesn't null the defaults
        "platform": "web",
        "price_model": None,
        "get_from": [],
        "apple_silicon": None,
    }
    if "mac" in extra:
        price, get_from, silicon = extra["mac"]
        row.update(platform="mac", price_model=price, get_from=get_from, apple_silicon=silicon)
    rows.append(row)

ad_rows = []
for a in ads:
    slug = a["brand"].lower()
    open(f"{OUT}/logos/ad-{slug}.svg", "w").write(logo_svg(a["logo"], a["shape"]))
    ad_rows.append({
        "spot": a["spot"], "brand": a["brand"], "tagline": a["tagline"], "details": a["details"],
        "link": f"https://example.com/{slug}", "logo_url": f"{BASE}/samples/logos/ad-{slug}.svg",
        "color": a["color"], "active": True, "is_sample": True,
    })

json.dump({"products": rows, "ads": ad_rows}, open("scripts/samples/samples.json", "w"), indent=1)
print(f"{len(rows)} sample products, {len(ad_rows)} sample ads, images in {OUT}/ (base {BASE or '(relative)'})")
