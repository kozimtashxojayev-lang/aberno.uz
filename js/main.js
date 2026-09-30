/* =========================================================
   ABERNO — umumiy skriptlar
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  initThemeToggle();
  initHeader();
  initMobileMenu();
  initActiveLink();
  initReveal();
  initCounters();
  initProgress();
  initProductFilter();
  initContactForm();
  setYear();
});

/* Yorug' / qorong'u mavzu almashtirgich.
   Boshlang'ich mavzu <head> dagi kichik skriptda qo'yiladi (sahifa miltillamasligi uchun). */
function initThemeToggle() {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;

  const root = document.documentElement;
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const current = () => root.dataset.theme || (media.matches ? "dark" : "light");

  const updateLabel = () => {
    const label = current() === "dark" ? "Yorug' rejimga o'tish" : "Qorong'u rejimga o'tish";
    btn.setAttribute("aria-label", label);
    btn.setAttribute("title", label);
  };

  btn.addEventListener("click", () => {
    const next = current() === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try {
      localStorage.setItem("aberno-theme", next);
    } catch (e) {
      /* saqlash imkoni bo'lmasa, mavzu faqat shu sahifada qoladi */
    }
    updateLabel();
  });

  media.addEventListener("change", updateLabel);
  updateLabel();
}

/* Header scroll bo'lganda soya oladi */
function initHeader() {
  const header = document.querySelector(".header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* Mobil menyu */
function initMobileMenu() {
  const burger = document.querySelector(".burger");
  const nav = document.querySelector(".nav");
  if (!burger || !nav) return;

  const close = () => {
    burger.classList.remove("is-open");
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const open = !nav.classList.contains("is-open");
    burger.classList.toggle("is-open", open);
    nav.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) close();
  });
}

/* Joriy sahifa havolasini belgilash */
function initActiveLink() {
  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a:not(.btn)").forEach((link) => {
    if (link.getAttribute("href") === page) link.classList.add("is-active");
  });
}

/* Scroll paytida elementlarni ko'rsatish */
function initReveal() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    items.forEach((el) => el.classList.add("is-visible"));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.15 }
  );
  items.forEach((el) => observer.observe(el));
}

/* Raqamlarni sanab chiqish: <span data-count="10"> */
function initCounters() {
  const counters = document.querySelectorAll("[data-count]");
  if (!counters.length) return;

  const animate = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!("IntersectionObserver" in window)) {
    counters.forEach((el) => (el.textContent = el.dataset.count));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animate(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );
  counters.forEach((el) => observer.observe(el));
}

/* Progress chiziqlari: <div class="progress__fill" data-width="40"> */
function initProgress() {
  const bars = document.querySelectorAll(".progress__fill[data-width]");
  if (!bars.length) return;

  const fill = (el) => (el.style.width = el.dataset.width + "%");

  if (!("IntersectionObserver" in window)) {
    bars.forEach(fill);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        fill(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.4 }
  );
  bars.forEach((el) => observer.observe(el));
}

/* Mahsulotlar filtri */
function initProductFilter() {
  const buttons = document.querySelectorAll(".filter");
  const products = document.querySelectorAll(".product");
  if (!buttons.length || !products.length) return;

  const apply = (category) => {
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.filter === category));
    products.forEach((p) => {
      const show = category === "all" || p.dataset.category === category;
      p.classList.toggle("is-hidden", !show);
    });
  };

  buttons.forEach((btn) => btn.addEventListener("click", () => apply(btn.dataset.filter)));

  // products.html#salfetka kabi havolalar uchun
  const applyHash = () => {
    const hash = location.hash.replace("#", "");
    if (hash && document.querySelector(`.filter[data-filter="${hash}"]`)) apply(hash);
  };
  applyHash();
  window.addEventListener("hashchange", applyHash);
}

/* Aloqa formasi validatsiyasi */
function initContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

  const success = form.querySelector(".form__success");

  const rules = {
    name: (v) => (v.trim().length >= 2 ? "" : "Ismingizni kiriting"),
    phone: (v) => (/^[+\d][\d\s()-]{8,}$/.test(v.trim()) ? "" : "Telefon raqamini to'g'ri kiriting"),
    email: (v) =>
      v.trim() === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? "" : "Email manzili noto'g'ri",
    topic: (v) => (v ? "" : "Mavzuni tanlang"),
    message: (v) => (v.trim().length >= 10 ? "" : "Xabar kamida 10 ta belgidan iborat bo'lsin"),
  };

  const validate = (input) => {
    const rule = rules[input.name];
    if (!rule) return true;
    const error = rule(input.value);
    const field = input.closest(".field");
    field.classList.toggle("has-error", Boolean(error));
    field.querySelector(".field__error").textContent = error;
    return !error;
  };

  form.querySelectorAll("input, select, textarea").forEach((input) => {
    input.addEventListener("blur", () => validate(input));
    input.addEventListener("input", () => {
      if (input.closest(".field").classList.contains("has-error")) validate(input);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const inputs = [...form.querySelectorAll("input, select, textarea")];
    const valid = inputs.map(validate).every(Boolean);
    if (!valid) return;

    // Backend ulanmaguncha so'rov faqat foydalanuvchiga tasdiq sifatida ko'rsatiladi
    success.classList.add("is-visible");
    form.reset();
    setTimeout(() => success.classList.remove("is-visible"), 6000);
  });
}

function setYear() {
  document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
}
