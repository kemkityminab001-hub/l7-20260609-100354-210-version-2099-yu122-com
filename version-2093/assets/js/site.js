(function () {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");

  function updateHeader() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 40);
  }

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (toggle) {
    toggle.addEventListener("click", function () {
      document.body.classList.toggle("nav-open");
    });
  }

  document.querySelectorAll(".mobile-nav-link").forEach(function (link) {
    link.addEventListener("click", function () {
      document.body.classList.remove("nav-open");
    });
  });

  const hero = document.querySelector("[data-hero-carousel]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll(".hero-slide"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let current = 0;
    let timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        restart();
      });
    }

    restart();
  }

  const listingState = new Map();

  function getState(target) {
    if (!listingState.has(target)) {
      listingState.set(target, { query: "", filter: "全部" });
    }
    return listingState.get(target);
  }

  function applyListing(target) {
    const container = document.querySelector(target);
    if (!container) {
      return;
    }
    const state = getState(target);
    const query = state.query.trim().toLowerCase();
    const filter = state.filter;
    const cards = Array.from(container.querySelectorAll("[data-search]"));
    let count = 0;

    cards.forEach(function (card) {
      const searchText = (card.getAttribute("data-search") || "").toLowerCase();
      const filterText = card.getAttribute("data-filter") || "";
      const queryOk = !query || searchText.indexOf(query) !== -1;
      const filterOk = filter === "全部" || filterText.indexOf(filter) !== -1;
      const visible = queryOk && filterOk;
      card.classList.toggle("is-hidden-card", !visible);
      if (visible) {
        count += 1;
      }
    });

    document.querySelectorAll('[data-result-count="' + target + '"]').forEach(function (node) {
      node.textContent = "当前显示 " + count + " 项";
    });
  }

  document.querySelectorAll("[data-card-search]").forEach(function (input) {
    const target = input.getAttribute("data-card-search");
    const params = new URLSearchParams(window.location.search);
    const initial = params.get("q");
    if (initial && target === "#search-results") {
      input.value = initial;
    }
    getState(target).query = input.value;
    applyListing(target);
    input.addEventListener("input", function () {
      getState(target).query = input.value;
      applyListing(target);
    });
  });

  document.querySelectorAll("[data-filter-button]").forEach(function (button) {
    button.addEventListener("click", function () {
      const target = button.getAttribute("data-filter-target");
      const filter = button.getAttribute("data-filter-button") || "全部";
      getState(target).filter = filter;
      document.querySelectorAll('[data-filter-target="' + target + '"]').forEach(function (item) {
        item.classList.toggle("is-active", item === button);
      });
      applyListing(target);
    });
  });
})();
