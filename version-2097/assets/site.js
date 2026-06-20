(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      var nextState = !mobilePanel.classList.contains('is-open');
      mobilePanel.classList.toggle('is-open', nextState);
      document.body.classList.toggle('menu-open', nextState);
      menuButton.setAttribute('aria-expanded', String(nextState));
    });
  }

  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var heroDots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var activeHero = 0;
  var heroTimer = null;

  function setHero(index) {
    if (!heroSlides.length) {
      return;
    }

    activeHero = (index + heroSlides.length) % heroSlides.length;
    heroSlides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === activeHero);
    });
    heroDots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === activeHero);
    });
  }

  function startHero() {
    if (heroTimer) {
      window.clearInterval(heroTimer);
    }

    if (heroSlides.length > 1) {
      heroTimer = window.setInterval(function () {
        setHero(activeHero + 1);
      }, 5200);
    }
  }

  heroDots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      setHero(index);
      startHero();
    });
  });

  setHero(0);
  startHero();

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function filterCards() {
    var searchInput = document.querySelector('[data-card-search]');
    var yearSelect = document.querySelector('[data-year-filter]');
    var regionSelect = document.querySelector('[data-region-filter]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
    var empty = document.querySelector('[data-empty-state]');

    if (!cards.length) {
      return;
    }

    var keyword = normalize(searchInput && searchInput.value);
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var cardYear = card.getAttribute('data-year') || '';
      var cardRegion = card.getAttribute('data-region') || '';
      var matched = true;

      if (keyword && text.indexOf(keyword) === -1) {
        matched = false;
      }

      if (year && cardYear !== year) {
        matched = false;
      }

      if (region && cardRegion !== region) {
        matched = false;
      }

      card.style.display = matched ? '' : 'none';
      if (matched) {
        visible += 1;
      }
    });

    if (empty) {
      empty.style.display = visible ? 'none' : 'block';
    }
  }

  var cardSearch = document.querySelector('[data-card-search]');
  var yearFilter = document.querySelector('[data-year-filter]');
  var regionFilter = document.querySelector('[data-region-filter]');

  if (cardSearch || yearFilter || regionFilter) {
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');

    if (cardSearch && initialQuery) {
      cardSearch.value = initialQuery;
    }

    [cardSearch, yearFilter, regionFilter].forEach(function (control) {
      if (control) {
        control.addEventListener('input', filterCards);
        control.addEventListener('change', filterCards);
      }
    });

    filterCards();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-global-search]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input');
      var query = input ? input.value.trim() : '';
      if (query) {
        window.location.href = './search.html?q=' + encodeURIComponent(query);
      } else {
        window.location.href = './search.html';
      }
    });
  });

  var backTop = document.querySelector('[data-back-top]');

  if (backTop) {
    window.addEventListener('scroll', function () {
      backTop.classList.toggle('is-visible', window.scrollY > 360);
    });
    backTop.addEventListener('click', function () {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
})();
