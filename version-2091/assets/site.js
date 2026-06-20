(function () {
  var header = document.querySelector('[data-site-header]');
  var toggle = document.querySelector('[data-mobile-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  function updateHeader() {
    if (!header) {
      return;
    }
    if (window.scrollY > 50) {
      header.classList.add('is-scrolled');
    } else {
      header.classList.remove('is-scrolled');
    }
  }

  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-site-search]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = './search.html';
      if (query) {
        target += '?q=' + encodeURIComponent(query);
      }
      window.location.href = target;
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var active = 0;

    function show(index) {
      active = index;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('opacity-100', slideIndex === active);
        slide.classList.toggle('opacity-0', slideIndex !== active);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('bg-cyan-400', dotIndex === active);
        dot.classList.toggle('w-8', dotIndex === active);
        dot.classList.toggle('bg-gray-500', dotIndex !== active);
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        show((active + 1) % slides.length);
      }, 5000);
    }
  });

  function filterCards(scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var category = scope.querySelector('[data-filter-category]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
    var empty = scope.querySelector('[data-no-results]');
    var query = input ? input.value.trim().toLowerCase() : '';
    var selectedYear = year ? year.value : '';
    var selectedCategory = category ? category.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var text = card.getAttribute('data-search') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var cardCategory = card.getAttribute('data-category') || '';
      var matchesQuery = !query || text.indexOf(query) !== -1;
      var matchesYear = !selectedYear || cardYear === selectedYear;
      var matchesCategory = !selectedCategory || cardCategory === selectedCategory;
      var isVisible = matchesQuery && matchesYear && matchesCategory;
      card.style.display = isVisible ? '' : 'none';
      if (isVisible) {
        visible += 1;
      }
    });

    if (empty) {
      empty.classList.toggle('is-visible', visible === 0);
    }
  }

  document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
    var input = scope.querySelector('[data-filter-input]');
    var year = scope.querySelector('[data-filter-year]');
    var category = scope.querySelector('[data-filter-category]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';

    if (input && query) {
      input.value = query;
    }

    [input, year, category].forEach(function (control) {
      if (control) {
        control.addEventListener('input', function () {
          filterCards(scope);
        });
        control.addEventListener('change', function () {
          filterCards(scope);
        });
      }
    });

    filterCards(scope);
  });
})();

function initMoviePlayer(sourceUrl) {
  var video = document.querySelector('[data-player-video]');
  var overlay = document.querySelector('[data-player-overlay]');
  if (!video || !sourceUrl) {
    return;
  }

  var attached = false;
  var wantsPlay = false;
  var hlsInstance = null;

  function requestPlay() {
    var result = video.play();
    if (result && typeof result.catch === 'function') {
      result.catch(function () {
        if (overlay) {
          overlay.classList.remove('is-hidden');
        }
      });
    }
  }

  function attachMedia() {
    if (attached) {
      return;
    }
    attached = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = sourceUrl;
      video.load();
      if (wantsPlay) {
        requestPlay();
      }
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(sourceUrl);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (wantsPlay) {
          requestPlay();
        }
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (!data || !data.fatal) {
          return;
        }
        if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
          hlsInstance.startLoad();
        } else if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
          hlsInstance.recoverMediaError();
        } else {
          hlsInstance.destroy();
        }
      });
      return;
    }

    video.src = sourceUrl;
    video.load();
    if (wantsPlay) {
      requestPlay();
    }
  }

  function startPlayback() {
    wantsPlay = true;
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
    attachMedia();
    requestPlay();
  }

  if (overlay) {
    overlay.addEventListener('click', startPlayback);
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    if (overlay) {
      overlay.classList.add('is-hidden');
    }
  });

  video.addEventListener('pause', function () {
    if (overlay) {
      overlay.classList.remove('is-hidden');
    }
  });

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
}
