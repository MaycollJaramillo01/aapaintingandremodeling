const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function closeMenu() {
  if (!menu || !menuToggle) return;
  menu.classList.remove("is-open");
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const nextOpen = menuToggle.getAttribute("aria-expanded") !== "true";
  menu?.classList.toggle("is-open", nextOpen);
  menuToggle.setAttribute("aria-expanded", String(nextOpen));
  menuToggle.setAttribute("aria-label", nextOpen ? "Close navigation" : "Open navigation");
  document.body.classList.toggle("menu-open", nextOpen);
});

menu?.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const headerSentinel = document.querySelector(".header-sentinel");
if (header && headerSentinel) {
  const headerObserver = new IntersectionObserver(([entry]) => {
    header.classList.toggle("is-scrolled", !entry.isIntersecting);
  });
  headerObserver.observe(headerSentinel);
}

const revealItems = document.querySelectorAll(".reveal");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  revealItems.forEach((item) => observer.observe(item));
}

document.querySelector("[data-year]").textContent = new Date().getFullYear();

const estimateForm = document.querySelector("[data-estimate-form]");
const formStatus = document.querySelector("[data-form-status]");

estimateForm?.addEventListener("submit", (event) => {
  event.preventDefault();

  const fields = [...estimateForm.querySelectorAll("input, select, textarea")];
  let firstInvalid = null;

  fields.forEach((field) => {
    const invalid = !field.checkValidity();
    field.closest("label")?.classList.toggle("invalid", invalid);
    if (invalid && !firstInvalid) firstInvalid = field;
  });

  if (firstInvalid) {
    formStatus.textContent = "Please review the highlighted fields.";
    firstInvalid.focus();
    return;
  }

  const data = new FormData(estimateForm);
  const subject = encodeURIComponent(`Estimate request from ${data.get("name")}`);
  const body = encodeURIComponent(
    `Name: ${data.get("name")}\nEmail: ${data.get("email")}\nService: ${data.get("service")}\n\nProject details:\n${data.get("details")}`
  );

  formStatus.textContent = "Your request is ready. Choose your email app to send it.";
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
});

estimateForm?.querySelectorAll("input, select, textarea").forEach((field) => {
  field.addEventListener("input", () => {
    if (field.checkValidity()) field.closest("label")?.classList.remove("invalid");
  });
});
