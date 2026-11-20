# JIMMY SPORTS CLUB (JSC) — OFFICIAL DIGITAL PLATFORM
## Premium Cricket Sports Brand Website | Design, Development & Deployment

Welcome to the official, production-ready website for **Jimmy Sports Club (JSC)**, Muzaffarpur, Bihar.

This platform establishes a digital identity for JSC, positioning it as an international-standard sports destination and cricket academy.

---

## 1. Brand Identity & Design System

### Color Palette
- **Deep Forest Green:** `#061B13` (Dominant backdrop)
- **Dark Emerald:** `#063D2E` (Surfaces, panels, container depth)
- **Secondary Emerald:** `#123D2B` (Borders, structural contrast)
- **Rich Green Gradient:** `#0A281B` (Lighting glows, accents)
- **Electric Lime:** `#B6FF36` (Highlights, CTAs, badges, active states)
- **Hot White:** `#F7F9F5` (Primary athletic typography & icons)
- **Near Black:** `#050807` (Deep cinematic background contrast)

### Visual Philosophy
- **Glassmorphism:** Frosted translucent panels (`backdrop-filter: blur(18px)`), semi-transparent white borders, lime illumination rings, and floating telemetry cards.
- **Cinematic Atmosphere:** Stadium floodlight cones, pitch crease perspectives, athletic silhouette vectors, particle sparkles.
- **Typography:** Display uppercase athletic headers (`Syne` / `Outfit`) combined with high-legibility geometric sans (`Plus Jakarta Sans`).

---

## 2. Project Directory Structure

```
/JSC WEBPAGE CREATION/
├── index.html                   # Main production website (All 15 sections)
├── 404.html                     # Custom branded 404 error page
├── .htaccess                    # Hostinger Apache / LiteSpeed server rules (SSL, Gzip, Caching)
├── favicon.svg                  # Brand SVG favicon
├── sitemap.xml                  # SEO XML sitemap
├── robots.txt                   # Search crawler directives
├── README.md                    # Master documentation & content management
├── DEPLOYMENT-HOSTINGER.md      # Step-by-step Hostinger upload instructions
├── MIGRATION-GUIDE.md           # 301 redirects, Search Console & Google Business migration
└── assets/
    ├── css/
    │   ├── style.css            # Core design system tokens, typography, glassmorphism
    │   └── components.css       # Section components, hero, pricing, gallery, responsive grids
    ├── js/
    │   ├── jsc-config.js        # Centralized configuration (PRICING, OFFERS, CONTACTS)
    │   ├── pricing.js           # Interactive pricing calculator & WhatsApp generator
    │   └── main.js              # Navbar, mobile menu, gallery lightbox, scroll animations
    ├── images/
    │   ├── hero/                # Cinematic hero cricket batsman vector artwork
    │   ├── facilities/          # Floodlit turf, covered nets, automated bowling machine
    │   ├── academy/             # Academy coaching & youth drills
    │   ├── achievements/        # Tournaments & championship trophies
    │   ├── gallery/             # Filterable sports photography gallery items
    │   └── placeholders/        # Formatted asset placeholder for user photos
    ├── logo/
    │   ├── jsc-logo.svg         # Official vector brand logo (Full emblem + text)
    │   └── jsc-symbol.svg       # Brand monogram symbol
    └── icons/                   # Custom athletic SVGs (turf, nets, bowling machine, etc.)
```

---

## 3. How to Update Pricing, Offers & Content (No Developer Needed!)

All dynamic content is controlled in one single file:
&rarr; **`assets/js/jsc-config.js`**

Open this file in any text editor. It has clear comments for every section:

### Updating Winter / Seasonal Rates
```javascript
// In assets/js/jsc-config.js
pricing: {
  season: "Winter 2026 Official Rates",
  weekendChargePercent: 20, // change percentage here
  facilities: [
    {
      id: "turf",
      dayRate: 800,    // Update day rate
      nightRate: 800,  // Update night rate
    },
    {
      id: "nets",
      dayRate: 200,    // Update nets rate
      nightRate: 200,
    }
  ],
  bowlingMachinePackages: [
    { overs: 10, price: 100 },
    { overs: 20, price: 200 },
    { overs: 30, price: 300 },
    // ...
  ]
}
```
The website will automatically calculate:
- Weekday rates
- Weekend rates (+20%)
- Quick calculator totals
- Pre-filled WhatsApp enquiry messages

### Updating WhatsApp or Contact Phone
```javascript
// In assets/js/jsc-config.js
contact: {
  phone: "+919241099299",
  phoneDisplay: "+91 92410 99299",
  email: "jsc.jimmysportsclub@gmail.com",
},
whatsapp: {
  number: "919241099299", // Change WhatsApp number here
}
```

### Adding or Updating Offers
In `jsc-config.js`, modify the `offers` array. You can set `status: "ACTIVE"` or `status: "EXPIRED"`.

---

## 4. Replacing Temporary Visuals With Your Actual Photos & Videos

When you are ready to insert your original photos:

1. **Facilities:**
   - Replace or drop your turf photograph into `assets/images/facilities/floodlit-turf.jpg` (or `.png`).
   - Replace covered nets into `assets/images/facilities/practice-nets.jpg`.
   - Replace bowling machine into `assets/images/facilities/bowling-machine.jpg`.
   *(In `index.html`, simply change the file extension from `.svg` to `.jpg`)*

2. **Gallery Photos:**
   - Drop your match and academy images into `assets/images/gallery/`.
   - Update `src` attributes in the `<div class="gallery-masonry-grid">` section of `index.html`.

3. **Videos:**
   - If hosting an MP4, upload to `assets/videos/` and add a standard `<video controls poster="..."><source src="assets/videos/match.mp4" type="video/mp4"></video>` tag.
   - For YouTube / Instagram embeds, paste the standard iframe code into the gallery or hero modal.

---

## 5. Testing Locally

1. Open `index.html` directly in any modern browser (Chrome, Safari, Firefox, Edge).
2. Alternatively, run a lightweight local static server:
   ```bash
   python3 -m http.server 8080
   ```
   and navigate to `http://localhost:8080`.

---

## 6. Deployment to Hostinger Business Web Hosting

Refer to **`DEPLOYMENT-HOSTINGER.md`** for step-by-step instructions:
1. Log into Hostinger hPanel.
2. Open **File Manager** &rarr; navigate to `public_html`.
3. Upload all files from this directory.
4. Ensure SSL / Force HTTPS is active.
5. Your website is live!

---

## 7. Domain Migration & Search Engine Transition

Refer to **`MIGRATION-GUIDE.md`** for:
- 301 redirects from `jsconline.in` to `jimmysportsclub.com`.
- Google Search Console Change of Address tool.
- Google Business Profile updates.
- Steps to flush old introductory pricing snippets from Google Search.
