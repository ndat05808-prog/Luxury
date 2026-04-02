(() => {
  // main.js
  // Shared JavaScript utilities for the whole website.
  // This file handles DOM helpers, localStorage helpers, toast messages,
  // active navigation state, mobile navigation, theme switching, and cart count updates.
  "use strict";
  const { qs, storage, formatVND } = window.LuxeFund || {};
  if (!qs) return;
  // Cache important homepage elements so they can be updated efficiently.
  const totalEl = qs("#home_raised");
  const updatedEl = qs("#home_updated");
  // Reads the total donation amount from localStorage and shows it on the homepage.
  const render = () => {
    const total = Number(storage.get("luxefund_donations_total", 0) || 0);
    if (totalEl) totalEl.textContent = formatVND(total);
    if (updatedEl)
      updatedEl.textContent =
        "Last updated: " + new Date().toLocaleString("en-GB");
  };
  // Renders homepage data after the DOM loads and refreshes it when storage changes.
  document.addEventListener("DOMContentLoaded", () => {
    render();
    window.addEventListener("storage", render);
  });
})();
