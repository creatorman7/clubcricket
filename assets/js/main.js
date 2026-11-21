/**
 * =======================================================================
 * JIMMY SPORTS CLUB (JSC) — MAIN APPLICATION LOGIC
 * =======================================================================
 * Handles navigation, mobile menu, dynamic section hydration from config,
 * gallery filtering & modal lightbox, and custom WhatsApp message generation.
 * =======================================================================
 */

function initializeMain() {
  if (!window.JSC_CONFIG_READY) {
    document.addEventListener("jsc-config-ready", initializeMain, { once: true });
    return;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runMain, { once: true });
  } else {
    runMain();
  }
}

function runMain() {
  // 1. DOM Elements
  const navbar = document.getElementById("jsc-navbar");
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const contactForm = document.getElementById("jsc-contact-form");
  const lightboxModal = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxVideo = document.getElementById("lightbox-video");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const galleryGrid = document.getElementById("gallery-masonry-grid");
  const galleryFilterBtns = document.querySelectorAll(".gallery-filter-btn");
  const escapeHtml = window.JSC_ESCAPE_HTML || ((value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]));

  // 2. Hydrate Dynamic Config Elements
  hydrateFromConfig();

  // 3. Navbar Scroll Effect & Active Section Tracker
  window.addEventListener("scroll", handleNavbarScroll, { passive: true });
  initScrollSpy();

  // 4. Mobile Menu Toggle
  if (navToggle && mobileNav) {
    navToggle.addEventListener("click", function () {
      const isOpen = mobileNav.classList.toggle("is-open");
      navToggle.classList.toggle("is-active", isOpen);
      navToggle.setAttribute("aria-expanded", isOpen);
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close mobile nav when clicking a link
    mobileNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", function () {
        mobileNav.classList.remove("is-open");
        navToggle.classList.remove("is-active");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  // 5. Gallery Filtering & Lightbox
  renderManagedGallery();
  initGallery();

  // 6. Interactive Contact / WhatsApp Quick Form
  if (contactForm) {
    contactForm.addEventListener("submit", handleContactSubmit);
  }

  // 7. Scroll Reveal Animations
  initScrollReveal();

  /**
   * Hydrate Content from Centralized JSC_CONFIG
   */
  function hydrateFromConfig() {
    if (typeof JSC_CONFIG === "undefined") return;
    applyPageContent();

    // Contact details injection
    const phoneDisplayElems = document.querySelectorAll(".cfg-phone-display");
    phoneDisplayElems.forEach((el) => (el.textContent = JSC_CONFIG.contact.phoneDisplay));

    const emailDisplayElems = document.querySelectorAll(".cfg-email-display");
    emailDisplayElems.forEach((el) => (el.textContent = JSC_CONFIG.contact.email));

    const addressDisplayElems = document.querySelectorAll(".cfg-address-display");
    addressDisplayElems.forEach((el) => (el.textContent = JSC_CONFIG.club.fullAddress));

    // Dynamic Offers Hydration
    const offersContainer = document.getElementById("offers-cards-container");
    if (offersContainer && JSC_CONFIG.offers) {
      offersContainer.innerHTML = "";
      JSC_CONFIG.offers.forEach((offer) => {
        const isExpired = offer.status === "EXPIRED";
        const card = document.createElement("div");
        card.className = `jsc-glass-card offer-card ${isExpired ? "offer-expired" : "offer-active"}`;

        const waOfferMsg = `Hello Jimmy Sports Club, I am enquiring about the offer: "${offer.title}". Please share details and validity.`;
        const waLink = `https://wa.me/${JSC_CONFIG.whatsapp.number}?text=${encodeURIComponent(waOfferMsg)}`;

        card.innerHTML = `
          <div class="offer-card-top">
            <span class="jsc-badge ${isExpired ? "jsc-badge-expired" : "jsc-badge-lime"}">${escapeHtml(offer.tag)}</span>
            <span class="offer-status-badge ${isExpired ? "badge-inactive" : "badge-active"}">
              ${isExpired ? "● Offer Expired" : "● Live Now"}
            </span>
          </div>
          <h3 class="offer-title">${escapeHtml(offer.title)}</h3>
          <p class="offer-desc">${escapeHtml(offer.description)}</p>
          <div class="offer-footer">
            <div class="offer-validity">
              <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${escapeHtml(offer.validity)}</span>
            </div>
            ${
              isExpired
                ? `<a href="#pricing" class="jsc-btn jsc-btn-outline btn-sm"><span>View Active Rates</span></a>`
                : `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="jsc-btn jsc-btn-primary btn-sm">
                    <span>${escapeHtml(offer.ctaText)}</span>
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.972.575 1.761.884 2.781.884h.003c3.182 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.768-5.769-5.768z"/></svg>
                  </a>`
            }
          </div>
        `;
        offersContainer.appendChild(card);
      });
    }

    // Dynamic Achievements Hydration
    const achievementsContainer = document.getElementById("achievements-timeline-container");
    if (achievementsContainer && JSC_CONFIG.achievements) {
      achievementsContainer.innerHTML = "";
      JSC_CONFIG.achievements.forEach((item, index) => {
        const itemEl = document.createElement("div");
        itemEl.className = "achievement-timeline-item";
        itemEl.innerHTML = `
          <div class="achievement-milestone-marker">
            <div class="marker-dot"></div>
            <div class="marker-line"></div>
          </div>
          <div class="jsc-glass-card achievement-card">
            <div class="achievement-year-badge">${escapeHtml(item.year)}</div>
            <h3 class="achievement-title">${escapeHtml(item.title)}</h3>
            <p class="achievement-desc">${escapeHtml(item.description)}</p>
          </div>
        `;
        achievementsContainer.appendChild(itemEl);
      });
    }

    // Dynamic Reviews Hydration
    const reviewsContainer = document.getElementById("reviews-grid-container");
    if (reviewsContainer && JSC_CONFIG.reviews) {
      reviewsContainer.innerHTML = "";
      JSC_CONFIG.reviews.forEach((review) => {
        const card = document.createElement("div");
        card.className = "jsc-glass-card review-card";
        const starsHtml = Array(review.rating)
          .fill(
            `<svg class="star-icon" viewBox="0 0 24 24" fill="#B6FF36"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`
          )
          .join("");

        card.innerHTML = `
          <div class="review-stars-wrap">${starsHtml}</div>
          <p class="review-quote">"${escapeHtml(review.text)}"</p>
          <div class="review-author-meta">
            <div class="author-avatar-initials">${escapeHtml(review.author.charAt(0))}</div>
            <div class="author-details">
              <span class="author-name">${escapeHtml(review.author)}</span>
              <span class="author-role">${escapeHtml(review.role)} • <span class="verified-tag">Verified</span></span>
            </div>
          </div>
        `;
        reviewsContainer.appendChild(card);
      });
    }

    // Dynamic Academy Batches Hydration
    const batchesContainer = document.getElementById("academy-batches-container");
    if (batchesContainer && JSC_CONFIG.academy && JSC_CONFIG.academy.batches) {
      batchesContainer.innerHTML = "";
      JSC_CONFIG.academy.batches.forEach((b) => {
        const pill = document.createElement("div");
        pill.className = "academy-batch-pill";
        pill.innerHTML = `
          <div class="batch-name">${escapeHtml(b.name)}</div>
          <div class="batch-time">${escapeHtml(b.time)}</div>
          <div class="batch-target">${escapeHtml(b.target)}</div>
        `;
        batchesContainer.appendChild(pill);
      });
    }
  }

  function applyPageContent() {
    const page = window.JSC_PAGE;
    if (!page || !page.sections) return;

    const section = (id) => page.sections[id];
    const content = (id) => section(id)?.content || {};
    const setText = (root, selector, value) => {
      const element = root?.querySelector(selector);
      if (element && typeof value === "string") element.textContent = value;
    };
    const setImage = (root, selector, key) => {
      const element = root?.querySelector(selector);
      const imagePath = page.images?.[key];
      if (element && typeof imagePath === "string") element.src = imagePath;
    };
    const syncItems = (container, selector, items, update) => {
      if (!container) return;
      const existing = Array.from(container.querySelectorAll(`:scope > ${selector}`));
      const template = existing[0];
      existing.forEach((element) => element.remove());
      (Array.isArray(items) ? items : []).forEach((item, index) => {
        const element = template ? template.cloneNode(true) : document.createElement("div");
        update(element, item, index);
        container.append(element);
      });
    };
    const setHeader = (id, fields) => {
      const root = document.querySelector(`[data-page-section="${id}"]`);
      Object.entries(fields).forEach(([selector, value]) => setText(root, selector, value));
    };

    setHeader("home", {
      ".badge-text": content("home").eyebrow,
      ".hero-headline-main": content("home").headlineTop,
      ".hero-headline-sub": content("home").headlineBottom,
      ".hero-description": content("home").description,
      ".hero-cta-group a:first-child span": content("home").exploreButton,
      ".hero-cta-group a:nth-child(2) span": content("home").bookingButton,
      ".hero-glass-card-1 .card-label-small": content("home").locationLabel,
      ".hero-glass-card-1 .card-title-bold": content("home").locationTitle,
      ".hero-glass-card-1 .card-subtext:not(.text-lime)": content("home").locationSubtitle,
      ".hero-glass-card-1 .card-subtext.text-lime": content("home").locationDetail,
      ".hero-glass-card-2 .card-label-small": content("home").performanceLabel,
      ".hero-glass-card-2 .card-title-bold": content("home").performanceTitle,
      ".hero-glass-card-2 .card-subtext:not(.text-lime)": content("home").performanceSubtitle,
      ".hero-glass-card-2 .card-subtext.text-lime": content("home").performanceDetail,
    });

    const bookingLinks = document.querySelectorAll(".nav-actions > .jsc-btn span, .mobile-nav-cta .jsc-btn span");
    bookingLinks.forEach((element) => {
      element.textContent = content("home").bookingButton || element.textContent;
    });
    document.querySelectorAll(".brand-logo-img, .footer-brand-col > a img").forEach((image) => {
      if (page.images.logo) image.src = page.images.logo;
    });
    document.querySelectorAll('link[rel="icon"], link[rel="apple-touch-icon"]').forEach((icon) => {
      if (page.images.logo) icon.href = page.images.logo;
    });
    const structuredData = document.querySelector('script[type="application/ld+json"]');
    if (structuredData && page.images.logo) {
      try {
        const jsonLd = JSON.parse(structuredData.textContent);
        jsonLd.logo = new URL(page.images.logo, window.location.href).href;
        structuredData.textContent = JSON.stringify(jsonLd);
      } catch (error) {
        console.error("Could not update the structured-data logo.", error);
      }
    }
    setImage(document.querySelector('[data-page-section="home"]'), ".hero-graphic-canvas", "hero");

    const statsContainer = document.querySelector('[data-page-section="stats"] .stats-ribbon-card');
    syncItems(statsContainer, ".stat-item", content("stats").items, (element, item) => {
      setText(element, ".stat-title", item.title);
      setText(element, ".stat-desc", item.description);
      const icon = element.querySelector(".stat-icon");
      if (icon) icon.alt = item.title;
    });

    const about = content("about");
    setHeader("about", {
      ".about-editorial-text .section-label": about.label,
      ".about-editorial-text .section-title": about.title,
      ".about-editorial-lead": about.lead,
      ".about-editorial-body": about.body,
      ".about-card-visual > p": about.quote,
      ".about-card-visual > a span": about.button,
    });
    syncItems(document.querySelector(".about-pillars-list"), ".pillar-item", about.pillars, (element, item) => {
      setText(element, ".pillar-heading", item.title);
      setText(element, ".pillar-text", item.description);
    });
    syncItems(document.querySelector(".about-stat-box"), ".single-stat-block", about.stats, (element, item) => {
      setText(element, ".stat-num-huge", item.value);
      setText(element, ".stat-label-text", item.label);
    });

    const facilities = content("facilities");
    setHeader("facilities", {
      ".section-label": facilities.label,
      ".section-title": facilities.title,
      ".section-subtitle": facilities.description,
    });
    const facilityImages = ["facilityTurf", "facilityNets", "facilityBowling"];
    const facilitiesGrid = document.querySelector('[data-page-section="facilities"] .facilities-grid');
    syncItems(facilitiesGrid, ".facility-card", facilities.cards, (element, item, index) => {
      setText(element, ".facility-badge-overlay .jsc-badge", item.badge);
      setText(element, ".facility-title", item.title);
      setText(element, ".facility-desc", item.description);
      setText(element, ".facility-body > a span", item.button);
      setImage(element, ".facility-img", facilityImages[index]);

      const featureList = element.querySelector(".facility-spec-list");
      if (featureList) {
        featureList.replaceChildren();
        (Array.isArray(item.features) ? item.features : []).forEach((feature) => {
          const listItem = document.createElement("li");
          const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
          icon.setAttribute("class", "check-icon");
          icon.setAttribute("viewBox", "0 0 24 24");
          icon.setAttribute("fill", "none");
          icon.setAttribute("stroke", "#B6FF36");
          icon.setAttribute("stroke-width", "2.5");
          const check = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
          check.setAttribute("points", "20 6 9 17 4 12");
          icon.append(check);
          const text = document.createElement("span");
          text.textContent = feature;
          listItem.append(icon, text);
          featureList.append(listItem);
        });
      }

      const enquiryLink = element.querySelector(".facility-body > a");
      if (enquiryLink) {
        const message = `Hello Jimmy Sports Club, I would like to enquire about ${item.title}. Please share availability and booking details.`;
        enquiryLink.href = `https://wa.me/${JSC_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
      }
    });

    const academy = content("academy");
    setHeader("academy", {
      ".section-header .section-label": academy.label,
      ".section-header .section-title": academy.title,
      ".section-header .section-subtitle": academy.description,
      ".academy-hero-text h3": academy.bannerTitle,
      ".academy-hero-text .jsc-btn span": academy.button,
      ".academy-batches-wrap .jsc-badge": academy.batchesBadge,
      ".academy-batches-wrap h3": academy.batchesTitle,
      ".academy-batches-wrap > div > span:last-child": academy.batchesNotice,
    });
    const academyParagraphContainer = document.querySelector('[data-page-section="academy"] .academy-hero-text');
    if (academyParagraphContainer) {
      const academyParagraphs = Array.from(academyParagraphContainer.querySelectorAll(":scope > p"));
      academyParagraphs.forEach((paragraph) => paragraph.remove());
      (academy.paragraphs || []).forEach((paragraph, index) => {
        const element = (academyParagraphs[index] || academyParagraphs[0])?.cloneNode(false) || document.createElement("p");
        element.textContent = paragraph;
        academyParagraphContainer.insertBefore(element, academyParagraphContainer.querySelector(".jsc-btn"));
      });
    }
    syncItems(document.querySelector('[data-page-section="academy"] .academy-highlights-grid'), ".academy-highlight-card", academy.highlights, (element, item) => {
      setText(element, ".highlight-title", item.title);
      setText(element, ".highlight-desc", item.description);
    });
    setImage(document.querySelector('[data-page-section="academy"]'), ".academy-training-visual img", "academy");

    const achievements = content("achievements");
    setHeader("achievements", {
      ".section-label": achievements.label,
      ".section-title": achievements.title,
      ".section-subtitle": achievements.description,
    });
    const pricing = content("pricing");
    setHeader("pricing", {
      ".section-label": pricing.label,
      ".section-title": pricing.title,
      ".section-subtitle": pricing.description,
      ".disclaimer-text strong": pricing.disclaimerTitle,
      ".disclaimer-text": pricing.disclaimer,
      ".bowling-section-subhead h3": pricing.packageTitle,
      ".bowling-section-subhead p": pricing.packageDescription,
      ".calculator-title": pricing.calculatorTitle,
    });
    const disclaimerStrong = document.querySelector('[data-page-section="pricing"] .disclaimer-text strong');
    if (disclaimerStrong) disclaimerStrong.textContent = pricing.disclaimerTitle;
    const disclaimerContainer = document.querySelector('[data-page-section="pricing"] .disclaimer-text');
    if (disclaimerContainer) {
      disclaimerContainer.replaceChildren(
        Object.assign(document.createElement("strong"), { textContent: pricing.disclaimerTitle }),
        document.createTextNode(` ${pricing.disclaimer}`)
      );
    }

    const offers = content("offers");
    setHeader("offers", {
      ".section-label": offers.label,
      ".section-title": offers.title,
      ".section-subtitle": offers.description,
    });
    const gallery = content("gallery");
    setHeader("gallery", {
      ".section-label": gallery.label,
      ".section-title": gallery.title,
      ".section-subtitle": gallery.description,
    });
    const galleryImages = ["galleryTurf", "galleryNets", "galleryBowling", "galleryAcademy", "galleryLights"];
    syncItems(galleryGrid, ".gallery-item", gallery.items, (element, item, index) => {
      element.dataset.category = item.category;
      const image = element.querySelector("img.gallery-thumb");
      if (image) {
        image.alt = item.title;
        if (page.images[galleryImages[index]]) image.src = page.images[galleryImages[index]];
      }
      setText(element, ".gallery-overlay-title", item.title);
      setText(element, ".gallery-overlay-desc", item.description);
    });

    const reviews = content("reviews");
    setHeader("reviews", {
      ".section-label": reviews.label,
      ".section-title": reviews.title,
      ".section-subtitle": reviews.description,
    });

    const contact = content("contact");
    setHeader("contact", {
      ".section-header .section-label": contact.label,
      ".section-header .section-title": contact.title,
      ".section-header .section-subtitle": contact.description,
      ".contact-info-card > h3": contact.cardTitle,
      ".contact-form-card .form-headline": contact.formTitle,
      ".contact-form-card .form-subheadline": contact.formDescription,
      "#jsc-contact-form button span": contact.submitText,
    });
    const contactLabels = document.querySelectorAll('[data-page-section="contact"] .contact-text-label');
    [contact.addressLabel, contact.phoneLabel, contact.whatsappLabel, contact.hoursLabel].forEach((label, index) => {
      if (contactLabels[index]) contactLabels[index].textContent = label;
    });
    const hoursRow = document.querySelectorAll('[data-page-section="contact"] .contact-detail-row')[3];
    setText(hoursRow, ".contact-text-val", contact.hours);
    const phoneLink = document.querySelector('[data-page-section="contact"] .cfg-phone-display');
    if (phoneLink) phoneLink.href = `tel:${JSC_CONFIG.contact.phone}`;
    document.querySelectorAll(".cfg-email-display").forEach((element) => {
      element.textContent = JSC_CONFIG.contact.email;
    });

    const footer = content("footer");
    setText(document.querySelector(".footer-brand-col"), ".footer-brand-bio", footer.bio);
    const socialLink = document.querySelector(".footer-brand-col a[href*='instagram.com']");
    setText(socialLink, "span", footer.socialLabel);

    const main = document.getElementById("main-content");
    if (main) {
      Object.entries(page.sections).forEach(([id, settings]) => {
        const element = main.querySelector(`:scope > [data-page-section="${id}"]`);
        if (element) element.hidden = !settings.visible;
      });
      const orderedSections = page.order
        .map((id) => main.querySelector(`:scope > [data-page-section="${id}"]`))
        .filter(Boolean);
      const extraChildren = Array.from(main.children).filter((element) => !element.hasAttribute("data-page-section"));
      [...orderedSections, ...extraChildren].forEach((element) => main.append(element));
    }
    const footerElement = document.querySelector("footer.jsc-footer");
    if (footerElement && page.sections.footer) footerElement.hidden = !page.sections.footer.visible;
  }

  /**
   * Navbar Scroll Header Styling
   */
  function handleNavbarScroll() {
    if (!navbar) return;
    if (window.scrollY > 40) {
      navbar.classList.add("navbar-scrolled");
    } else {
      navbar.classList.remove("navbar-scrolled");
    }
  }

  /**
   * ScrollSpy for active nav items
   */
  function initScrollSpy() {
    const sections = document.querySelectorAll("section[id]");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute("id");
            navLinks.forEach((link) => {
              const href = link.getAttribute("href");
              if (href === `#${id}`) {
                link.classList.add("active");
              } else {
                link.classList.remove("active");
              }
            });
          }
        });
      },
      {
        rootMargin: "-20% 0px -70% 0px"
      }
    );

    sections.forEach((s) => observer.observe(s));
  }

  /**
   * Gallery Filter & Lightbox Setup
   */
  function initGallery() {
    if (!galleryGrid) return;

    // Filter Buttons
    galleryFilterBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        galleryFilterBtns.forEach((b) => b.classList.remove("active"));
        this.classList.add("active");
        const category = this.getAttribute("data-filter");

        const items = galleryGrid.querySelectorAll(".gallery-item");
        items.forEach((item) => {
          const itemCat = item.getAttribute("data-category");
          if (category === "all" || itemCat === category) {
            item.style.display = "";
          } else {
            item.style.display = "none";
          }
        });
      });
    });

    // Lightbox open
    galleryGrid.querySelectorAll(".gallery-zoom-trigger").forEach((trigger) => {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        const galleryItem = this.closest(".gallery-item");
        const img = galleryItem.querySelector("img");
        const video = galleryItem.querySelector("video");
        const title = galleryItem.querySelector(".gallery-overlay-title")?.textContent || "";
        const desc = galleryItem.querySelector(".gallery-overlay-desc")?.textContent || "";

        if (lightboxModal && (img || video)) {
          if (video && lightboxVideo) {
            if (lightboxImg) lightboxImg.hidden = true;
            lightboxVideo.hidden = false;
            lightboxVideo.src = video.currentSrc || video.src;
            lightboxVideo.setAttribute("aria-label", title || "Jimmy Sports Club video");
          } else if (img && lightboxImg) {
            if (lightboxVideo) {
              lightboxVideo.pause();
              lightboxVideo.removeAttribute("src");
              lightboxVideo.load();
              lightboxVideo.hidden = true;
            }
            lightboxImg.hidden = false;
            lightboxImg.src = img.src;
            lightboxImg.alt = img.alt || "Jimmy Sports Club";
          }
          if (lightboxCaption) {
            const titleElement = document.createElement("strong");
            titleElement.textContent = title;
            lightboxCaption.replaceChildren(titleElement, document.createTextNode(` — ${desc}`));
          }
          lightboxModal.classList.add("is-visible");
          document.body.style.overflow = "hidden";
        }
      });
    });

    // Close Lightbox
    if (lightboxClose && lightboxModal) {
      lightboxClose.addEventListener("click", closeLightbox);
      lightboxModal.addEventListener("click", function (e) {
        if (e.target === lightboxModal) closeLightbox();
      });
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && lightboxModal.classList.contains("is-visible")) {
          closeLightbox();
        }
      });
    }

    function closeLightbox() {
      lightboxModal.classList.remove("is-visible");
      if (lightboxVideo) {
        lightboxVideo.pause();
        lightboxVideo.removeAttribute("src");
        lightboxVideo.load();
        lightboxVideo.hidden = true;
      }
      if (lightboxImg) lightboxImg.hidden = false;
      document.body.style.overflow = "";
    }
  }

  function renderManagedGallery() {
    if (!galleryGrid || !Array.isArray(window.JSC_MEDIA)) return;

    window.JSC_MEDIA.forEach((media) => {
      const item = document.createElement("div");
      item.className = "gallery-item";
      item.dataset.category = media.category;

      let preview;
      if (media.type === "video") {
        preview = document.createElement("video");
        preview.muted = true;
        preview.playsInline = true;
        preview.preload = "metadata";
        preview.setAttribute("aria-label", media.title);
      } else {
        preview = document.createElement("img");
        preview.alt = media.title;
        preview.loading = "lazy";
      }
      preview.src = media.url;
      preview.classList.add("gallery-thumb");

      const overlay = document.createElement("div");
      overlay.className = "gallery-item-overlay";
      const title = document.createElement("h4");
      title.className = "gallery-overlay-title";
      title.textContent = media.title;
      const description = document.createElement("p");
      description.className = "gallery-overlay-desc";
      description.textContent = media.type === "video" ? "Video • Jimmy Sports Club" : "Jimmy Sports Club Gallery";
      const trigger = document.createElement("a");
      trigger.href = "#";
      trigger.className = "gallery-zoom-trigger";
      trigger.setAttribute("aria-label", `View ${media.type}: ${media.title}`);
      trigger.textContent = media.type === "video" ? "▶" : "↗";
      overlay.append(title, description, trigger);
      item.append(preview, overlay);
      galleryGrid.append(item);
    });
  }

  /**
   * Handle Custom WhatsApp Booking Enquiry Form
   */
  function handleContactSubmit(e) {
    e.preventDefault();

    const name = document.getElementById("contact-name")?.value.trim() || "Player";
    const phone = document.getElementById("contact-phone")?.value.trim() || "Not provided";
    const facilitySelect = document.getElementById("contact-facility");
    const facilityText = facilitySelect?.options[facilitySelect.selectedIndex]?.text || "Cricket Turf";
    const preferredDate = document.getElementById("contact-date")?.value || "Flexible";
    const preferredTime = document.getElementById("contact-time")?.value || "Day/Night Slot";
    const notes = document.getElementById("contact-notes")?.value.trim() || "";

    const message = `Hello Jimmy Sports Club,\n\nI would like to enquire about booking a slot:\n- Name: ${name}\n- Contact: ${phone}\n- Selected Facility: ${facilityText}\n- Preferred Date: ${preferredDate}\n- Preferred Time: ${preferredTime}${notes ? `\n- Additional Notes: ${notes}` : ""}\n\nPlease share availability and booking confirmation. Thank you!`;

    const waUrl = `https://wa.me/${JSC_CONFIG.whatsapp.number}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");
  }

  /**
   * Subtle Scroll Reveal
   */
  function initScrollReveal() {
    // Check user preference for motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    if (!revealElements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15
      }
    );

    revealElements.forEach((el) => observer.observe(el));
  }
}

initializeMain();
