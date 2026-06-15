const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function initMobileNavigation() {
  const toggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (!toggle || !nav) {
    return;
  }

  const closeMenu = () => {
    toggle.classList.remove("is-open");
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Открыть меню");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.classList.toggle("is-open");
    nav.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Закрыть меню" : "Открыть меню");
  });

  nav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });
}

function initSlider() {
  const slider = document.querySelector("[data-slider]");

  if (!slider) {
    return;
  }

  const slides = Array.from(slider.querySelectorAll("[data-slide]"));
  const prevButton = slider.querySelector("[data-slider-prev]");
  const nextButton = slider.querySelector("[data-slider-next]");
  let currentIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
  let timerId = null;

  if (slides.length < 2) {
    return;
  }

  const showSlide = (nextIndex) => {
    slides[currentIndex].classList.remove("is-active");
    currentIndex = (nextIndex + slides.length) % slides.length;
    slides[currentIndex].classList.add("is-active");
  };

  const restartAutoplay = () => {
    if (prefersReducedMotion) {
      return;
    }

    window.clearInterval(timerId);
    timerId = window.setInterval(() => {
      showSlide(currentIndex + 1);
    }, 6500);
  };

  prevButton?.addEventListener("click", () => {
    showSlide(currentIndex - 1);
    restartAutoplay();
  });

  nextButton?.addEventListener("click", () => {
    showSlide(currentIndex + 1);
    restartAutoplay();
  });

  slider.addEventListener("mouseenter", () => window.clearInterval(timerId));
  slider.addEventListener("mouseleave", restartAutoplay);
  restartAutoplay();
}

function initServiceFilters() {
  const tabs = document.querySelector("[data-service-tabs]");
  const servicesGrid = document.querySelector("[data-services-grid]");

  if (!tabs || !servicesGrid) {
    return;
  }

  const buttons = Array.from(tabs.querySelectorAll("[data-service-filter]"));
  const cards = Array.from(servicesGrid.querySelectorAll("[data-service-category]"));

  tabs.addEventListener("click", (event) => {
    const button = event.target.closest("[data-service-filter]");

    if (!button) {
      return;
    }

    const filter = button.dataset.serviceFilter;

    buttons.forEach((item) => {
      item.setAttribute("aria-selected", String(item === button));
    });

    cards.forEach((card) => {
      const shouldShow = filter === "all" || card.dataset.serviceCategory === filter;
      card.classList.toggle("is-hidden", !shouldShow);
    });
  });
}

function initContactForm() {
  const form = document.querySelector("[data-contact-form]");

  if (!form) {
    return;
  }

  const status = form.querySelector("[data-form-status]");

  const messages = {
    name: "Введите имя не короче двух символов.",
    phone: "Введите телефон в формате +7 999 123-45-67.",
    service: "Выберите услугу или консультацию.",
    consent: "Нужно согласие на обработку данных."
  };

  const validators = {
    name: (field) => field.value.trim().length >= 2,
    phone: (field) => /^\+?\d[\d\s()-]{8,}$/.test(field.value.trim()),
    service: (field) => field.value.trim() !== "",
    consent: (field) => field.checked
  };

  const setError = (name, message = "") => {
    const error = form.querySelector(`[data-error-for="${name}"]`);
    const field = form.elements[name];

    if (error) {
      error.textContent = message;
    }

    if (field) {
      field.setAttribute("aria-invalid", String(Boolean(message)));
    }
  };

  const validateField = (name) => {
    const field = form.elements[name];

    if (!field || !validators[name]) {
      return true;
    }

    const isValid = validators[name](field);
    setError(name, isValid ? "" : messages[name]);
    return isValid;
  };

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];

    if (!field) {
      return;
    }

    const eventName = field.type === "checkbox" || field.tagName === "SELECT" ? "change" : "input";
    field.addEventListener(eventName, () => {
      validateField(name);
      status.textContent = "";
      status.classList.remove("is-success");
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const isFormValid = Object.keys(validators).every(validateField);

    if (!isFormValid) {
      status.textContent = "Проверьте поля формы и попробуйте еще раз.";
      status.classList.remove("is-success");
      return;
    }

    status.textContent = "Спасибо! Заявка подготовлена. Мы свяжемся с вами в ближайшее время.";
    status.classList.add("is-success");
    form.reset();
  });
}

function initRevealAnimations() {
  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));

  if (!revealItems.length) {
    return;
  }

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.18,
    rootMargin: "0px 0px -8% 0px"
  });

  revealItems.forEach((item) => observer.observe(item));
}

function initParallaxImages() {
  const frames = Array.from(document.querySelectorAll("[data-parallax]"));

  if (!frames.length || prefersReducedMotion) {
    return;
  }

  let ticking = false;

  const update = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    frames.forEach((frame) => {
      const rect = frame.getBoundingClientRect();

      if (rect.bottom < 0 || rect.top > viewportHeight) {
        return;
      }

      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      const offset = (clamped - 0.5) * -54;
      frame.style.setProperty("--parallax-y", `${offset}px`);
    });

    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
}

function initLayeredMotion() {
  const sections = Array.from(document.querySelectorAll(".layered-section"));

  if (!sections.length || prefersReducedMotion) {
    return;
  }

  let ticking = false;

  const update = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    sections.forEach((section) => {
      const rect = section.getBoundingClientRect();
      const progress = (viewportHeight - rect.top) / (viewportHeight + rect.height);
      const clamped = Math.min(1, Math.max(0, progress));
      section.style.setProperty("--layer-progress", clamped.toFixed(3));
    });

    ticking = false;
  };

  const requestUpdate = () => {
    if (!ticking) {
      window.requestAnimationFrame(update);
      ticking = true;
    }
  };

  window.addEventListener("scroll", requestUpdate, { passive: true });
  window.addEventListener("resize", requestUpdate);
  requestUpdate();
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.classList.add("is-ready");
  initMobileNavigation();
  initSlider();
  initServiceFilters();
  initContactForm();
  initRevealAnimations();
  initParallaxImages();
  initLayeredMotion();
});
