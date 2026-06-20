(function () {
  function qs(selector, scope) {
    return (scope || document).querySelector(selector);
  }

  function qsa(selector, scope) {
    return Array.from((scope || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function initMobileNav() {
    var button = qs('.nav-toggle');
    var menu = qs('#mobile-menu');

    if (!button || !menu) {
      return;
    }

    button.addEventListener('click', function () {
      var isOpen = menu.classList.toggle('is-open');
      document.body.classList.toggle('is-nav-open', isOpen);
      button.setAttribute('aria-expanded', String(isOpen));
    });
  }

  function initHero() {
    var hero = qs('[data-hero]');

    if (!hero) {
      return;
    }

    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = qs('[data-hero-prev]', hero);
    var next = qs('[data-hero-next]', hero);
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }

      index = (nextIndex + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === index);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  function initFilters() {
    var searchInput = qs('#page-search');
    var yearFilter = qs('#year-filter');
    var typeFilter = qs('#type-filter');
    var cards = qsa('[data-card]');
    var countNode = qs('[data-filter-count]');

    if (!cards.length || (!searchInput && !yearFilter && !typeFilter)) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (initialQuery && searchInput) {
      searchInput.value = initialQuery;
    }

    function cardText(card) {
      return normalize([
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-type'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' '));
    }

    function filter() {
      var query = normalize(searchInput ? searchInput.value : '');
      var year = normalize(yearFilter ? yearFilter.value : '');
      var type = normalize(typeFilter ? typeFilter.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var text = cardText(card);
        var matchQuery = !query || text.indexOf(query) !== -1;
        var matchYear = !year || normalize(card.getAttribute('data-year')) === year;
        var matchType = !type || normalize(card.getAttribute('data-type')) === type;
        var shouldShow = matchQuery && matchYear && matchType;

        card.classList.toggle('is-hidden', !shouldShow);

        if (shouldShow) {
          visible += 1;
        }
      });

      if (countNode) {
        countNode.textContent = '当前显示 ' + visible + ' 部 / 共 ' + cards.length + ' 部';
      }
    }

    [searchInput, yearFilter, typeFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filter);
        control.addEventListener('change', filter);
      }
    });

    filter();
  }

  function initGlobalSearch() {
    qsa('[data-global-search]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        var input = qs('input[name="q"]', form);

        if (!input || !input.value.trim()) {
          event.preventDefault();
          window.location.href = form.getAttribute('action') || 'library.html';
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFilters();
    initGlobalSearch();
  });
}());
