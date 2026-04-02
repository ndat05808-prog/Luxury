(() => {
  // events.js
  // Display events, handle event signup and filters.
  "use strict";
  const { qs, storage, toast } = window.LuxeFund || {};
  if (!qs) return;
  // Attaches event listeners and renders donation data after the page has loaded.
  const EVENTS = [
    {
      id: "e001",
      title: "Workshop: Authenticity basics",
      type: "workshop",
      date: "2026-03-14",
      time: "14:00",
      location: "Campus club room",
      desc: "Educational checklist: materials, stitching, tags, receipts, serial patterns.",
    },
    {
      id: "e002",
      title: "Swap Day: Pre-loved exchange",
      type: "swap",
      date: "2026-03-15",
      time: "09:00",
      location: "Library hall",
      desc: "Bring one item, swap one item. Optional donations support the fund.",
    },
    {
      id: "e003",
      title: "Livestream: Minimal styling (capsule wardrobe)",
      type: "online",
      date: "2026-03-18",
      time: "20:30",
      location: "Online",
      desc: "Simple and practical styling tips.",
    },
    {
      id: "e004",
      title: "Charity: Closet clean-up fundraising",
      type: "charity",
      date: "2026-03-22",
      time: "10:00",
      location: "Common room",
      desc: "Donate suitable items + support student fundraising.",
    },
    {
      id: "e005",
      title: "Workshop: Basic leather care",
      type: "workshop",
      date: "2026-03-28",
      time: "15:00",
      location: "Campus club room",
      desc: "Avoid humidity, clean gently, keep shape.",
    },
    {
      id: "e006",
      title: "Online talk: Smart pre-loved shopping",
      type: "online",
      date: "2026-04-02",
      time: "19:30",
      location: "Online",
      desc: "How to inspect items and make better purchase decisions.",
    },
  ];
  // Cache DOM elements for the event list and the filter controls.
  const listEl = qs("#eventlist");
  const typeEl = qs("#etype");
  const searchEl = qs("#esearch");
  const sortEl = qs("#eSort");
  // Stores which events the user has marked as interested.
  const getInterested = () => storage.get("luxefund_events_interested", {});
  const setInterested = (obj) => storage.set("luxefund_events_interested", obj);
  // Formats an ISO date string into a readable day/month/year format.
  const fmtDate = (iso) =>
    new Date(iso + "T00:00:00").toLocaleDateString("en-GB");
  // Converts internal event type values into user-friendly labels.
  const label = (t) =>
    ({
      workshop: "Workshop",
      swap: "Swap",
      online: "Online",
      charity: "Charity",
    })[t] || "Other";
  // Converts internal event type values into user-friendly labels.
  const getView = () => {
    const type = typeEl.value;
    const q = (searchEl.value || "").trim().toLowerCase();
    const sort = sortEl.value;

    let out = EVENTS.filter((e) => {
      if (type !== "all" && e.type !== type) return false;
      if (!q) return true;
      return (e.title + " " + e.desc).toLowerCase().includes(q);
    });

    out.sort((a, b) => {
      const da = new Date(a.date);
      const db = new Date(b.date);
      return sort === "date_desc" ? db - da : da - db;
    });

    return out;
  };
  // Renders the filtered event cards into the page.
  const render = () => {
    const interested = getInterested();
    const items = getView();

    listEl.innerHTML = "";
    if (!items.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "No events match your filters.";
      listEl.appendChild(p);
      return;
    }

    items.forEach((e) => {
      const isOn = Boolean(interested[e.id]);

      const card = document.createElement("article");
      card.className = "card";
      card.innerHTML = `
        <div class="cardbody">
          <div class="rowbetween">
            <h3 class="cardtitle">${e.title}</h3>
            <span class="badge">${label(e.type)}</span>
          </div>
          <p class="cardmeta">${fmtDate(e.date)} • ${e.time} • ${e.location}</p>
          <p class="muted mt10">${e.desc}</p>
          <div class="cardactions">
            <button class="btn ${isOn ? "primary" : ""}" data-action="interest" data-id="${e.id}">
              ${isOn ? "✓ Interested" : "Interested"}
            </button>
            <a class="btn ghost" href="fundraising.html">Donate</a>
          </div>
        </div>
      `;
      listEl.appendChild(card);
    });
  }; // Handles clicks on the Interested button and updates saved user preferences.
  const onClick = (ev) => {
    const btn = ev.target.closest("button[data-action='interest']");
    if (!btn) return;

    const id = btn.getAttribute("data-id");
    const interested = getInterested();
    interested[id] = !interested[id];
    setInterested(interested);

    toast?.(interested[id] ? "Marked as interested." : "Removed interest.");
    render();
  };
  // Binds the filter controls and renders the event list after the page is ready.
  document.addEventListener("DOMContentLoaded", () => {
    typeEl.addEventListener("change", render);
    sortEl.addEventListener("change", render);
    searchEl.addEventListener("input", () => window.setTimeout(render, 80));
    listEl.addEventListener("click", onClick);
    render();
  });
})();
