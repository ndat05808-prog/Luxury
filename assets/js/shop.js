(() => {
  // shop.js
  // Handle product display, cart management, and checkout functionality.
  "use strict";

  const { qs, storage, formatVND, toast } = window.LuxeFund || {};
  if (!qs) return;

  // Product dataset used to generate the shop interface dynamically.
  const PRODUCTS = [
    {
      id: "p001",
      name: "Pre-loved leather bag (Classic)",
      brand: "Gucci",
      price: 8200000,
      condition: "9/10",
      size: "One size",
      impact: 0.35,
      img: "./assets/img/tuigc.jpg",
      desc: "Classic pre-loved option with strong everyday usability.",
    },
    {
      id: "p002",
      name: "Runway coat (Tailor fit)",
      brand: "Dior",
      price: 6400000,
      condition: "8/10",
      size: "M",
      impact: 0.3,
      img: "./assets/img/damdi.jpg",
      desc: "Tailored style with clean lines and premium finish.",
    },
    {
      id: "p003",
      name: "Street-lux sneakers",
      brand: "Balenciaga",
      price: 5900000,
      condition: "9/10",
      size: "42",
      impact: 0.25,
      img: "./assets/img/giaybal.jpg",
      desc: "Comfortable street-lux profile for daily wear.",
    },
    {
      id: "p004",
      name: "Accessory scarf (Silk feel)",
      brand: "Alexander McQueen",
      price: 1900000,
      condition: "10/10",
      size: "90x90cm",
      impact: 0.2,
      img: "./assets/img/khanMC.jpg",
      desc: "Compact accessory with a lightweight silk feel.",
    },

    {
      id: "p005",
      name: "Mini wallet (Monogram style)",
      brand: "Louis Vuitton",
      price: 2600000,
      condition: "9/10",
      size: "One size",
      impact: 0.22,
      img: "./assets/img/viL.jpg",
      desc: "Functional mini wallet designed for essentials.",
    },
    {
      id: "p006",
      name: "Small flap bag (Elegant)",
      brand: "Chanel",
      price: 9500000,
      condition: "8/10",
      size: "Small",
      impact: 0.18,
      img: "./assets/img/tuiCh.jpg",
      desc: "Elegant flap silhouette suitable for many outfits.",
    },
    {
      id: "p007",
      name: "Basic knit sweater",
      brand: "Prada",
      price: 3200000,
      condition: "10/10",
      size: "S",
      impact: 0.2,
      img: "./assets/img/swwt.jpg",
      desc: "Minimal product description for easy grading.",
    },
    {
      id: "p008",
      name: "Sunglasses (UV400)",
      brand: "Saint Laurent",
      price: 2100000,
      condition: "9/10",
      size: "One size",
      impact: 0.25,
      img: "./assets/img/kinhsy.jpg",
      desc: "UV400 sunglasses with a refined minimalist frame.",
    },
    {
      id: "p009",
      name: "Trench coat (Classic)",
      brand: "Burberry",
      price: 7800000,
      condition: "8/10",
      size: "M",
      impact: 0.28,
      img: "./assets/img/dl.jpg",
      desc: "Good for sustainability discussion: pre-loved reuse.",
    },
    {
      id: "p010",
      name: "Graphic tee (Minimal)",
      brand: "Givenchy",
      price: 1600000,
      condition: "10/10",
      size: "L",
      impact: 0.2,
      img: "./assets/img/aogv.jpg",
      desc: "Minimal graphic tee with an easy-to-style fit.",
    },

    {
      id: "p011",
      name: "Baguette-style bag",
      brand: "Fendi",
      price: 7200000,
      condition: "9/10",
      size: "One size",
      impact: 0.24,
      img: "./assets/img/tuifen.jpg",
      desc: "Structured baguette form with timeless styling.",
    },
    {
      id: "p012",
      name: "Leather belt (Classic buckle)",
      brand: "Versace",
      price: 2300000,
      condition: "9/10",
      size: "95",
      impact: 0.18,
      img: "./assets/img/daynitver.jpg",
      desc: "Accessories help increase checkout interactions.",
    },
    {
      id: "p013",
      name: "Minimal tote bag",
      brand: "Celine",
      price: 6800000,
      condition: "8/10",
      size: "Medium",
      impact: 0.22,
      img: "./assets/img/tuice.jpg",
      desc: "Clean design item for a professional look.",
    },
    {
      id: "p014",
      name: "Relaxed shirt",
      brand: "Loewe",
      price: 2900000,
      condition: "10/10",
      size: "M",
      impact: 0.2,
      img: "./assets/img/lov.jpg",
      desc: "Short description; easy to present.",
    },
    {
      id: "p015",
      name: "Woven-style bag",
      brand: "Bottega Veneta",
      price: 8800000,
      condition: "9/10",
      size: "Small",
      impact: 0.18,
      img: "./assets/img/tuivo.jpg",
      desc: "Woven-style texture with a modern look.",
    },

    {
      id: "p016",
      name: "Evening heels",
      brand: "Valentino",
      price: 5200000,
      condition: "8/10",
      size: "37",
      impact: 0.25,
      img: "./assets/img/giayva.jpg",
      desc: "If real: add authentication process in report.",
    },
    {
      id: "p017",
      name: "Smart blazer",
      brand: "Tom Ford",
      price: 6100000,
      condition: "9/10",
      size: "L",
      impact: 0.22,
      img: "./assets/img/braazo.jpg",
      desc: "Professional piece for a luxury community concept.",
    },
    {
      id: "p018",
      name: "Streetwear hoodie",
      brand: "Off-White",
      price: 3400000,
      condition: "9/10",
      size: "M",
      impact: 0.2,
      img: "./assets/img/hooodi.jpg",
      desc: "Good for community outfit posts.",
    },
    {
      id: "p019",
      name: "Mini crossbody bag",
      brand: "Hermès",
      price: 9900000,
      condition: "8/10",
      size: "Mini",
      impact: 0.15,
      img: "./assets/img/her.jpg",
      desc: "Compact crossbody piece with polished detailing.",
    },
    {
      id: "p020",
      name: "Minimal evening dress",
      brand: "Maison Margiela",
      price: 4300000,
      condition: "10/10",
      size: "S",
      impact: 0.2,
      img: "./assets/img/maison.jpg",
      desc: "Minimal evening design with a clean silhouette.",
    },
  ];
  // Cache DOM elements used for product listing, filters, modal, drawer, and audio feedback.
  const listEl = qs("#productlist");
  const brandEl = qs("#filterbrand");
  const condEl = qs("#filtercondition");
  const searchEl = qs("#search");
  const sortEl = qs("#sort");

  const modalBackdrop = qs("#modalbackdrop");
  const modalTitle = qs("#modaltitle");
  const modalImg = qs("#modalimg");
  const modalDesc = qs("#modaldesc");
  const modalPrice = qs("#modalprice");
  const modalBrand = qs("#modalbrand");
  const modalCond = qs("#modalcondition");
  const modalSize = qs("#modalsize");
  const modalImpact = qs("#modalimpact");
  const modalAddBtn = qs("#modaladd");

  const drawer = qs("#cartdrawer");
  const drawerOpenBtn = qs("#opencart");
  const drawerCloseBtn = qs("#closecart");
  const drawerList = qs("#cartitems");
  const drawerTotal = qs("#carttotal");
  const drawerCheckout = qs("#checkout");

  const audio = qs("#notifysound");
  let current = null;
  // Returns unique values from an array so duplicate brand options are not repeated.
  const unique = (arr) => Array.from(new Set(arr));
  // Builds the brand filter options automatically from the product dataset.
  const buildBrandOptions = () => {
    if (!brandEl) return;
    brandEl.innerHTML = `<option value="all">All</option>`;
    unique(PRODUCTS.map((p) => p.brand))
      .sort((a, b) => a.localeCompare(b))
      .forEach((b) => {
        const o = document.createElement("option");
        o.value = b;
        o.textContent = b;
        brandEl.appendChild(o);
      });
  };
  // Applies brand, condition, keyword, and sorting rules to the product list.
  const getFiltered = () => {
    const brand = brandEl?.value || "all";
    const cond = condEl?.value || "all";
    const q = (searchEl?.value || "").trim().toLowerCase();

    let out = PRODUCTS.slice();
    if (brand !== "all") out = out.filter((p) => p.brand === brand);
    if (cond !== "all") out = out.filter((p) => p.condition === cond);
    if (q)
      out = out.filter((p) =>
        (p.name + " " + p.brand).toLowerCase().includes(q),
      );

    const sort = sortEl?.value || "default";
    if (sort === "price_asc") out.sort((a, b) => a.price - b.price);
    if (sort === "price_desc") out.sort((a, b) => b.price - a.price);

    return out;
  };
  // Renders all matching products into the product grid.
  const render = () => {
    if (!listEl) return;
    const items = getFiltered();
    listEl.innerHTML = "";

    if (!items.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "No products match your filters.";
      listEl.appendChild(p);
      return;
    }

    items.forEach((p) => {
      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <img src="${p.img}" alt="Image: ${p.name}">
        <div class="cardbody">
          <h3 class="cardtitle">${p.name}</h3>
          <p class="cardmeta">${p.brand} • Condition ${p.condition} • Size ${p.size}</p>
          <div class="rowbetween mt10">
            <span class="badge">Fund ${Math.round(p.impact * 100)}%</span>
            <strong>${formatVND(p.price)}</strong>
          </div>
          <div class="cardactions">
            <button class="btn" data-action="detail" data-id="${p.id}">View details</button>
            <button class="btn primary" data-action="add" data-id="${p.id}">Add to cart</button>
          </div>
        </div>
      `;
      listEl.appendChild(card);
    });
  };

  const openModal = (p) => {
    current = p;
    modalTitle.textContent = p.name;
    modalImg.src = p.img;
    modalImg.alt = "Image: " + p.name;
    modalDesc.textContent = p.desc;
    modalPrice.textContent = formatVND(p.price);
    modalBrand.textContent = p.brand;
    modalCond.textContent = p.condition;
    modalSize.textContent = p.size;
    modalImpact.textContent = Math.round(p.impact * 100) + "%";

    modalBackdrop.classList.add("open");
    modalBackdrop.setAttribute("aria-hidden", "false");
    modalAddBtn?.focus();
  };
  // Closes the modal window and hides it from screen readers.
  const closeModal = () => {
    modalBackdrop.classList.remove("open");
    modalBackdrop.setAttribute("aria-hidden", "true");
    current = null;
  };
  // Reads and writes cart data in localStorage so the cart can persist across pages.
  const cartGet = () => storage.get("luxefund_cart", []);
  const cartSet = (cart) => storage.set("luxefund_cart", cart);
  // Adds one product to the cart or increases its quantity if it already exists.
  const cartAdd = (id) => {
    const cart = cartGet();
    const found = cart.find((x) => x.id === id);
    if (found) found.qty += 1;
    else cart.push({ id, qty: 1 });

    cartSet(cart);
    window.dispatchEvent(new Event("luxefund_cart_changed"));

    toast?.("Added to cart.");
    audio?.play().catch(() => {});
  };
  // Removes a selected product completely from the cart.
  const cartRemove = (id) => {
    cartSet(cartGet().filter((x) => x.id !== id));
    window.dispatchEvent(new Event("luxefund_cart_changed"));
  };
  // Increases or decreases the quantity of a cart item.
  const cartChangeQty = (id, delta) => {
    const cart = cartGet();
    const it = cart.find((x) => x.id === id);
    if (!it) return;
    it.qty = Math.max(1, (it.qty || 1) + delta);
    cartSet(cart);
    window.dispatchEvent(new Event("luxefund_cart_changed"));
  };
  // Calculates the cart total and the amount that will contribute to the fundraising total.
  const calcTotals = () => {
    const cart = cartGet();
    let total = 0;
    let donated = 0;

    cart.forEach((ci) => {
      const p = PRODUCTS.find((x) => x.id === ci.id);
      if (!p) return;
      const qty = ci.qty || 1;
      total += p.price * qty;
      donated += p.price * qty * p.impact;
    });

    return { total, donated };
  };
  // Renders the current cart contents inside the slide-out cart drawer.
  const renderCart = () => {
    if (!drawerList) return;

    const cart = cartGet();
    drawerList.innerHTML = "";

    if (!cart.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "Your cart is empty.";
      drawerList.appendChild(p);
    } else {
      cart.forEach((ci) => {
        const p = PRODUCTS.find((x) => x.id === ci.id);
        if (!p) return;

        const row = document.createElement("div");
        row.className = "draweritem";
        row.innerHTML = `
          <img src="${p.img}" alt="Image: ${p.name}">
          <div class="meta">
            <strong>${p.name}</strong>
            <span>${p.brand} • ${formatVND(p.price)} • Qty: ${ci.qty}</span>
          </div>
          <div class="draweractions">
            <button class="btn" data-action="qtyplus" data-id="${p.id}" aria-label="Increase">+</button>
            <button class="btn" data-action="qtyminus" data-id="${p.id}" aria-label="Decrease">−</button>
            <button class="btn ghost" data-action="remove" data-id="${p.id}" aria-label="Remove">X</button>
          </div>
        `;
        drawerList.appendChild(row);
      });
    }

    const totals = calcTotals();
    drawerTotal.textContent = formatVND(totals.total);

    const donateEl = qs("#cartdonated");
    if (donateEl) donateEl.textContent = formatVND(totals.donated);

    const badge = qs("#cartcount");
    if (badge)
      badge.textContent = String(cart.reduce((s, x) => s + (x.qty || 1), 0));
  };
  // Opens and closes the shopping cart drawer.
  const openDrawer = () => drawer?.classList.add("open");
  const closeDrawer = () => drawer?.classList.remove("open");
  // Opens and closes the shopping cart drawer.
  const checkout = () => {
    const cart = cartGet();
    if (!cart.length) {
      toast?.("Cart is empty.");
      return;
    }

    const totals = calcTotals();
    const fundAdd = Math.round(totals.donated);

    const currentTotal = storage.get("luxefund_donations_total", 0);
    storage.set("luxefund_donations_total", currentTotal + fundAdd);

    cartSet([]);
    window.dispatchEvent(new Event("luxefund_cart_changed"));
    closeDrawer();

    toast?.("Checkout complete. Added " + formatVND(fundAdd) + " to the fund.");
  };
  // Connects all user interactions such as filters, modal buttons, cart actions, and checkout.
  const bind = () => {
    buildBrandOptions();
    render();
    renderCart();

    [brandEl, condEl, sortEl].forEach((el) =>
      el?.addEventListener("change", render),
    );
    searchEl?.addEventListener("input", () => window.setTimeout(render, 80));

    listEl?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      if (action === "detail") {
        const p = PRODUCTS.find((x) => x.id === id);
        if (p) openModal(p);
      }
      if (action === "add") cartAdd(id);
    });

    qs("#modalclose")?.addEventListener("click", closeModal);
    modalBackdrop?.addEventListener("click", (e) => {
      if (e.target === modalBackdrop) closeModal();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalBackdrop?.classList.contains("open"))
        closeModal();
    });
    modalAddBtn?.addEventListener("click", () => {
      if (current) cartAdd(current.id);
      closeModal();
    });

    drawerOpenBtn?.addEventListener("click", () => {
      openDrawer();
      renderCart();
    });
    drawerCloseBtn?.addEventListener("click", closeDrawer);

    drawerList?.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-action]");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");

      if (action === "remove") cartRemove(id);
      if (action === "qtyplus") cartChangeQty(id, +1);
      if (action === "qtyminus") cartChangeQty(id, -1);
      renderCart();
    });

    drawerCheckout?.addEventListener("click", checkout);
    window.addEventListener("luxefund_cart_changed", renderCart);
  };
  // Starts the shop page logic once the HTML has fully loaded.
  document.addEventListener("DOMContentLoaded", bind);
})();
