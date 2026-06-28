/* factotum — contact form: client-side validation + submit
   Submission target: set the <form action> to your Formspree endpoint
   (https://formspree.io) — no backend required. Until then, the form runs
   in DEMO mode and just shows the success state without sending.            */
(function () {
  "use strict";

  var form = document.getElementById("contactForm");
  if (!form) return;

  var statusEl = document.getElementById("formStatus");

  function setFieldError(field, hasError) {
    var wrap = field.closest(".field");
    if (wrap) wrap.classList.toggle("invalid", hasError);
  }

  function showStatus(type, message) {
    statusEl.className = "form-status show " + type;
    statusEl.textContent = message;
    statusEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function validate() {
    var ok = true;
    var required = form.querySelectorAll("[required]");
    required.forEach(function (field) {
      var valid = field.value.trim() !== "";
      if (field.type === "email") {
        valid = valid && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(field.value.trim());
      }
      setFieldError(field, !valid);
      if (!valid) ok = false;
    });
    return ok;
  }

  /* live-clear errors as the user types */
  form.addEventListener("input", function (e) {
    if (e.target.closest(".field.invalid")) setFieldError(e.target, false);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.className = "form-status";

    if (!validate()) {
      showStatus("fail", "Please fill in the highlighted fields.");
      return;
    }

    var action = form.getAttribute("action");
    var demoMode = !action || action.indexOf("formspree") === -1;

    if (demoMode) {
      // No live endpoint configured yet — confirm without sending.
      showStatus("success", "Thanks! Your message has been noted. (Demo mode — connect Formspree to receive enquiries by email.)");
      form.reset();
      return;
    }

    var submitBtn = form.querySelector("[type=submit]");
    submitBtn.disabled = true;
    submitBtn.textContent = "sending…";

    fetch(action, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" }
    })
      .then(function (res) {
        if (res.ok) {
          showStatus("success", "Thank you! We'll be in touch very soon.");
          form.reset();
        } else {
          showStatus("fail", "Something went wrong. Please email us directly at hello@factotum.lab.");
        }
      })
      .catch(function () {
        showStatus("fail", "Network error. Please email us directly at hello@factotum.lab.");
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "send enquiry";
      });
  });
})();
