(() => {
  "use strict";

  // DOM Helper Functions
  const qs = (sel, root = document) => {
    try {
      return root.querySelector(sel);
    } catch (e) {
      console.error("Query selector error:", sel, e);
      return null;
    }
  };

  const qsa = (sel, root = document) => {
    try {
      return Array.from(root.querySelectorAll(sel));
    } catch (e) {
      console.error("Query selector all error:", sel, e);
      return [];
    }
  };

  // LocalStorage Wrapper with Error Handling
  const storage = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
      } catch (e) {
        console.warn(`Failed to read from localStorage: ${key}`, e);
        return fallback;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.error(`Failed to write to localStorage: ${key}`, e);
        // Handle quota exceeded error
        if (e.name === "QuotaExceededError") {
          console.warn(
            "LocalStorage quota exceeded - old data may not be saved",
          );
        }
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.error(`Failed to remove from localStorage: ${key}`, e);
      }
    },
  };

  // Number Formatting
  const formatVND = (n) => {
    try {
      return Number(n || 0).toLocaleString("vi-VN") + " ₫";
    } catch (e) {
      console.error("Format VND error:", e);
      return "0 ₫";
    }
  };

  // Toast Notification with Improved Animation
  const toast = (message) => {
    const wrap = qs("#toastwrap");
    if (!wrap) return;

    try {
      const el = document.createElement("div");
      el.className = "toast";
      el.textContent = message ?? "Action completed";
      el.setAttribute("role", "status");
      el.setAttribute("aria-live", "polite");
      wrap.appendChild(el);

      // Use requestAnimationFrame for smoother cleanup
      setTimeout(() => {
        el.style.opacity = "0";
        el.style.transform = "translateY(6px)";
        setTimeout(() => {
          try {
            el.remove();
          } catch (e) {
            console.warn("Error removing toast:", e);
          }
        }, 220);
      }, 2200);
    } catch (e) {
      console.error("Toast creation error:", e);
    }
  };

  // Expose Global API
  window.LuxeFund = { qs, qsa, storage, formatVND, toast };

  // Mark Active Navigation Link
  const markActiveLink = () => {
    try {
      const path = (
        location.pathname.split("/").pop() || "index.html"
      ).toLowerCase();
      qsa(".nav a").forEach((a) => {
        const href = (a.getAttribute("href") || "").toLowerCase();
        if (href === path) {
          a.setAttribute("aria-current", "page");
        } else {
          a.removeAttribute("aria-current");
        }
      });
    } catch (e) {
      console.error("Error marking active link:", e);
    }
  };

  // Mobile Navigation Setup
  const setupMobileNav = () => {
    try {
      const btn = qs("#navtoggle");
      const nav = qs("#nav");
      if (!btn || !nav) return;

      btn.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(isOpen));

        // Trap focus in mobile nav when open
        if (isOpen) {
          document.addEventListener("click", closeOnOutsideClick);
        } else {
          document.removeEventListener("click", closeOnOutsideClick);
        }
      });

      // Close nav when link is clicked
      nav.addEventListener("click", (e) => {
        if (e.target.tagName === "A") {
          nav.classList.remove("open");
          btn.setAttribute("aria-expanded", "false");
        }
      });
    } catch (e) {
      console.error("Error setting up mobile nav:", e);
    }
  };

  const closeOnOutsideClick = (e) => {
    const nav = qs("#nav");
    const btn = qs("#navtoggle");
    if (nav && btn && !nav.contains(e.target) && !btn.contains(e.target)) {
      nav.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
      document.removeEventListener("click", closeOnOutsideClick);
    }
  };

  // Theme Management
  const setupTheme = () => {
    try {
      const btn = qs("#themetoggle");
      const saved = storage.get("luxefund_theme", "dark");

      if (saved === "light") {
        document.body.classList.add("light");
      }

      if (!btn) return;

      const sync = () => {
        const isLight = document.body.classList.contains("light");
        btn.textContent = isLight ? "Dark mode" : "Light mode";
        btn.setAttribute("aria-pressed", String(isLight));
      };

      sync();

      btn.addEventListener("click", () => {
        document.body.classList.toggle("light");
        const theme = document.body.classList.contains("light")
          ? "light"
          : "dark";
        storage.set("luxefund_theme", theme);
        sync();
        toast("Theme updated.");
      });
    } catch (e) {
      console.error("Error setting up theme:", e);
    }
  };

  // Update Cart Count
  const updateCartCount = () => {
    try {
      const cart = storage.get("luxefund_cart", []);
      const count = cart.reduce((sum, item) => sum + (item.qty || 1), 0);
      const badge = qs("#cartcount");
      if (badge) {
        badge.textContent = String(count);
        badge.setAttribute("aria-label", `${count} items in cart`);
      }
    } catch (e) {
      console.error("Error updating cart count:", e);
    }
  };

  // Initialization
  const init = () => {
    try {
      markActiveLink();
      setupMobileNav();
      setupTheme();
      updateCartCount();

      // Listen for cart changes from other pages
      window.addEventListener("luxefund_cart_changed", updateCartCount);
      window.addEventListener("storage", updateCartCount);
    } catch (e) {
      console.error("Initialization error:", e);
    }
  };

  // Start when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
