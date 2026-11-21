# HOSTINGER DEPLOYMENT GUIDE — JIMMY SPORTS CLUB (JSC)

This guide walks you through deploying the Jimmy Sports Club website to your **Hostinger Business Web Hosting** plan.

---

## 1. Hosting Environment & Prerequisites

- **Hosting Plan:** Hostinger Business Web Hosting
- **Target Domain:** `jimmysportsclub.com` (or current `jsconline.in`)
- **Web Server:** LiteSpeed / Apache (Supported out-of-the-box)
- **Architecture:** Static HTML/CSS/JavaScript website with a small PHP 8.1+ admin API. No Node.js runtime or SQL database is required.

---

## 2. Deployment Method A: Via Hostinger hPanel File Manager (Recommended & Fastest)

1. Log into your **Hostinger Account** at [https://hpanel.hostinger.com/](https://hpanel.hostinger.com/).
2. Select your hosting account and navigate to **Websites** &rarr; click **Manage** next to your domain.
3. In the sidebar or search bar, click on **File Manager**.
4. Click on **Go to files of [your domain]**.
5. Double-click the **`public_html`** folder.
   > **Note:** If there is a default `default.php` or placeholder `index.html` from Hostinger, you can safely delete or back it up.
6. Enable **Show hidden files** in File Manager and include the `.htaccess` files in the website folders. These protect private admin data and uploaded media.
7. Upload the files:
   - You can either upload the files directly, OR
   - Zip all website files inside `JSC WEBPAGE CREATION/` (so that `index.html`, `404.html`, `robots.txt`, `.htaccess`, `sitemap.xml`, `admin/`, and `assets/` are at the root of the zip), upload the zip file into `public_html`, right-click it, and select **Extract**. Do not include a private `admin/config.php` in a shared archive.
8. Ensure your file structure inside `public_html` looks like this:
   ```
   public_html/
   ├── index.html
   ├── 404.html
   ├── .htaccess
   ├── favicon.svg
   ├── robots.txt
   ├── sitemap.xml
   ├── admin/
   │   ├── .htaccess
   │   ├── index.php
   │   ├── admin.css
   │   ├── admin.js
   │   ├── api.php
   │   ├── config.example.php
   │   ├── lib.php
   │   ├── public-content.php
   │   └── data/
   │       ├── .htaccess
   │       └── site-content.json
   └── assets/
       ├── css/
       │   ├── style.css
       │   └── components.css
       ├── js/
       │   ├── jsc-config.js
       │   ├── site-content.js
       │   ├── main.js
       │   └── pricing.js
       ├── images/
       ├── uploads/
       │   └── .htaccess
       ├── logo/
       └── icons/
   ```
9. Complete the [admin panel setup](#admin-panel-setup) below before using the panel.

## Admin Panel Setup

1. In Hostinger hPanel, select PHP **8.1 or later** for the domain.
2. Generate a password hash on a computer with PHP CLI. This prompts without echoing the password:
   ```sh
   read -s ADMIN_PASSWORD
   printf '\n'
   printf '%s' "$ADMIN_PASSWORD" | php -r 'echo password_hash(stream_get_contents(STDIN), PASSWORD_DEFAULT), PHP_EOL;'
   unset ADMIN_PASSWORD
   ```
3. In File Manager, copy `public_html/admin/config.example.php` to `public_html/admin/config.php`. Replace `REPLACE_WITH_A_PASSWORD_HASH` with the generated hash. Do not commit or share `config.php`.
4. Ensure PHP can write to `public_html/admin/data/` and `public_html/assets/uploads/`. The directory `.htaccess` rules block direct access to private content and prevent uploaded scripts from running.
5. To support videos up to 100 MB, set PHP `upload_max_filesize` to at least `100M` and `post_max_size` to at least `110M` in hPanel’s PHP configuration. The hosting plan’s limits may be lower.
6. Visit `https://your-domain.com/admin/`, sign in, and test a section text change, section visibility/order change, image upload, and rate change. The website reads saved content from `admin/public-content.php`.

---

## 3. Deployment Method B: Via FTP (FileZilla / Cyberduck)

1. In Hostinger hPanel, go to **Files** &rarr; **FTP Accounts**.
2. Note your **FTP Hostname**, **FTP Username**, and **Port (usually 21)**.
3. Open your FTP client (e.g. FileZilla), enter your credentials, and click **Quickconnect**.
4. In the remote directory window, open **`public_html`**.
5. Upload the project files and folders into `public_html`, including hidden `.htaccess` files. On later deployments, do not overwrite `admin/data/site-content.json` or `assets/uploads/`; those contain the rates and gallery media managed in the admin panel.

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
- [ ] Visit `/admin/`, sign in, and confirm a saved rate or uploaded gallery item appears on the public site.
