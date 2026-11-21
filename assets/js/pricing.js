/**
 * =======================================================================
 * JIMMY SPORTS CLUB (JSC) — INTERACTIVE PRICING ENGINE
 * =======================================================================
 * Handles Day/Night, Weekday/Weekend pricing calculations, bowling machine
 * package rendering, and dynamic WhatsApp enquiry link formatting.
 * =======================================================================
 */

function initializePricing() {
  if (!window.JSC_CONFIG_READY) {
    document.addEventListener("jsc-config-ready", initializePricing, { once: true });
    return;
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", runPricing, { once: true });
  } else {
    runPricing();
  }
}

function runPricing() {
  const isWeekendToggle = document.getElementById("pricing-day-type-toggle");
  const timePeriodSelect = document.getElementById("pricing-time-period-select");
  const facilitiesContainer = document.getElementById("pricing-facilities-grid");
  const bowlingPackagesContainer = document.getElementById("bowling-packages-grid");
  const quickCalcFacility = document.getElementById("calc-facility");
  const quickCalcDayType = document.getElementById("calc-daytype");
  const quickCalcHours = document.getElementById("calc-hours");
  const quickCalcOutput = document.getElementById("calc-total-display");
  const quickCalcWaBtn = document.getElementById("calc-whatsapp-btn");
  const weekendLabel = document.getElementById("pricing-weekend-label");
  const seasonLabel = document.getElementById("pricing-season-label");
  const calculatorWeekendOption = document.getElementById("calc-weekend-option");
  const contactFacility = document.getElementById("contact-facility");
  const escapeHtml = window.JSC_ESCAPE_HTML || ((value) => String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]));

  // State
  let isWeekend = false;
  let isNight = false;
  const weekendChargePercent = Number(JSC_CONFIG.pricing.weekendChargePercent) || 0;

  if (weekendLabel) weekendLabel.textContent = `Weekend (+${weekendChargePercent}%)`;
  if (seasonLabel) seasonLabel.textContent = JSC_CONFIG.pricing.season;
  if (calculatorWeekendOption) calculatorWeekendOption.textContent = `Weekend (+${weekendChargePercent}% Sat–Sun)`;

  /**
   * Calculate effective price applying weekend surcharge if active
   */
  function calculateRate(basePrice, applyWeekend) {
    if (!applyWeekend) return basePrice;
    return Math.round(basePrice * (1 + weekendChargePercent / 100));
  }

  /**
   * Helper to build WhatsApp URL
   */
  function buildWhatsAppUrl(message) {
    const phone = JSC_CONFIG.whatsapp.number;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  }

  /**
   * Render Facilities (Turf & Nets)
   */
  function renderFacilities() {
    if (!facilitiesContainer) return;
    facilitiesContainer.innerHTML = "";

    JSC_CONFIG.pricing.facilities.forEach((facility) => {
      const basePrice = isNight ? facility.nightRate : facility.dayRate;
      const effectivePrice = calculateRate(basePrice, isWeekend);

      const periodLabel = isNight ? "Night Slot (5 PM+)" : "Day Slot (6 AM - 5 PM)";
      const dayLabel = isWeekend ? `Weekend (+${weekendChargePercent}%)` : "Weekday Regular";

      const waMessage = `Hello Jimmy Sports Club, I would like to book a slot for ${facility.title} (${periodLabel}, ${dayLabel}). Calculated rate: ₹${effectivePrice}/hr. Please share available time slots.`;

      const card = document.createElement("div");
      card.className = "jsc-glass-card pricing-card";
      card.setAttribute("data-facility-id", facility.id);

      card.innerHTML = `
        <div class="pricing-card-header">
          <span class="jsc-badge jsc-badge-lime">${escapeHtml(facility.badge)}</span>
          <h3 class="pricing-card-title">${escapeHtml(facility.title)}</h3>
          <p class="pricing-card-subtitle">${escapeHtml(facility.subtitle)}</p>
        </div>

        <div class="pricing-rate-box">
          <div class="pricing-price-wrap">
            <span class="pricing-currency">₹</span>
            <span class="pricing-amount" id="price-amount-${facility.id}">${effectivePrice}</span>
            <span class="pricing-unit">/${escapeHtml(facility.unit.replace("per ", ""))}</span>
          </div>
          <div class="pricing-period-meta">
            <span class="meta-tag"><span class="meta-dot"></span>${dayLabel}</span>
            <span class="meta-tag">${periodLabel}</span>
          </div>
        </div>

        <ul class="pricing-features-list">
          ${facility.features.map((f) => `
            <li>
              <svg class="check-icon" viewBox="0 0 24 24" fill="none" stroke="#B6FF36" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              <span>${escapeHtml(f)}</span>
            </li>
          `).join("")}
        </ul>

        <div class="pricing-card-cta">
          <a href="${buildWhatsAppUrl(waMessage)}" target="_blank" rel="noopener noreferrer" class="jsc-btn jsc-btn-primary btn-block">
            <span>Enquire on WhatsApp</span>
            <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.599 2.679-.702c.972.575 1.761.884 2.781.884h.003c3.182 0 5.768-2.587 5.769-5.766.001-3.182-2.585-5.768-5.769-5.768z"/></svg>
          </a>
        </div>
      `;

      facilitiesContainer.appendChild(card);
    });
  }

  /**
   * Render Bowling Machine Packages
   */
  function renderBowlingPackages() {
    if (!bowlingPackagesContainer) return;
    bowlingPackagesContainer.innerHTML = "";

    JSC_CONFIG.pricing.bowlingMachinePackages.forEach((pkg) => {
      const basePrice = pkg.price;
      const effectivePrice = calculateRate(basePrice, isWeekend);
      const ballsApprox = pkg.overs * 6;
      const dayLabel = isWeekend ? `Weekend (+${weekendChargePercent}%)` : "Weekday Regular";

      const waMsg = `Hello Jimmy Sports Club, I would like to book the Automated Bowling Machine package of ${pkg.overs} Overs (${ballsApprox} Balls) for ₹${effectivePrice} (${dayLabel}). Please let me know available slots.`;

      const card = document.createElement("div");
      card.className = `bowling-package-card jsc-glass-card ${pkg.popular ? "featured-package" : ""}`;

      card.innerHTML = `
        ${pkg.popular ? `<div class="package-ribbon">POPULAR</div>` : ""}
        <div class="package-overs-badge">${pkg.overs} OVERS</div>
        <div class="package-balls-meta">${ballsApprox} Balls Repetitive Practice</div>
        <div class="package-price-wrap">
          <span class="package-currency">₹</span>
          <span class="package-price">${effectivePrice}</span>
        </div>
        <div class="package-day-tag">${dayLabel}</div>
        <a href="${buildWhatsAppUrl(waMsg)}" target="_blank" rel="noopener noreferrer" class="jsc-btn jsc-btn-outline btn-sm btn-block">
          <span>Book ${pkg.overs} Overs</span>
        </a>
      `;

      bowlingPackagesContainer.appendChild(card);
    });
  }

  /**
   * Quick Slot Total Calculator
   */
  function updateQuickCalculator() {
    if (!quickCalcFacility || !quickCalcOutput) return;

    const facilityId = quickCalcFacility.value;
    const isWk = quickCalcDayType ? quickCalcDayType.value === "weekend" : false;
    const hours = parseInt(quickCalcHours ? quickCalcHours.value : "1", 10) || 1;

    const facility = JSC_CONFIG.pricing.facilities.find((item) => item.id === facilityId);
    const baseHourly = facility ? (isNight ? facility.nightRate : facility.dayRate) : 0;

    const hourly = calculateRate(baseHourly, isWk);
    const total = hourly * hours;

    quickCalcOutput.textContent = `₹${total}`;
    if (facility) {
      const option = Array.from(quickCalcFacility.options).find((item) => item.value === facilityId);
      if (option) option.textContent = `${facility.title} (₹${baseHourly}/hr)`;
      if (contactFacility) {
        const contactOption = Array.from(contactFacility.options).find((item) => item.value === facilityId);
        if (contactOption) contactOption.textContent = `${facility.title} (₹${facility.dayRate}/hr)`;
      }
    }

    if (quickCalcWaBtn) {
      const facName = facility ? facility.title : "Cricket Facility";
      const dayText = isWk ? "Weekend" : "Weekday";
      const periodText = isNight ? "night" : "day";
      const msg = `Hello Jimmy Sports Club, I would like to book ${facName} for ${hours} hour(s) on a ${dayText} ${periodText} slot. Estimated total: ₹${total}. Please share slot timings.`;
      quickCalcWaBtn.href = buildWhatsAppUrl(msg);
    }
  }

  // Event Listeners for Toggles
  if (isWeekendToggle) {
    isWeekendToggle.addEventListener("change", function () {
      isWeekend = this.checked;
      renderFacilities();
      renderBowlingPackages();
    });
  }

  if (timePeriodSelect) {
    timePeriodSelect.addEventListener("change", function () {
      isNight = this.value === "night";
      renderFacilities();
      updateQuickCalculator();
    });
  }

  // Quick Calculator listeners
  if (quickCalcFacility) quickCalcFacility.addEventListener("change", updateQuickCalculator);
  if (quickCalcDayType) quickCalcDayType.addEventListener("change", updateQuickCalculator);
  if (quickCalcHours) quickCalcHours.addEventListener("input", updateQuickCalculator);

  // Initial Run
  renderFacilities();
  renderBowlingPackages();
  updateQuickCalculator();
}

initializePricing();
