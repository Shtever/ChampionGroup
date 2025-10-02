// app.js
// All site JS: UI polish + EmailJS contact form (phone optional)
// ------------------------------------------------------------------
// Requires the EmailJS SDK script in index.html:
// <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js"></script>

const EMAILJS_PUBLIC_KEY = "IgXpJ4MUd7u0XJxNy";
const EMAILJS_SERVICE_ID = "service_tpyr2z9";
const EMAILJS_TEMPLATE_ID = "template_qqy60ih";

// Initialize EmailJS asap
(function () {
  if (typeof emailjs !== "undefined") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  } else {
    console.warn("EmailJS SDK not found. Make sure the script tag is in index.html.");
  }
})();

document.addEventListener("DOMContentLoaded", () => {
  // ----------------------------
  // Elements
  // ----------------------------
  const header = document.querySelector("header");
  const menuBtn = document.querySelector(".menu-btn");
  const siteNav = document.querySelector("#site-nav");
  const revealEls = [...document.querySelectorAll(".reveal")];

  // Contact form elements (may not exist on every page load)
  const form = document.querySelector("#contact form");
  const nameEl = document.getElementById("name");
  const phoneEl = document.getElementById("phone");
  const emailEl = document.getElementById("email");
  const messageEl = document.getElementById("message");
  const submitBtn = form ? form.querySelector('button[type="submit"]') : null;

  // ----------------------------
  // Toast helper
  // ----------------------------
  function showToast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    // Auto dismiss
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(8px)";
      setTimeout(() => el.remove(), 250);
    }, 2600);
  }
  // expose globally in case you want to call from elsewhere
  window.showToast = showToast;

  // ----------------------------
  // Sticky header shadow on scroll
  // ----------------------------
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) header.classList.add("is-scrolled");
      else header.classList.remove("is-scrolled");
    };
    document.addEventListener("scroll", onScroll, { passive: true });
    onScroll(); // run once
  }

  // ----------------------------
  // IntersectionObserver reveal
  // ----------------------------
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // ----------------------------
  // Mobile menu toggle
  // ----------------------------
  if (menuBtn && siteNav) {
    menuBtn.addEventListener("click", () => {
      const open = siteNav.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", open);
    });
  }

  // ----------------------------
  // Button hover "light" (ripple-ish)
  // ----------------------------
  document.addEventListener("pointermove", (e) => {
    const t = e.target;
    if (t && t.tagName === "BUTTON") {
      const r = t.getBoundingClientRect();
      t.style.setProperty("--x", e.clientX - r.left + "px");
      t.style.setProperty("--y", e.clientY - r.top + "px");
    }
  });

  // ----------------------------
  // Contact form (EmailJS) + phone formatting
  // ----------------------------
  if (form && nameEl && emailEl && messageEl && submitBtn) {
    // Phone formatting helpers (optional field)
    function formatPhone(value) {
      value = value.replace(/\D/g, "");
      if (value.length > 10) value = value.slice(0, 10); // US 10-digit cap
      let formatted = value;
      if (value.length > 6) {
        formatted = `(${value.slice(0, 3)})${value.slice(3, 6)}-${value.slice(6)}`;
      } else if (value.length > 3) {
        formatted = `(${value.slice(0, 3)})${value.slice(3)}`;
      } else if (value.length > 0) {
        formatted = `(${value}`;
      }
      return formatted;
    }

    if (phoneEl) {
      // Live format as user types
      phoneEl.addEventListener("input", () => {
        if (phoneEl.value.trim() === "") return; // optional: allow blank
        phoneEl.value = formatPhone(phoneEl.value);
      });

      // Normalize pasted content
      phoneEl.addEventListener("paste", (evt) => {
        evt.preventDefault();
        const pasted = (evt.clipboardData || window.clipboardData).getData("text");
        phoneEl.value = formatPhone(pasted);
      });
    }

    // Validation helpers
    const isValidEmail = (val) => /\S+@\S+\.\S+/.test(val);
    const isNonEmpty = (val) => typeof val === "string" && val.trim().length > 0;

    // Submit handler
    form.addEventListener("submit", async (evt) => {
      evt.preventDefault();

      if (!isNonEmpty(nameEl.value)) {
        showToast("Please enter your name.");
        nameEl.focus();
        return;
      }
      if (!isValidEmail(emailEl.value)) {
        showToast("Please enter a valid email.");
        emailEl.focus();
        return;
      }
      if (!isNonEmpty(messageEl.value)) {
        showToast("Please enter a message.");
        messageEl.focus();
        return;
      }

      const templateParams = {
        name: nameEl.value.trim(),
        phone: phoneEl ? phoneEl.value.trim() : "", // may be empty
        email: emailEl.value.trim(),
        message: messageEl.value.trim(),
      };

      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending...";

      try {
        if (typeof emailjs === "undefined") {
          throw new Error("EmailJS SDK not loaded.");
        }
        await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
        form.reset();
        showToast("Message sent. We'll reach out soon!");
      } catch (err) {
        console.error(err);
        showToast("Sorry, something went wrong. Please try again.");
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    });
  }
});
