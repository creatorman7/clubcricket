# HOSTINGER DEPLOYMENT GUIDE — JIMMY SPORTS CLUB (JSC)

This guide walks you through deploying the Jimmy Sports Club website to your **Hostinger Business Web Hosting** plan.

---

## 1. Hosting Environment & Prerequisites

- **Hosting Plan:** Hostinger Business Web Hosting
- **Target Domain:** `jimmysportsclub.com` (or current `jsconline.in`)
- **Web Server:** LiteSpeed / Apache (Supported out-of-the-box)
- **Architecture:** Zero-dependency static frontend (HTML5, Modern CSS3, Vanilla JS, SVG Vector Assets). No Node.js runtime or SQL database is required for core operation.

---

## 2. Deployment Method A: Via Hostinger hPanel File Manager (Recommended & Fastest)

1. Log into your **Hostinger Account** at [https://hpanel.hostinger.com/](https://hpanel.hostinger.com/).
2. Select your hosting account and navigate to **Websites** &rarr; click **Manage** next to your domain.
3. In the sidebar or search bar, click on **File Manager**.
4. Click on **Go to files of [your domain]**.
5. Double-click the **`public_html`** folder.
   > **Note:** If there is a default `default.php` or placeholder `index.html` from Hostinger, you can safely delete or back it up.
6. Upload the files:
   - You can either upload the files directly, OR
   - Zip all files inside `JSC WEBPAGE CREATION/` (so that `index.html`, `404.html`, `robots.txt`, `.htaccess`, `sitemap.xml`, and the `assets/` folder are at the root of the zip), upload the zip file into `public_html`, right-click it, and select **Extract**.
7. Ensure your file structure inside `public_html` looks like this:
   ```
   public_html/
   ├── index.html
   ├── 404.html
   ├── .htaccess
   ├── favicon.svg
   ├── robots.txt
   ├── sitemap.xml
   └── assets/
       ├── css/
       │   ├── style.css
       │   └── components.css
       ├── js/
       │   ├── jsc-config.js
       │   ├── main.js
       │   └── pricing.js
       ├── images/
       ├── logo/
       └── icons/
   ```

---

## 3. Deployment Method B: Via FTP (FileZilla / Cyberduck)

1. In Hostinger hPanel, go to **Files** &rarr; **FTP Accounts**.
2. Note your **FTP Hostname**, **FTP Username**, and **Port (usually 21)**.
3. Open your FTP client (e.g. FileZilla), enter your credentials, and click **Quickconnect**.
4. In the remote directory window, open **`public_html`**.
5. Select all files and folders in your local project directory and drag them into `public_html`.

---

## 4. Enabling Free SSL / HTTPS Verification

1. In hPanel, go to **Security** &rarr; **SSL**.
2. Check that **Let's Encrypt SSL** is active on your domain. If not, click **Install SSL** (it installs automatically in 1–2 minutes).
3. Toggle ON **Force HTTPS**.
4. The included `.htaccess` file will also automatically enforce HTTPS across all visits.

---

## 5. Verifying Deployment

Visit `https://jimmysportsclub.com/` (or your domain) and test:
- [ ] Hero section loads with batsman visual and floating telemetry cards.
- [ ] Navbar links smoothly scroll to all sections (#about, #facilities, #pricing, etc.).
- [ ] WhatsApp CTA buttons open chat with pre-filled enquiry message.
- [ ] Toggle **Weekday** vs **Weekend** in the pricing section; verify prices update (+20%).
- [ ] Toggle **Day** vs **Night** slot selector.
- [ ] Test the quick slot calculator.
- [ ] Test on a mobile phone to check responsive navigation drawer and floating WhatsApp/Call buttons.
- [ ] Test a nonexistent URL (e.g. `yourdomain.com/test-404`) to verify the custom 404 page.
