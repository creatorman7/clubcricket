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
├── admin/
│   ├── index.php                # Password-protected content management panel
│   ├── api.php                  # Authenticated pricing, upload, and delete actions
│   ├── public-content.php       # Public website content endpoint
│   └── data/site-content.json   # Saved pricing and gallery listing
└── assets/
    ├── css/
    │   ├── style.css            # Core design system tokens, typography, glassmorphism
    │   └── components.css       # Section components, hero, pricing, gallery, responsive grids
    ├── js/
    │   ├── jsc-config.js        # Centralized configuration (PRICING, OFFERS, CONTACTS)
    │   ├── site-content.js      # Loads admin-managed pricing and gallery items
    │   ├── pricing.js           # Interactive pricing calculator & WhatsApp generator
    │   └── main.js              # Navbar, mobile menu, gallery lightbox, scroll animations
    ├── uploads/                 # Photos and videos uploaded through the admin panel
    ├── images/
    │   ├── hero/                # Cinematic hero cricket batsman vector artwork
    │   ├── facilities/          # Floodlit turf, covered nets, automated bowling machine
    │   ├── academy/             # Academy coaching & youth drills
    │   ├── achievements/        # Tournaments & championship trophies
    │   ├── gallery/             # Filterable sports photography gallery items
    │   └── placeholders/        # Formatted asset placeholder for user photos
    ├── logo/
    │   ├── logo.jpg             # Uploaded JSC brand logo
    │   ├── jsc-logo.svg         # Original vector brand logo
    │   └── jsc-symbol.svg       # Brand monogram symbol
    └── icons/                   # Custom athletic SVGs (turf, nets, bowling machine, etc.)
```

---

## 3. Admin Panel: Update Pricing, Photos & Videos

Open `https://your-domain.com/admin/` and sign in with the admin password configured during deployment. The panel lets you:

- Customize homepage section text and cards, show or hide sections, and move sections up or down.
- Replace section images, including the hero, facilities, academy, and gallery placeholders.
- Upload and remove gallery photos and videos.
- Set the rate season, weekday day/night rates, weekend surcharge, and bowling machine package prices.
- Publish changes directly to the live website.

The panel requires PHP 8.1+ and writable `admin/data/` and `assets/uploads/` folders. `admin/data/site-content.json` is the tracked starter template; live edits are stored in the Git-ignored `admin/data/site-content-live.json`. Preserve that runtime file and `assets/uploads/` when deploying future site updates. Follow the [Hostinger setup instructions](./DEPLOYMENT-HOSTINGER.md#admin-panel-setup) once after uploading the website files.

### Admin password setup

1. Generate a password hash on a computer with PHP CLI. This prompts without echoing the password and does not put it in shell history:
   ```sh
   read -s ADMIN_PASSWORD
   printf '\n'
   printf '%s' "$ADMIN_PASSWORD" | php -r 'echo password_hash(stream_get_contents(STDIN), PASSWORD_DEFAULT), PHP_EOL;'
   unset ADMIN_PASSWORD
   ```
2. In Hostinger File Manager, copy `admin/config.example.php` to `admin/config.php` and replace `REPLACE_WITH_A_PASSWORD_HASH` with the generated hash.
3. Keep `admin/config.php` private; it is excluded from Git. Use a unique, strong password.

Pricing and page-editor changes are stored in the server-only runtime content file and appear for all website visitors. The tracked `admin/data/site-content.json` is only a starter template. The existing `assets/js/jsc-config.js` remains the fallback for other settings such as contact details and offers.

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

## 4. Replacing Facility Visuals

For ongoing gallery photo and video updates, use the admin panel. Uploaded gallery media is stored in `assets/uploads/`; accepted formats and size limits are shown in the panel. Preserve `admin/data/site-content-live.json` and `assets/uploads/` when deploying future site updates so saved content is not overwritten.

The facility illustrations in `assets/images/facilities/` are separate from the admin-managed gallery. Replacing those visuals still requires updating the corresponding image references in `index.html`.

---

## 5. Testing Locally

1. For a static preview, open `index.html` directly in a modern browser. The preview uses built-in defaults; PHP-backed admin content requires a PHP-enabled web server.
2. To test the full site and admin locally, use a PHP-enabled web server and configure `admin/config.php` as above. The existing lightweight static server can still be used for layout-only checks:
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
