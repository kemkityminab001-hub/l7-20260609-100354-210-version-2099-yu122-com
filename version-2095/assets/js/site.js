(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function initMobileMenu() {
        var toggle = document.querySelector("[data-mobile-toggle]");
        var menu = document.querySelector("[data-nav-menu]");
        if (!toggle || !menu) {
            return;
        }
        toggle.addEventListener("click", function () {
            menu.classList.toggle("open");
        });
    }

    function initHero() {
        var hero = document.querySelector("[data-hero]");
        if (!hero) {
            return;
        }
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var active = 0;
        var timer = null;

        function show(index) {
            active = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === active);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === active);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(active + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                show(active - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(active + 1);
                start();
            });
        }

        hero.addEventListener("mouseenter", stop);
        hero.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function initFiltering() {
        var inputs = Array.prototype.slice.call(document.querySelectorAll(".js-filter-input"));
        if (!inputs.length) {
            return;
        }

        inputs.forEach(function (input) {
            var section = input.closest("section") || document;
            var cards = Array.prototype.slice.call(section.querySelectorAll("[data-card]"));
            var empty = section.querySelector("[data-empty-state]");

            function apply() {
                var query = normalize(input.value);
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalize(card.getAttribute("data-search"));
                    var matched = !query || haystack.indexOf(query) !== -1;
                    card.style.display = matched ? "" : "none";
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("show", visible === 0);
                }
            }

            input.addEventListener("input", apply);
            apply();
        });

        Array.prototype.slice.call(document.querySelectorAll("[data-quick-filter]")).forEach(function (button) {
            button.addEventListener("click", function () {
                var section = button.closest("section") || document;
                var input = section.querySelector(".js-filter-input");
                if (!input) {
                    return;
                }
                input.value = button.getAttribute("data-quick-filter") || "";
                input.dispatchEvent(new Event("input"));
                input.focus();
            });
        });
    }

    function initSearchQuery() {
        var input = document.querySelector(".js-search-query");
        if (!input) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (query) {
            input.value = query;
            input.dispatchEvent(new Event("input"));
        }
    }

    function initImages() {
        Array.prototype.slice.call(document.querySelectorAll("img")).forEach(function (image) {
            image.addEventListener("error", function () {
                image.classList.add("is-missing");
            }, { once: true });
        });
    }

    function initBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        function toggle() {
            button.classList.toggle("show", window.scrollY > 360);
        }
        window.addEventListener("scroll", toggle, { passive: true });
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
        toggle();
    }

    function bindPlayer(streamUrl) {
        ready(function () {
            var root = document.querySelector("[data-player]");
            if (!root || !streamUrl) {
                return;
            }
            var video = root.querySelector("video");
            var overlay = root.querySelector("[data-play-overlay]");
            var started = false;
            var hls = null;

            function attach() {
                if (started || !video) {
                    return;
                }
                started = true;
                if (overlay) {
                    overlay.classList.add("is-hidden");
                }
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                    hls.loadSource(streamUrl);
                    hls.attachMedia(video);
                } else {
                    video.src = streamUrl;
                }
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {
                        if (overlay) {
                            overlay.classList.remove("is-hidden");
                        }
                        started = false;
                    });
                }
            }

            if (overlay) {
                overlay.addEventListener("click", attach);
            }
            video.addEventListener("click", function () {
                if (!started) {
                    attach();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hls) {
                    hls.destroy();
                    hls = null;
                }
            });
        });
    }

    ready(function () {
        initMobileMenu();
        initHero();
        initFiltering();
        initSearchQuery();
        initImages();
        initBackTop();
    });

    window.StaticMovie = {
        initPlayer: bindPlayer
    };
})();
