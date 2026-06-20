(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-main-nav]');

    if (menuButton && nav) {
        menuButton.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('[data-hero]').forEach(function (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === index);
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
    });

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function bindSearch(input) {
        var scope = document.querySelector('[data-card-scope]');
        var cards = scope ? Array.prototype.slice.call(scope.querySelectorAll('[data-search]')) : [];

        function apply() {
            var keyword = normalize(input.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute('data-search'));
                card.hidden = keyword.length > 0 && text.indexOf(keyword) === -1;
            });
        }

        input.addEventListener('input', apply);
        apply();
    }

    var urlParams = new URLSearchParams(window.location.search);
    var keyword = urlParams.get('q') || '';
    var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-card-search]'));

    searchInputs.forEach(function (input) {
        if (keyword && !input.value) {
            input.value = keyword;
        }
        bindSearch(input);
    });
})();
