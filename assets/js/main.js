(() => {
  "use strict";

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
        if (e.name === "QuotaExceededError") {
          console.warn("LocalStorage quota exceeded - data may not be saved");
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

  const formatVND = (n) => {
    try {
      return Number(n || 0).toLocaleString("vi-VN") + " ₫";
    } catch (e) {
      console.error("Format VND error:", e);
      return "0 ₫";
    }
  };

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

  const sanitizeText = (value, max = 120) =>
    String(value ?? "")
      .trim()
      .replace(/\s+/g, " ")
      .slice(0, max);

  const usersKey = "luxefund_users";
  const currentUserKey = "luxefund_current_user";
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const getUsers = () => storage.get(usersKey, []);
  const setUsers = (users) => storage.set(usersKey, users);
  const getCurrentUser = () => storage.get(currentUserKey, null);
  const setCurrentUser = (user) => {
    if (user) storage.set(currentUserKey, user);
    else storage.remove(currentUserKey);
    window.dispatchEvent(new Event("luxefund_auth_changed"));
  };

  const findUserByEmail = (email) => {
    const safeEmail = sanitizeText(email, 160).toLowerCase();
    return (
      getUsers().find((user) => user.email.toLowerCase() === safeEmail) || null
    );
  };

  const registerUser = ({ name, email, password, confirmPassword }) => {
    const safeName = sanitizeText(name, 80);
    const safeEmail = sanitizeText(email, 160).toLowerCase();
    const safePassword = String(password ?? "").trim();
    const safeConfirm = String(confirmPassword ?? "").trim();

    if (safeName.length < 2)
      return { ok: false, message: "Name must be at least 2 characters." };
    if (!emailPattern.test(safeEmail))
      return { ok: false, message: "Please enter a valid email address." };
    if (safePassword.length < 6)
      return { ok: false, message: "Password must be at least 6 characters." };
    if (safePassword !== safeConfirm)
      return { ok: false, message: "Passwords do not match." };
    if (findUserByEmail(safeEmail))
      return { ok: false, message: "This email is already registered." };

    const users = getUsers();
    const newUser = {
      id: "u_" + Date.now(),
      name: safeName,
      email: safeEmail,
      password: safePassword,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    setUsers(users);
    setCurrentUser({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
    });

    return { ok: true, message: "Account created successfully." };
  };

  const loginUser = ({ email, password }) => {
    const safeEmail = sanitizeText(email, 160).toLowerCase();
    const safePassword = String(password ?? "").trim();

    if (!emailPattern.test(safeEmail))
      return { ok: false, message: "Please enter a valid email address." };
    if (safePassword.length < 6)
      return { ok: false, message: "Password must be at least 6 characters." };

    const user = findUserByEmail(safeEmail);
    if (!user || user.password !== safePassword) {
      return { ok: false, message: "Incorrect email or password." };
    }

    setCurrentUser({ id: user.id, name: user.name, email: user.email });
    return { ok: true, message: "Logged in successfully." };
  };

  const logoutUser = () => {
    setCurrentUser(null);
    toast("Logged out.");
  };

  window.LuxeFund = {
    qs,
    qsa,
    storage,
    formatVND,
    toast,
    getCurrentUser,
    requireAuth(message = "Please log in first.") {
      const user = getCurrentUser();
      if (user) return true;
      toast(message);
      if (typeof openAuthModal === "function") openAuthModal("login");
      return false;
    },
  };

  const markActiveLink = () => {
    try {
      const path = (
        location.pathname.split("/").pop() || "index.html"
      ).toLowerCase();
      qsa(".nav a").forEach((a) => {
        const href = (a.getAttribute("href") || "").toLowerCase();
        if (href === path) a.setAttribute("aria-current", "page");
        else a.removeAttribute("aria-current");
      });
    } catch (e) {
      console.error("Error marking active link:", e);
    }
  };

  const setupMobileNav = () => {
    try {
      const btn = qs("#navtoggle");
      const nav = qs("#nav");
      if (!btn || !nav) return;

      btn.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        btn.setAttribute("aria-expanded", String(isOpen));
        if (isOpen) document.addEventListener("click", closeOnOutsideClick);
        else document.removeEventListener("click", closeOnOutsideClick);
      });

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

  const setupTheme = () => {
    try {
      const btn = qs("#themetoggle");
      const saved = storage.get("luxefund_theme", "dark");
      if (saved === "light") document.body.classList.add("light");
      if (!btn) return;

      const sync = () => {
        const isLight = document.body.classList.contains("light");
        btn.innerHTML = "";
        const img = document.createElement("img");
        img.src = isLight ? "assets/img/moon.png" : "assets/img/sun.png";
        img.alt = isLight ? "Dark mode" : "Light mode";
        img.style.width = "24px";
        img.style.height = "24px";
        btn.appendChild(img);
        btn.setAttribute("aria-pressed", String(isLight));
        btn.setAttribute(
          "aria-label",
          isLight ? "Switch to dark mode" : "Switch to light mode",
        );
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

  const authEls = {
    trigger: null,
    modal: null,
    close: null,
    title: null,
    loginTab: null,
    registerTab: null,
    loginForm: null,
    registerForm: null,
    message: null,
    loggedInPanel: null,
    whoAmI: null,
    whoEmail: null,
    logout: null,
  };

  const setAuthMessage = (message = "", kind = "help") => {
    if (!authEls.message) return;
    authEls.message.textContent = message;
    authEls.message.className = `${kind} mt12`;
  };

  const switchAuthView = (view = "login") => {
    const currentUser = getCurrentUser();

    if (authEls.title) {
      authEls.title.textContent = currentUser
        ? "Your account"
        : view === "register"
          ? "Create account"
          : "Welcome back";
    }

    const loggedIn = Boolean(currentUser);
    authEls.loggedInPanel?.classList.toggle("hidden", !loggedIn);
    authEls.loginForm?.classList.toggle("hidden", loggedIn || view !== "login");
    authEls.registerForm?.classList.toggle(
      "hidden",
      loggedIn || view !== "register",
    );

    const socialBtns = qs(".social-buttons");
    const divider = qs(".auth-divider");
    if (socialBtns) socialBtns.classList.toggle("hidden", loggedIn);
    if (divider) divider.classList.toggle("hidden", loggedIn);

    if (authEls.loginTab) {
      authEls.loginTab.classList.toggle(
        "primary",
        !loggedIn && view === "login",
      );
      authEls.loginTab.setAttribute(
        "aria-selected",
        String(!loggedIn && view === "login"),
      );
    }
    if (authEls.registerTab) {
      authEls.registerTab.classList.toggle(
        "primary",
        !loggedIn && view === "register",
      );
      authEls.registerTab.setAttribute(
        "aria-selected",
        String(!loggedIn && view === "register"),
      );
    }
    if (authEls.loginTab && loggedIn)
      authEls.loginTab.classList.remove("primary");
    if (authEls.registerTab && loggedIn)
      authEls.registerTab.classList.remove("primary");

    if (loggedIn) {
      authEls.whoAmI && (authEls.whoAmI.textContent = currentUser.name);
      authEls.whoEmail && (authEls.whoEmail.textContent = currentUser.email);
      setAuthMessage(
        "You can stay signed in with localStorage on this browser.",
      );
    } else {
      setAuthMessage("");
    }
  };

  function openAuthModal(view = "login") {
    if (!authEls.modal) return;
    authEls.modal.classList.add("open");
    authEls.modal.setAttribute("aria-hidden", "false");
    switchAuthView(view);

    if (getCurrentUser()) return;
    if (view === "register") qs("#registername")?.focus();
    else qs("#loginemail")?.focus();
  }

  const closeAuthModal = () => {
    if (!authEls.modal) return;
    authEls.modal.classList.remove("open");
    authEls.modal.setAttribute("aria-hidden", "true");
    setAuthMessage("");
  };

  const renderAuthTrigger = () => {
    const user = getCurrentUser();
    if (!authEls.trigger) return;
    authEls.trigger.textContent = user
      ? `Hi, ${user.name.split(" ")[0]}`
      : "Login / Register";
    authEls.trigger.setAttribute(
      "aria-label",
      user
        ? `Open account panel for ${user.name}`
        : "Open login or register dialog",
    );
  };

  const setupAuth = () => {
    authEls.trigger = qs("#authtrigger");
    authEls.modal = qs("#authmodal");
    authEls.close = qs("#authclose");
    authEls.title = qs("#authmodaltitle");
    authEls.loginTab = qs("#authtablogin");
    authEls.registerTab = qs("#authtabregister");
    authEls.loginForm = qs("#authloginform");
    authEls.registerForm = qs("#authregisterform");
    authEls.message = qs("#authmessage");
    authEls.loggedInPanel = qs("#authloggedin");
    authEls.whoAmI = qs("#authwhoami");
    authEls.whoEmail = qs("#authwhoemail");
    authEls.logout = qs("#authlogout");

    renderAuthTrigger();
    switchAuthView("login");

    authEls.trigger?.addEventListener("click", () => openAuthModal("login"));
    authEls.close?.addEventListener("click", closeAuthModal);
    authEls.loginTab?.addEventListener("click", () => switchAuthView("login"));
    authEls.registerTab?.addEventListener("click", () =>
      switchAuthView("register"),
    );
    authEls.logout?.addEventListener("click", () => {
      logoutUser();
      switchAuthView("login");
      renderAuthTrigger();
      closeAuthModal();
    });

    authEls.modal?.addEventListener("click", (e) => {
      if (e.target === authEls.modal) closeAuthModal();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && authEls.modal?.classList.contains("open"))
        closeAuthModal();
    });

    authEls.loginForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const result = loginUser({
        email: qs("#loginemail")?.value,
        password: qs("#loginpassword")?.value,
      });
      setAuthMessage(result.message, result.ok ? "success" : "error");
      if (!result.ok) return;
      renderAuthTrigger();
      switchAuthView("login");
      authEls.loginForm.reset();
      toast("Logged in successfully.");
      setTimeout(closeAuthModal, 500);
    });

    authEls.registerForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const result = registerUser({
        name: qs("#registername")?.value,
        email: qs("#registeremail")?.value,
        password: qs("#registerpassword")?.value,
        confirmPassword: qs("#registerconfirm")?.value,
      });
      setAuthMessage(result.message, result.ok ? "success" : "error");
      if (!result.ok) return;
      renderAuthTrigger();
      switchAuthView("login");
      authEls.registerForm.reset();
      toast("Account created and logged in.");
      setTimeout(closeAuthModal, 700);
    });

    window.addEventListener("luxefund_auth_changed", () => {
      renderAuthTrigger();
      switchAuthView("login");
    });

    /* Social login (demo simulation) */
    qs("#auth-google")?.addEventListener("click", () => {
      const name = "Google User";
      const email = "user@gmail.com";
      const existing = findUserByEmail(email);
      if (!existing) {
        const users = getUsers();
        const newUser = {
          id: "u_g_" + Date.now(),
          name,
          email,
          password: "__social_google__",
          provider: "google",
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        setUsers(users);
        setCurrentUser({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        });
      } else {
        setCurrentUser({
          id: existing.id,
          name: existing.name,
          email: existing.email,
        });
      }
      renderAuthTrigger();
      switchAuthView("login");
      toast("Logged in with Google.");
      setTimeout(closeAuthModal, 500);
    });

    qs("#auth-facebook")?.addEventListener("click", () => {
      const name = "Facebook User";
      const email = "user@facebook.com";
      const existing = findUserByEmail(email);
      if (!existing) {
        const users = getUsers();
        const newUser = {
          id: "u_f_" + Date.now(),
          name,
          email,
          password: "__social_facebook__",
          provider: "facebook",
          createdAt: new Date().toISOString(),
        };
        users.push(newUser);
        setUsers(users);
        setCurrentUser({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
        });
      } else {
        setCurrentUser({
          id: existing.id,
          name: existing.name,
          email: existing.email,
        });
      }
      renderAuthTrigger();
      switchAuthView("login");
      toast("Logged in with Facebook.");
      setTimeout(closeAuthModal, 500);
    });
  };

  const init = () => {
    try {
      markActiveLink();
      setupMobileNav();
      setupTheme();
      updateCartCount();
      setupAuth();
      window.addEventListener("luxefund_cart_changed", updateCartCount);
      window.addEventListener("storage", updateCartCount);
    } catch (e) {
      console.error("Initialization error:", e);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
