(function () {
  window.JSC_CONFIG_READY = false;
  window.JSC_MEDIA = [];

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
