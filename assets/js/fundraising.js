(() => {
  // fundraising.js
  // Handle donation form, progress tracking, and donor list display.
  "use strict";
  const { qs, storage, formatVND, toast } = window.LuxeFund || {};
  if (!qs) return;
  // Target fundraising amount used to calculate and display progress.
  const GOAL = 50000000;
  // Target fundraising amount used to calculate and display progress.
  const totalEl = qs("#raisedtotal");
  const goalEl = qs("#goal");
  const barEl = qs("#progressbar");
  const pctEl = qs("#progresspct");
  const listEl = qs("#donorlist");

  const form = qs("#donateform");
  const nameEl = qs("#donorname");
  const amountEl = qs("#donateamount");
  const msgEl = qs("#donormsg");
  const errEl = qs("#donateerror");
  // Reads and writes donation totals from localStorage.
  const getTotal = () =>
    Number(storage.get("luxefund_donations_total", 0) || 0);
  const setTotal = (n) =>
    storage.set("luxefund_donations_total", Number(n || 0));
  // Reads and writes the recent donor list from localStorage.
  const getDonors = () => storage.get("luxefund_donors", []);
  const setDonors = (arr) => storage.set("luxefund_donors", arr);
  // Updates the total raised, goal, progress bar, percentage, and recent donor cards.
  const render = () => {
    const total = getTotal();
    totalEl.textContent = formatVND(total);
    goalEl.textContent = formatVND(GOAL);

    const pct = Math.min(100, Math.round((total / GOAL) * 100));
    barEl.style.width = pct + "%";
    pctEl.textContent = pct + "%";

    const donors = getDonors();
    listEl.innerHTML = "";

    if (!donors.length) {
      const p = document.createElement("p");
      p.className = "muted";
      p.textContent = "No donations yet. Be the first!";
      listEl.appendChild(p);
      return;
    }

    donors.slice(0, 6).forEach((d) => {
      const row = document.createElement("div");
      row.className = "card";
      row.innerHTML = `
        <div class="cardbody">
          <h3 class="cardtitle">${d.name}</h3>
          <p class="cardmeta">${formatVND(d.amount)} • ${d.when}</p>
          <p class="muted mt10">${d.msg ? d.msg : "No message."}</p>
        </div>
      `;
      listEl.appendChild(row);
    });
  };
  // Checks that the donor form contains a valid name and donation amount.
  const validate = () => {
    errEl.textContent = "";
    const name = (nameEl.value || "").trim();
    const amount = Number(amountEl.value || 0);

    if (name.length < 2) return "Please enter a name (min 2 characters).";
    if (!Number.isFinite(amount) || amount < 10000)
      return "Minimum donation is 10,000₫.";
    if (amount > 50000000) return "Maximum amount is 50,000,000₫.";
    return "";
  };
  // Handles donation form submission, saves the new donation, and refreshes the page data.
  const onSubmit = (e) => {
    e.preventDefault();
    const problem = validate();
    if (problem) {
      errEl.textContent = problem;
      toast?.("Please fix the form.");
      return;
    }

    const name = (nameEl.value || "").trim();
    const amount = Number(amountEl.value || 0);
    const msg = (msgEl.value || "").trim();

    setTotal(getTotal() + amount);

    const donors = getDonors();
    donors.unshift({
      name,
      amount,
      msg,
      when: new Date().toLocaleString("en-GB"),
    });
    setDonors(donors);

    form.reset();
    toast?.("Thank you! Donation received: " + formatVND(amount));
    render();
  };
  // Attaches event listeners and renders donation data after the page has loaded.
  document.addEventListener("DOMContentLoaded", () => {
    form.addEventListener("submit", onSubmit);
    render();

    window.addEventListener("storage", render);
  });
})();
