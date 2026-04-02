(() => {
  "use strict";

  const { qs, toast } = window.LuxeFund || {};
  if (!qs) {
    console.error("LuxeFund utilities not loaded");
    return;
  }

  // Form Elements
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

  // Email Validation Pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // HTML Escape Function (Prevent XSS)
  const escapeHtml = (text) => {
    try {
      const div = document.createElement("div");
      div.textContent = text || "";
      return div.innerHTML;
    } catch (e) {
      console.error("HTML escape error:", e);
      return "";
    }
  };

  // Input Sanitization
  const sanitizeInput = (input) => {
    if (typeof input !== "string") return "";
    return input.trim().slice(0, 1000); // Limit length
  };

  // Validation Function
  const validate = () => {
    const errors = [];
    const name = sanitizeInput(nameEl?.value ?? "");
    const email = sanitizeInput(emailEl?.value ?? "");
    const msg = sanitizeInput(msgEl?.value ?? "");

    if (name.length < 2) {
      errors.push("Name must be at least 2 characters");
    }
    if (name.length > 100) {
      errors.push("Name is too long (max 100 characters)");
    }
    if (!emailRegex.test(email)) {
      errors.push("Please enter a valid email address");
    }
    if (msg.length < 12) {
      errors.push("Message must be at least 12 characters");
    }
    if (msg.length > 600) {
      errors.push("Message must be 600 characters or less");
    }

    return errors.length ? errors.join(" | ") : "";
  };

  // Form Submission Handler
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

      // Prepare data
      const name = sanitizeInput(nameEl.value);
      const email = sanitizeInput(emailEl.value);
      const topic = topicEl?.value ?? "General";
      const msg = sanitizeInput(msgEl.value);

      // Log submission (in a real app, this would send to a server)
      console.log("Contact form submitted:", { name, email, topic });

      // Show success
      if (outEl) {
        const safeMessage = `Thank you, ${escapeHtml(name)}! We received your inquiry about "${escapeHtml(topic)}". We'll respond soon.`;
        outEl.innerHTML = safeMessage;
        outEl.className = "success";
        outEl.setAttribute("role", "status");
      }

      form.reset();
      toast?.("Message sent successfully");
    } catch (e) {
      console.error("Form submission error:", e);
      if (outEl) {
        outEl.textContent = "An error occurred. Please try again.";
        outEl.className = "error";
      }
      toast?.("Error sending message");
    }
  };

  // Add real-time validation feedback
  const addRealTimeValidation = () => {
    const fields = [nameEl, emailEl, msgEl];
    fields.forEach((field) => {
      if (field) {
        field.addEventListener("invalid", (e) => {
          e.preventDefault();
          field.setAttribute("aria-invalid", "true");
        });

        field.addEventListener("change", () => {
          try {
            field.removeAttribute("aria-invalid");
            const isEmpty = !sanitizeInput(field.value).length;
            if (!isEmpty && field.id === "cemail") {
              const isValid = emailRegex.test(field.value);
              field.setAttribute("aria-invalid", String(!isValid));
            }
          } catch (e) {
            console.error("Validation feedback error:", e);
          }
        });
      }
    });
  };

  // Initialize
  const init = () => {
    try {
      form.addEventListener("submit", onSubmit);
      addRealTimeValidation();
      console.log("Contact form initialized");
    } catch (e) {
      console.error("Contact form initialization error:", e);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
