(function () {
  const loginView = document.getElementById("login-view");
  const dashboardView = document.getElementById("dashboard-view");
  const loginForm = document.getElementById("login-form");
  const loginStatus = document.getElementById("login-status");
  const pricingForm = document.getElementById("pricing-form");
  const pricingStatus = document.getElementById("pricing-status");
  const uploadForm = document.getElementById("upload-form");
  const uploadStatus = document.getElementById("upload-status");
  const mediaList = document.getElementById("media-list");
  let csrfToken = "";
  let mediaItems = [];

  function showStatus(element, message, kind) {
    element.textContent = message;
    element.classList.toggle("is-error", kind === "error");
    element.classList.toggle("is-success", kind === "success");
  }

  async function request(url, options) {
    const requestOptions = options || {};
    const headers = new Headers(requestOptions.headers || {});
    if (csrfToken && requestOptions.method === "POST") {
      headers.set("X-CSRF-Token", csrfToken);
    }

    const response = await fetch(url, {
      credentials: "same-origin",
      ...requestOptions,
      headers,
    });

    let result;
    try {
      result = await response.json();
    } catch {
      throw new Error("The server returned an unreadable response. Check that PHP is enabled on the hosting account.");
    }

    if (!response.ok) {
      throw new Error(result.error || `The request failed (${response.status}).`);
    }
    return result;
  }

  function showLogin(message) {
    dashboardView.hidden = true;
    loginView.hidden = false;
    if (message) showStatus(loginStatus, message, "error");
  }

  function showDashboard() {
    loginView.hidden = true;
    dashboardView.hidden = false;
    showStatus(loginStatus, "", "");
  }

  function setPricingForm(pricing) {
    document.getElementById("pricing-season").value = pricing.season || "";
    document.getElementById("weekend-charge").value = pricing.weekendChargePercent;

    const facilities = Object.fromEntries((pricing.facilities || []).map((facility) => [facility.id, facility]));
    document.getElementById("turf-day").value = facilities.turf?.dayRate ?? "";
    document.getElementById("turf-night").value = facilities.turf?.nightRate ?? "";
    document.getElementById("nets-day").value = facilities.nets?.dayRate ?? "";
    document.getElementById("nets-night").value = facilities.nets?.nightRate ?? "";

    const packagePrices = Object.fromEntries((pricing.bowlingMachinePackages || []).map((item) => [item.overs, item.price]));
    [10, 20, 30, 40, 50, 70].forEach((overs) => {
      const input = pricingForm.elements.namedItem(`package${overs}`);
      input.value = packagePrices[overs] ?? "";
    });

    document.getElementById("weekend-summary").textContent = `${pricing.weekendChargePercent}%`;
    document.getElementById("season-summary").textContent = pricing.season || "—";
  }

  function safeMediaUrl(path) {
    try {
      const url = new URL(path, window.location.origin);
      if (url.origin === window.location.origin && url.pathname.startsWith("/assets/uploads/")) {
        return url.href;
      }
    } catch {
      return "";
    }
    return "";
  }

  function renderMedia() {
    document.getElementById("media-count").textContent = String(mediaItems.length);
    mediaList.replaceChildren();

    if (!mediaItems.length) {
      const emptyState = document.createElement("p");
      emptyState.className = "admin-empty-state";
      emptyState.textContent = "No uploaded photos or videos yet.";
      mediaList.append(emptyState);
      return;
    }

    mediaItems.forEach((item) => {
      const card = document.createElement("article");
      card.className = "admin-media-card";

      const source = safeMediaUrl(item.url);
      if (item.type === "video") {
        const preview = document.createElement("video");
        preview.className = "admin-media-preview";
        preview.src = source;
        preview.muted = true;
        preview.preload = "metadata";
        preview.setAttribute("aria-label", item.title || "Uploaded video");
        card.append(preview);
      } else {
        const preview = document.createElement("img");
        preview.className = "admin-media-preview";
        preview.src = source;
        preview.alt = item.title || "Uploaded photo";
        preview.loading = "lazy";
        card.append(preview);
      }

      const details = document.createElement("div");
      details.className = "admin-media-details";
      const title = document.createElement("strong");
      title.textContent = item.title || "Untitled";
      const metadata = document.createElement("span");
      metadata.textContent = `${item.type || "media"} · ${item.category || "gallery"}`;
      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";
      removeButton.addEventListener("click", () => removeMedia(item));
      details.append(title, metadata, removeButton);
      card.append(details);
      mediaList.append(card);
    });
  }

  async function loadDashboard() {
    const result = await request("public-content.php", { method: "GET" });
    setPricingForm(result.pricing);
    mediaItems = result.media || [];
    renderMedia();
    showDashboard();
  }

  async function removeMedia(item) {
    if (!window.confirm(`Remove "${item.title}" from the gallery? This also deletes its uploaded file.`)) return;

    try {
      await request("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-media", id: item.id }),
      });
      mediaItems = mediaItems.filter((media) => media.id !== item.id);
      renderMedia();
    } catch (error) {
      window.alert(error.message);
    }
  }

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = loginForm.querySelector("button[type=submit]");
    button.disabled = true;
    showStatus(loginStatus, "Signing in…", "");

    try {
      const result = await request("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "login",
          password: new FormData(loginForm).get("password"),
        }),
      });
      csrfToken = result.csrfToken;
      await loadDashboard();
      loginForm.reset();
    } catch (error) {
      showStatus(loginStatus, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  pricingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = pricingForm.querySelector("button[type=submit]");
    button.disabled = true;
    showStatus(pricingStatus, "Saving rates…", "");
    const value = (name) => Number(pricingForm.elements.namedItem(name).value);

    const pricing = {
      season: pricingForm.elements.namedItem("season").value.trim(),
      weekendChargePercent: value("weekendChargePercent"),
      facilities: {
        turf: { dayRate: value("turfDay"), nightRate: value("turfNight") },
        nets: { dayRate: value("netsDay"), nightRate: value("netsNight") },
      },
      bowlingMachinePackages: Object.fromEntries([10, 20, 30, 40, 50, 70].map((overs) => [
        String(overs),
        value(`package${overs}`),
      ])),
    };

    try {
      const result = await request("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-pricing", pricing }),
      });
      setPricingForm(result.pricing);
      showStatus(pricingStatus, "Pricing saved and published.", "success");
    } catch (error) {
      showStatus(pricingStatus, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  const mediaFile = document.getElementById("media-file");
  mediaFile.addEventListener("change", () => {
    const titleInput = document.getElementById("media-title-input");
    const file = mediaFile.files[0];
    if (file && !titleInput.value.trim()) {
      titleInput.value = file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
    }
  });

  uploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const button = uploadForm.querySelector("button[type=submit]");
    button.disabled = true;
    showStatus(uploadStatus, "Uploading…", "");

    try {
      const body = new FormData(uploadForm);
      body.set("action", "upload");
      const result = await request("api.php", { method: "POST", body });
      mediaItems.unshift(result.media);
      renderMedia();
      uploadForm.reset();
      showStatus(uploadStatus, "Media uploaded and added to the public gallery.", "success");
    } catch (error) {
      showStatus(uploadStatus, error.message, "error");
    } finally {
      button.disabled = false;
    }
  });

  document.getElementById("logout-button").addEventListener("click", async () => {
    try {
      await request("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "logout" }),
      });
      csrfToken = "";
      showLogin("You have signed out.");
    } catch (error) {
      window.alert(error.message);
    }
  });

  (async function initialize() {
    try {
      const status = await request("api.php", { method: "GET" });
      if (!status.authenticated) {
        showLogin();
        return;
      }
      csrfToken = status.csrfToken;
      await loadDashboard();
    } catch (error) {
      showLogin(error.message);
    }
  })();
})();
