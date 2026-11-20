# DOMAIN MIGRATION & SEO TRANSITION GUIDE
## Transitioning from `jsconline.in` to `jimmysportsclub.com`

This guide explains how to migrate smoothly without losing search ranking, and how to eliminate old introductory pricing (₹500/₹700) from Google Search.

---

## 1. Domain Registration & Hostinger Setup

1. **Register Target Domain:** Ensure `jimmysportsclub.com` is registered in your Hostinger account or registrar.
2. **Add Domain in Hostinger:**
   - Go to hPanel &rarr; **Websites** &rarr; **Add Website**.
   - Select `jimmysportsclub.com` and assign it to your Business Web Hosting plan.
3. **DNS Verification:**
   - Ensure the Nameservers or `A Record` points to your Hostinger server IP.
4. **Issue Free SSL:** Enable Let's Encrypt SSL in hPanel for `jimmysportsclub.com`.

---

## 2. Setting Up 301 Permanent Redirects on `jsconline.in`

To ensure visitors and Google traffic from `jsconline.in` seamlessly arrive at `jimmysportsclub.com`, add this rule to the `.htaccess` file on `jsconline.in`:

```apache
# 301 Permanent Domain Redirect from old to new domain
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{HTTP_HOST} ^(www\.)?jsconline\.in$ [NC]
  RewriteRule ^(.*)$ https://jimmysportsclub.com/$1 [R=301,L]
</IfModule>
```

> **Important:** Do NOT cancel or delete `jsconline.in` immediately. Keep the domain active with the 301 redirect for at least 6–12 months so that all backlink authority and existing customer bookmarks migrate naturally.

---

## 3. Google Search Console Migration (Change of Address Tool)

1. Open [Google Search Console](https://search.google.com/search-console).
2. Add both properties:
   - `https://jsconline.in/`
   - `https://jimmysportsclub.com/`
3. Verify ownership of `jimmysportsclub.com` (via DNS TXT record or HTML verification file in Hostinger).
4. In Search Console for `jsconline.in`:
   - Click **Settings** (bottom left) &rarr; **Change of Address**.
   - Select `jimmysportsclub.com` as the new destination.
   - Run the validation check and submit the change request.
5. In Search Console for `jimmysportsclub.com`:
   - Go to **Sitemaps** &rarr; submit `https://jimmysportsclub.com/sitemap.xml`.
   - Request indexing for the homepage URL.

---

## 4. Google Business Profile & Local Search Update

1. Log into your **Google Business Profile Manager** (Google Maps listing for Jimmy Sports Club in Muzaffarpur).
2. Update the **Website URL** from `https://jsconline.in/` to `https://jimmysportsclub.com/`.
3. Update the **Booking / Appointment Link** to:
   `https://jimmysportsclub.com/#pricing` or direct WhatsApp link:
   `https://wa.me/919241099299?text=Hello%20Jimmy%20Sports%20Club%2C%20I%20would%20like%20to%20enquire%20about%20booking%20a%20slot.`
4. Verify the listed phone number: **+91 92410 99299**.
5. Ensure the Category is set to **Cricket Ground / Sports Club / Cricket Academy**.

---

## 5. Eliminating Old Introductory Launch Pricing from Google Search

The old rates (₹500 day / ₹700 night) appeared on old cached pages and third-party snippets. The new website addresses this systematically:

1. **Clear Official Banner:** Visible disclaimer: *"Introductory launch offers have ended. Please refer to current official pricing displayed on this website."*
2. **Archived Notice Card:** Marked `EXPIRED` in the announcements section so search engine crawlers register that the introductory launch price has concluded.
3. **Structured JSON-LD Data:** Price range is structured as `₹100 - ₹960` in the schema markup so Google Knowledge Panels reflect the current price range.
4. **Google Cache Flush:** Once deployed, use the Search Console URL Inspection tool to request a re-crawl of the homepage and submit `sitemap.xml`. Google will update its search snippets within 3–7 business days.
