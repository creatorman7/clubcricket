<?php
$isConfigured = is_file(__DIR__ . '/config.php');
?>
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>JSC Admin | Jimmy Sports Club</title>
  <link rel="icon" type="image/svg+xml" href="../favicon.svg">
  <link rel="stylesheet" href="../assets/css/style.css">
  <link rel="stylesheet" href="admin.css">
</head>
<body class="admin-body">
  <header class="admin-topbar">
    <a class="admin-brand" href="../" aria-label="Jimmy Sports Club website">
      <img src="../assets/logo/jsc-logo.svg" alt="Jimmy Sports Club">
      <span>CLUB ADMIN</span>
    </a>
    <a class="admin-view-site" href="../" target="_blank" rel="noopener noreferrer">View website <span aria-hidden="true">↗</span></a>
  </header>

  <main class="admin-shell">
    <section class="admin-login-card" id="login-view" aria-labelledby="login-title" hidden>
      <span class="admin-kicker">JIMMY SPORTS CLUB</span>
      <h1 id="login-title">Welcome back</h1>
      <p class="admin-muted">Sign in to update gallery media and public pricing.</p>
      <?php if (!$isConfigured): ?>
        <p class="admin-notice admin-notice-error">Admin setup is not complete. Copy <code>admin/config.example.php</code> to <code>admin/config.php</code>, set your password hash, and upload the new file.</p>
      <?php endif; ?>
      <form id="login-form">
        <label for="admin-password">Admin password</label>
        <input id="admin-password" name="password" type="password" autocomplete="current-password" required>
        <button class="admin-button admin-button-primary" type="submit">Sign in</button>
      </form>
      <p class="admin-status" id="login-status" role="status" aria-live="polite"></p>
      <p class="admin-footnote">For your security, use a unique password and keep <code>config.php</code> private.</p>
    </section>

    <section class="admin-dashboard" id="dashboard-view" hidden>
      <div class="admin-heading-row">
        <div>
          <span class="admin-kicker">JSC MANAGEMENT</span>
          <h1>Club dashboard</h1>
          <p class="admin-muted">Changes are published on the public website when saved.</p>
        </div>
        <button class="admin-button admin-button-quiet" id="logout-button" type="button">Sign out</button>
      </div>

      <div class="admin-summary-grid" aria-label="Content summary">
        <article class="admin-summary-card">
          <span>Gallery items</span>
          <strong id="media-count">0</strong>
        </article>
        <article class="admin-summary-card">
          <span>Weekend surcharge</span>
          <strong id="weekend-summary">20%</strong>
        </article>
        <article class="admin-summary-card">
          <span>Current rate season</span>
          <strong id="season-summary">Winter 2026 Official Rates</strong>
        </article>
      </div>

      <section class="admin-panel" aria-labelledby="pricing-title">
        <div class="admin-panel-heading">
          <div>
            <span class="admin-kicker">PUBLIC WEBSITE</span>
            <h2 id="pricing-title">Pricing &amp; rates</h2>
            <p class="admin-muted">Update weekday rates, weekend surcharge, and bowling machine packages.</p>
          </div>
        </div>
        <form id="pricing-form">
          <div class="admin-form-grid admin-form-grid-two">
            <div class="admin-field admin-field-wide">
              <label for="pricing-season">Rate season / heading</label>
              <input id="pricing-season" name="season" type="text" maxlength="100" required>
            </div>
            <div class="admin-field">
              <label for="weekend-charge">Weekend surcharge (%)</label>
              <input id="weekend-charge" name="weekendChargePercent" type="number" min="0" max="100" step="1" required>
            </div>
          </div>

          <h3 class="admin-subheading">Facility hourly rates (₹)</h3>
          <div class="admin-rate-grid">
            <fieldset class="admin-rate-card">
              <legend>Cricket turf</legend>
              <label for="turf-day">Day rate</label>
              <input id="turf-day" name="turfDay" type="number" min="0" max="1000000" step="1" required>
              <label for="turf-night">Night rate</label>
              <input id="turf-night" name="turfNight" type="number" min="0" max="1000000" step="1" required>
            </fieldset>
            <fieldset class="admin-rate-card">
              <legend>Practice nets</legend>
              <label for="nets-day">Day rate</label>
              <input id="nets-day" name="netsDay" type="number" min="0" max="1000000" step="1" required>
              <label for="nets-night">Night rate</label>
              <input id="nets-night" name="netsNight" type="number" min="0" max="1000000" step="1" required>
            </fieldset>
          </div>

          <h3 class="admin-subheading">Bowling machine packages (₹)</h3>
          <div class="admin-package-grid">
            <label>10 overs<input name="package10" type="number" min="0" max="1000000" step="1" required></label>
            <label>20 overs<input name="package20" type="number" min="0" max="1000000" step="1" required></label>
            <label>30 overs<input name="package30" type="number" min="0" max="1000000" step="1" required></label>
            <label>40 overs<input name="package40" type="number" min="0" max="1000000" step="1" required></label>
            <label>50 overs<input name="package50" type="number" min="0" max="1000000" step="1" required></label>
            <label>70 overs<input name="package70" type="number" min="0" max="1000000" step="1" required></label>
          </div>
          <div class="admin-form-actions">
            <p class="admin-status" id="pricing-status" role="status" aria-live="polite"></p>
            <button class="admin-button admin-button-primary" type="submit">Save pricing</button>
          </div>
        </form>
      </section>

      <section class="admin-panel" aria-labelledby="media-title">
        <div class="admin-panel-heading">
          <div>
            <span class="admin-kicker">PUBLIC GALLERY</span>
            <h2 id="media-title">Photos &amp; videos</h2>
            <p class="admin-muted">Upload a photo or video to add it to the homepage gallery.</p>
          </div>
        </div>
        <form id="upload-form" class="admin-upload-form">
          <div class="admin-form-grid admin-form-grid-two">
            <div class="admin-field">
              <label for="media-title-input">Gallery title</label>
              <input id="media-title-input" name="title" type="text" maxlength="120" required>
            </div>
            <div class="admin-field">
              <label for="media-category">Gallery category</label>
              <select id="media-category" name="category" required>
                <option value="turf">Turf &amp; Matches</option>
                <option value="nets">Practice Nets</option>
                <option value="bowling">Bowling Simulator</option>
                <option value="academy">Academy &amp; Youth</option>
              </select>
            </div>
          </div>
          <div class="admin-upload-row">
            <label class="admin-file-label" for="media-file">Choose photo or video</label>
            <input id="media-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm,video/quicktime" required>
            <span class="admin-footnote">JPG, PNG, WebP, GIF (up to 12 MB) or MP4, WebM, MOV (up to 100 MB).</span>
          </div>
          <div class="admin-form-actions">
            <p class="admin-status" id="upload-status" role="status" aria-live="polite"></p>
            <button class="admin-button admin-button-primary" type="submit">Upload to gallery</button>
          </div>
        </form>

        <div class="admin-media-list-heading">
          <h3 class="admin-subheading">Published gallery items</h3>
          <p class="admin-muted">Removing an item also deletes its uploaded file.</p>
        </div>
        <div class="admin-media-grid" id="media-list"></div>
      </section>
    </section>
  </main>

  <script src="admin.js" defer></script>
</body>
</html>
