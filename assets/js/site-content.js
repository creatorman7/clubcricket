(function () {
  window.JSC_CONFIG_READY = false;
  window.JSC_MEDIA = [];
  window.JSC_PAGE = null;
  window.JSC_ESCAPE_HTML = function (value) {
    return String(value).replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    })[character]);
  };

  function applyManagedContent(content) {
    if (!content || !content.pricing || !Array.isArray(content.pricing.facilities) || !Array.isArray(content.pricing.bowlingMachinePackages)) {
      throw new Error("The managed site content has an invalid format.");
    }

    const pricing = content.pricing;
    if (typeof pricing.season === "string" && pricing.season.trim()) {
      JSC_CONFIG.pricing.season = pricing.season;
    }
    if (Number.isInteger(pricing.weekendChargePercent) && pricing.weekendChargePercent >= 0 && pricing.weekendChargePercent <= 100) {
      JSC_CONFIG.pricing.weekendChargePercent = pricing.weekendChargePercent;
    }

    pricing.facilities.forEach((savedFacility) => {
      const facility = JSC_CONFIG.pricing.facilities.find((item) => item.id === savedFacility.id);
      if (!facility) return;
      ["dayRate", "nightRate"].forEach((period) => {
        if (Number.isInteger(savedFacility[period]) && savedFacility[period] >= 0) {
          facility[period] = savedFacility[period];
        }
      });
    });

    pricing.bowlingMachinePackages.forEach((savedPackage) => {
      const packageInfo = JSC_CONFIG.pricing.bowlingMachinePackages.find((item) => item.overs === savedPackage.overs);
      if (packageInfo && Number.isInteger(savedPackage.price) && savedPackage.price >= 0) {
        packageInfo.price = savedPackage.price;
      }
    });

    const page = content.page;
    if (page && page.sections && Array.isArray(page.order) && page.images) {
      window.JSC_PAGE = page;

      const sectionContent = (id) => page.sections[id]?.content;
      const facilitiesContent = sectionContent("facilities");
      facilitiesContent?.cards?.forEach((card, index) => {
        const facility = JSC_CONFIG.pricing.facilities[index];
        if (!facility) return;
        facility.badge = card.badge;
        facility.title = card.title;
        facility.subtitle = card.description;
        facility.features = card.features;
      });

      const academy = sectionContent("academy");
      if (academy) {
        JSC_CONFIG.academy.heading = academy.title;
        JSC_CONFIG.academy.subheading = academy.description;
        JSC_CONFIG.academy.highlights = academy.highlights;
        JSC_CONFIG.academy.batches = academy.batches;
      }

      const achievements = sectionContent("achievements");
      if (achievements) JSC_CONFIG.achievements = achievements.items;

      const offers = sectionContent("offers");
      if (offers) JSC_CONFIG.offers = offers.items;

      const reviews = sectionContent("reviews");
      if (reviews) {
        JSC_CONFIG.reviews = reviews.items.map((item) => ({
          ...item,
          rating: Number(item.rating) || 0,
          source: "Verified Player Review",
        }));
      }

      const pricingContent = sectionContent("pricing");
      if (pricingContent) JSC_CONFIG.pricing.disclaimer = pricingContent.disclaimer;

      const contact = sectionContent("contact");
      if (contact) {
        JSC_CONFIG.contact.phoneDisplay = contact.phoneDisplay;
        JSC_CONFIG.contact.email = contact.email;
        JSC_CONFIG.club.fullAddress = contact.address;
      }
    }

    if (Array.isArray(content.media)) {
      window.JSC_MEDIA = content.media.filter((item) =>
        item &&
        typeof item.id === "string" &&
        typeof item.title === "string" &&
        ["turf", "nets", "bowling", "academy"].includes(item.category) &&
        ["image", "video"].includes(item.type) &&
        typeof item.url === "string" &&
        item.url.startsWith("/assets/uploads/")
      );
    }
  }

  fetch("admin/public-content.php", { cache: "no-store" })
    .then((response) => {
      if (!response.ok) throw new Error(`Content request failed (${response.status}).`);
      return response.json();
    })
    .then(applyManagedContent)
    .catch((error) => {
      console.error("Could not load JSC managed content; showing the built-in site defaults.", error);
    })
    .finally(() => {
      window.JSC_CONFIG_READY = true;
      document.dispatchEvent(new Event("jsc-config-ready"));
    });
})();
