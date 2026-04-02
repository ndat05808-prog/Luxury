(() => {
  "use strict";

  const { qs, toast } = window.LuxeFund || {};
  if (!qs) {
    console.error("LuxeFund utilities not loaded");
    return;
  }

  // Cache form elements
  const form = qs("#contactform");
  const nameEl = qs("#cname");
  const emailEl = qs("#cemail");
  const topicEl = qs("#ctopic");
  const msgEl = qs("#cmessage");
  const outEl = qs("#contactresult");

  if (!form) {
    console.warn("Contact form not found");
    return;
  }

  // Enhanced email validation
  const isValidEmail = (email) => {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$$/;
    return pattern.test(email) && email.length <= 254;
  };

  // HTML sanitization to prevent XSS
  const escapeHtml = (text) => {
    if (typeof text !== "string") return "";
    const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
    return text.replace(/[&<>"'"'"']/g, (char) => map[char]);
  };

  // Input sanitization
  const sanitizeInput = (input) => {
    if (typeof input !== "string") return "";
    return input.trim().slice(0, 1000);
  };

  // Form validation
  const validate = () => {
    const errors = [];
    const name = sanitizeInput(nameEl?.value ?? "");
    const email = sanitizeInput(emailEl?.value ?? "");
    const msg = sanitizeInput(msgEl?.value ?? "");

    if (name.length < 2) errors.push("Name must be at least 2 characters");
    if (name.length > 100) errors.push("Name is too long");
    if (!isValidEmail(email)) errors.push("Please enter a valid email address");
    if (msg.length < 12) errors.push("Message must be at least 12 characters");
    if (msg.length > 600) errors.push("Message is too long");

    return errors.length ? errors.join(" • ") : "";
  };

  // Form submission
  const onSubmit = (e) => {
    e.preventDefault();
    try {
      if (outEl) {
        outEl.textContent = "";
        outEl.className = "help";
      }

      const problem = validate();
      if (problem) {
        if (outEl) {
          outEl.textContent = problem;
          outEl.className = "error";
          outEl.setAttribute("role", "alert");
        }
        toast?.("Please check the form");
        return;
      }

      const name = sanitizeInput(nameEl.value);
      const email = sanitizeInput(emailEl.value);
      const topic = topicEl?.value ?? "General";
      const msg = sanitizeInput(msgEl.value);

      console.log("Form submitted:", { name, email, topic });

      if (outEl) {
        outEl.innerHTML = `Thank you, $${escapeHtml(name)}! We received your inquiry about "$${escapeHtml(topic)}". We'"'"'ll respond soon.`;
        outEl.className = "success";
        outEl.setAttribute("role", "status");
      }

      form.reset();
      toast?.("Message sent successfully");
    } catch (e) {
      console.error("Form submission error:", e.message);
      if (outEl) {
        outEl.textContent = "An error occurred. Please try again.";
        outEl.className = "error";
      }
      toast?.("Error sending message");
    }
  };

  // Real-time validation
  const setupValidation = () => {
    [nameEl, emailEl, msgEl].forEach((field) => {
      if (field) {
        field.addEventListener("blur", () => {
          try {
            const value = sanitizeInput(field.value);
            const hasError = field.id === "cemail" ? value && !isValidEmail(value) : false;
            field.setAttribute("aria-invalid", String(hasError));
          } catch (e) {
            console.debug("Validation error");
          }
        });
      }
    });
  };

  // Initialize
  const init = () => {
    try {
      form.addEventListener("submit", onSubmit);
      setupValidation();
    } catch (e) {
      console.error("Contact form init error:", e.message);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();