/**
 * =======================================================================
 * JIMMY SPORTS CLUB (JSC) — MAIN APPLICATION LOGIC
 * =======================================================================
 * Handles navigation, mobile menu, dynamic section hydration from config,
 * gallery filtering & modal lightbox, and custom WhatsApp message generation.
 * =======================================================================
 */

document.addEventListener("DOMContentLoaded", function () {
  // 1. DOM Elements
  const navbar = document.getElementById("jsc-navbar");
  const navToggle = document.getElementById("nav-toggle");
  const mobileNav = document.getElementById("mobile-nav");
  const navLinks = document.querySelectorAll(".nav-link");
  const contactForm = document.getElementById("jsc-contact-form");
  const lightboxModal = document.getElementById("gallery-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxCaption = document.getElementById("lightbox-caption");
  const lightboxClose = document.getElementById("lightbox-close");
  const galleryGrid = document.getElementById("gallery-masonry-grid");
  const galleryFilterBtns = document.querySelectorAll(".gallery-filter-btn");

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
            <span class="jsc-badge ${isExpired ? "jsc-badge-expired" : "jsc-badge-lime"}">${offer.tag}</span>
            <span class="offer-status-badge ${isExpired ? "badge-inactive" : "badge-active"}">
              ${isExpired ? "● Offer Expired" : "● Live Now"}
            </span>
          </div>
          <h3 class="offer-title">${offer.title}</h3>
          <p class="offer-desc">${offer.description}</p>
          <div class="offer-footer">
            <div class="offer-validity">
              <svg class="calendar-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span>${offer.validity}</span>
            </div>
            ${
              isExpired
                ? `<a href="#pricing" class="jsc-btn jsc-btn-outline btn-sm"><span>View Active Rates</span></a>`
                : `<a href="${waLink}" target="_blank" rel="noopener noreferrer" class="jsc-btn jsc-btn-primary btn-sm">
                    <span>${offer.ctaText}</span>
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
            <div class="achievement-year-badge">${item.year}</div>
            <h3 class="achievement-title">${item.title}</h3>
            <p class="achievement-desc">${item.description}</p>
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
          <p class="review-quote">"${review.text}"</p>
          <div class="review-author-meta">
            <div class="author-avatar-initials">${review.author.charAt(0)}</div>
            <div class="author-details">
              <span class="author-name">${review.author}</span>
              <span class="author-role">${review.role} • <span class="verified-tag">Verified</span></span>
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
          <div class="batch-name">${b.name}</div>
          <div class="batch-time">${b.time}</div>
          <div class="batch-target">${b.target}</div>
        `;
        batchesContainer.appendChild(pill);
      });
    }
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
        const title = galleryItem.querySelector(".gallery-overlay-title")?.textContent || "";
        const desc = galleryItem.querySelector(".gallery-overlay-desc")?.textContent || "";

        if (lightboxModal && lightboxImg && img) {
          lightboxImg.src = img.src;
          lightboxImg.alt = img.alt || "Jimmy Sports Club";
          if (lightboxCaption) {
            lightboxCaption.innerHTML = `<strong>${title}</strong> — ${desc}`;
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
      document.body.style.overflow = "";
    }
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
});
