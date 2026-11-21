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
  const pageSectionEditor = document.getElementById("page-section-editor");
  const pageImageEditor = document.getElementById("page-image-editor");
  const pageStatus = document.getElementById("page-status");
  const savePageButton = document.getElementById("save-page-button");
  let csrfToken = "";
  let mediaItems = [];
  let pageData = null;
  let pageTemplates = {};

  const sectionLabels = {
    home: "Home / hero",
    stats: "Quick feature stats",
    about: "About JSC",
    facilities: "Facilities",
    academy: "Academy",
    achievements: "Achievements",
    pricing: "Pricing",
    offers: "Offers",
    gallery: "Gallery",
    reviews: "Player reviews",
    contact: "Contact & booking",
    footer: "Footer",
  };
  const imageLabels = {
    logo: "Club logo",
    hero: "Home hero artwork",
    facilityTurf: "Floodlit turf",
    facilityNets: "Practice nets",
    facilityBowling: "Bowling machine",
    academy: "Academy",
    galleryTurf: "Gallery: turf match",
    galleryNets: "Gallery: practice nets",
    galleryBowling: "Gallery: bowling machine",
    galleryAcademy: "Gallery: academy",
    galleryLights: "Gallery: floodlights",
  };

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

  function humanize(value) {
    return value
      .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/^./, (letter) => letter.toUpperCase());
  }

  function cloneValue(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function collectArrayTemplates(value, path) {
    if (Array.isArray(value)) {
      if (value.length) pageTemplates[path] = cloneValue(value[0]);
      value.forEach((item, index) => collectArrayTemplates(item, `${path}.${index}`));
      return;
    }
    if (value && typeof value === "object") {
      Object.entries(value).forEach(([key, child]) => collectArrayTemplates(child, `${path}.${key}`));
    }
  }

  function renderEditorValue(parent, key, value, path, templateItem) {
    if (Array.isArray(value)) {
      const list = document.createElement("fieldset");
      list.className = "admin-content-list";
      const legend = document.createElement("legend");
      legend.textContent = humanize(key);
      list.append(legend);

      value.forEach((item, index) => {
        const row = document.createElement("fieldset");
        row.className = "admin-content-list-item";
        const rowHeading = document.createElement("div");
        rowHeading.className = "admin-content-list-heading";
        const title = document.createElement("strong");
        title.textContent = `${humanize(key)} ${index + 1}`;
        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "admin-content-remove";
        removeButton.textContent = "Remove";
        removeButton.addEventListener("click", () => {
          value.splice(index, 1);
          renderPageEditor(pageData);
        });
        rowHeading.append(title, removeButton);
        row.append(rowHeading);

        if (item && typeof item === "object" && !Array.isArray(item)) {
          Object.entries(item).forEach(([itemKey, itemValue]) => {
            renderEditorValue(row, itemKey, itemValue, `${path}.${index}.${itemKey}`, templateItem?.[itemKey]);
          });
        } else {
          renderEditorValue(row, `${key} item`, item, `${path}.${index}`, templateItem);
        }
        list.append(row);
      });

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "admin-button admin-button-quiet admin-content-add";
      addButton.textContent = `Add ${humanize(key).toLowerCase()}`;
      addButton.disabled = value.length >= 30 || templateItem === undefined;
      addButton.addEventListener("click", () => {
        value.push(cloneValue(templateItem));
        renderPageEditor(pageData);
      });
      list.append(addButton);
      parent.append(list);
      return;
    }

    if (value && typeof value === "object") {
      const group = document.createElement("fieldset");
      group.className = "admin-content-group";
      const legend = document.createElement("legend");
      legend.textContent = humanize(key);
      group.append(legend);
      Object.entries(value).forEach(([childKey, childValue]) => {
        renderEditorValue(group, childKey, childValue, `${path}.${childKey}`, templateItem?.[childKey]);
      });
      parent.append(group);
      return;
    }

    const field = document.createElement("label");
    field.className = "admin-page-field";
    field.textContent = humanize(key);
    const control = typeof value === "string" && (value.length > 100 || /description|text|quote|paragraph|body|validity/i.test(key))
      ? document.createElement("textarea")
      : document.createElement("input");
    if (control instanceof HTMLInputElement) control.type = "text";
    control.value = String(value ?? "");
    control.addEventListener("input", () => {
      const parts = path.split(".");
      if (parts[0] === "page") parts.shift();
      let target = pageData;
      while (parts.length > 1) target = target[parts.shift()];
      target[parts[0]] = control.value;
    });
    field.append(control);
    parent.append(field);
  }

  function renderPageEditor(page) {
    pageData = page;
    pageTemplates = {};
    collectArrayTemplates(pageData, "page");
    pageSectionEditor.replaceChildren();

    const orderedIds = [...pageData.order, ...Object.keys(pageData.sections).filter((id) => !pageData.order.includes(id))];
    orderedIds.forEach((id) => {
      const section = pageData.sections[id];
      if (!section) return;

      const details = document.createElement("details");
      details.className = "admin-page-section";
      const summary = document.createElement("summary");
      summary.textContent = sectionLabels[id] || humanize(id);
      details.append(summary);

      const toolbar = document.createElement("div");
      toolbar.className = "admin-page-section-toolbar";
      const visibilityLabel = document.createElement("label");
      visibilityLabel.className = "admin-page-visibility";
      const visibility = document.createElement("input");
      visibility.type = "checkbox";
      visibility.checked = section.visible;
      visibility.addEventListener("change", () => {
        section.visible = visibility.checked;
      });
      visibilityLabel.append(visibility, document.createTextNode(" Show section on website"));
      toolbar.append(visibilityLabel);

      const orderIndex = pageData.order.indexOf(id);
      if (orderIndex >= 0) {
        ["Move up", "Move down"].forEach((label, directionIndex) => {
          const button = document.createElement("button");
          button.type = "button";
          button.className = "admin-content-move";
          button.textContent = label;
          button.disabled = directionIndex === 0 ? orderIndex === 0 : orderIndex === pageData.order.length - 1;
          button.addEventListener("click", () => {
            const targetIndex = orderIndex + (directionIndex === 0 ? -1 : 1);
            [pageData.order[orderIndex], pageData.order[targetIndex]] = [pageData.order[targetIndex], pageData.order[orderIndex]];
            renderPageEditor(pageData);
          });
          toolbar.append(button);
        });
      }
      details.append(toolbar);

      const content = document.createElement("div");
      content.className = "admin-page-section-content";
      Object.entries(section.content || {}).forEach(([key, value]) => {
        renderEditorValue(content, key, value, `page.sections.${id}.content.${key}`, pageTemplates[`page.sections.${id}.content.${key}`]);
      });
      details.append(content);
      pageSectionEditor.append(details);
    });

    renderPageImages();
  }

  function renderPageImages() {
    pageImageEditor.replaceChildren();
    const adminLogo = document.querySelector(".admin-brand img");
    if (adminLogo && pageData.images.logo) adminLogo.src = pageData.images.logo;
    Object.entries(pageData.images || {}).forEach(([key, path]) => {
      const card = document.createElement("article");
      card.className = "admin-page-image-card";
      const preview = document.createElement("img");
      preview.src = safeMediaUrl(path) || new URL(path, window.location.href).href;
      preview.alt = imageLabels[key] || humanize(key);
      preview.loading = "lazy";
      const title = document.createElement("strong");
      title.textContent = imageLabels[key] || humanize(key);
      const currentPath = document.createElement("span");
      currentPath.textContent = path;
      const file = document.createElement("input");
      file.type = "file";
      file.accept = "image/jpeg,image/png,image/webp,image/gif";
      file.setAttribute("aria-label", `Choose replacement for ${imageLabels[key] || key}`);
      const uploadButton = document.createElement("button");
      uploadButton.type = "button";
      uploadButton.className = "admin-button admin-button-quiet";
      uploadButton.textContent = "Replace image";
      uploadButton.addEventListener("click", () => uploadPageImage(key, file, uploadButton, preview, currentPath));
      card.append(preview, title, currentPath, file, uploadButton);
      pageImageEditor.append(card);
    });
  }

  async function uploadPageImage(target, fileInput, button, preview, currentPath) {
    if (!fileInput.files[0]) {
      showStatus(pageStatus, "Choose an image before uploading.", "error");
      return;
    }
    button.disabled = true;
    showStatus(pageStatus, "Uploading section image…", "");
    const body = new FormData();
    body.set("action", "upload-section-image");
    body.set("target", target);
    body.set("file", fileInput.files[0]);
    try {
      const result = await request("api.php", { method: "POST", body });
      pageData.images[target] = result.url;
      preview.src = new URL(result.url, window.location.origin).href;
      currentPath.textContent = result.url;
      fileInput.value = "";
      showStatus(pageStatus, "Image uploaded and published.", "success");
    } catch (error) {
      showStatus(pageStatus, error.message, "error");
    } finally {
      button.disabled = false;
    }
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
    renderPageEditor(result.page);
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

  savePageButton.addEventListener("click", async () => {
    savePageButton.disabled = true;
    showStatus(pageStatus, "Saving website content…", "");
    try {
      const result = await request("api.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save-page", page: pageData }),
      });
      renderPageEditor(result.page);
      showStatus(pageStatus, "Website content saved and published.", "success");
    } catch (error) {
      showStatus(pageStatus, error.message, "error");
    } finally {
      savePageButton.disabled = false;
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
