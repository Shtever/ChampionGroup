// app.js
// EmailJS-powered Contact Form with Live Phone Formatting

const EMAILJS_PUBLIC_KEY = "IgXpJ4MUd7u0XJxNy";    
const EMAILJS_SERVICE_ID = "service_tpyr2z9";     
const EMAILJS_TEMPLATE_ID = "template_qqy60ih";   

(function () {
  // Initialize EmailJS
  emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
})();

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("#contact form");
  if (!form) return;

  const nameEl = document.getElementById("name");
  const phoneEl = document.getElementById("phone");
  const emailEl = document.getElementById("email");
  const messageEl = document.getElementById("message");
  const submitBtn = form.querySelector('button[type="submit"]');

  // ----------------------------
  // FORMAT PHONE HELPER
  // ----------------------------
  function formatPhone(value) {
    // Remove all non-digits
    value = value.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10); // cap at 10 digits

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

  // ----------------------------
  // LIVE FORMATTING ON INPUT/PASTE
  // ----------------------------
  phoneEl.addEventListener("input", () => {
    phoneEl.value = formatPhone(phoneEl.value);
  });

  phoneEl.addEventListener("paste", (evt) => {
    evt.preventDefault();
    const pasted = (evt.clipboardData || window.clipboardData).getData("text");
    phoneEl.value = formatPhone(pasted);
  });

  // ----------------------------
  // BASIC VALIDATION HELPERS
  // ----------------------------
  const isValidEmail = (val) => /\S+@\S+\.\S+/.test(val);
  const isNonEmpty = (val) => typeof val === "string" && val.trim().length > 0;

  // ----------------------------
  // FORM SUBMIT HANDLER
  // ----------------------------
  form.addEventListener("submit", async (evt) => {
    evt.preventDefault();

    if (!isNonEmpty(nameEl.value)) { alert("Please enter your name."); nameEl.focus(); return; }
    if (!isNonEmpty(phoneEl.value)) { alert("Please enter your phone number."); phoneEl.focus(); return; }
    if (!isValidEmail(emailEl.value)) { alert("Please enter a valid email."); emailEl.focus(); return; }
    if (!isNonEmpty(messageEl.value)) { alert("Please enter a message."); messageEl.focus(); return; }

    const templateParams = {
      name: nameEl.value.trim(),
      phone: phoneEl.value.trim(),   // already formatted (xxx)xxx-xxxx
      email: emailEl.value.trim(),
      message: messageEl.value.trim(),
    };

    // UI feedback during send
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";

    try {
      await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
      alert("Your message was sent. Thank you!");
      form.reset();
    } catch (err) {
      console.error(err);
      alert("Sorry, something went wrong sending your message. Please try again.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
