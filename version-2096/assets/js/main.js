(function () {
    var navToggle = document.querySelector('[data-nav-toggle]');
    var siteNav = document.querySelector('[data-site-nav]');
    var navSearch = document.querySelector('.nav-search');

    if (navToggle && siteNav && navSearch) {
        navToggle.addEventListener('click', function () {
            siteNav.classList.toggle('is-open');
            navSearch.classList.toggle('is-open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var currentSlide = 0;
    var slideTimer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === currentSlide);
        });
    }

    function startSlider() {
        if (slides.length < 2) {
            return;
        }
        slideTimer = window.setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            if (slideTimer) {
                window.clearInterval(slideTimer);
            }
            showSlide(index);
            startSlider();
        });
    });

    showSlide(0);
    startSlider();

    var forms = Array.prototype.slice.call(document.querySelectorAll('[data-site-search]'));

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, '');
    }

    function applyFilters(form) {
        var scope = document.querySelector('[data-search-scope]');
        var queryInput = form.querySelector('input[name="q"]');
        var yearSelect = document.querySelector('[data-year-filter]');
        var typeSelect = document.querySelector('[data-type-filter]');
        var query = normalize(queryInput ? queryInput.value : '');
        var year = yearSelect ? yearSelect.value : '';
        var type = typeSelect ? typeSelect.value : '';

        if (!scope) {
            if (query) {
                window.location.href = './ranking.html?q=' + encodeURIComponent(queryInput.value);
            } else if (form.classList.contains('nav-search')) {
                window.location.href = './ranking.html';
            }
            return;
        }

        var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));
        var visible = 0;
        cards.forEach(function (card) {
            var text = normalize(card.getAttribute('data-search'));
            var cardYear = card.getAttribute('data-year') || '';
            var cardType = card.getAttribute('data-type') || '';
            var matchQuery = !query || text.indexOf(query) !== -1;
            var matchYear = !year || cardYear === year;
            var matchType = !type || cardType === type;
            var isVisible = matchQuery && matchYear && matchType;
            card.style.display = isVisible ? '' : 'none';
            if (isVisible) {
                visible += 1;
            }
        });

        var state = document.querySelector('[data-search-state]');
        if (state) {
            state.textContent = visible ? '' : '未找到相关影片';
        }
    }

    forms.forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            applyFilters(form);
        });
    });

    var yearSelect = document.querySelector('[data-year-filter]');
    var typeSelect = document.querySelector('[data-type-filter]');
    [yearSelect, typeSelect].forEach(function (select) {
        if (select) {
            select.addEventListener('change', function () {
                var filterForm = document.querySelector('.filter-form');
                if (filterForm) {
                    applyFilters(filterForm);
                }
            });
        }
    });

    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get('q');
    if (initialQuery) {
        var filterForm = document.querySelector('.filter-form');
        var input = filterForm ? filterForm.querySelector('input[name="q"]') : null;
        if (input) {
            input.value = initialQuery;
            applyFilters(filterForm);
        }
    }
})();
