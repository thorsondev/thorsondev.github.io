// The hinge light opens up as you scroll, like the phone unfolding. Cards fade in as they arrive.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // Measure the page only on load/resize (reading scrollHeight on every scroll forces layout), and
  // update at most once per frame.
  var max = 1, queued = false;
  function measure() { max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight); update(); }
  function update() {
    queued = false;
    var t = Math.min(1, window.scrollY / Math.min(max, 900));
    root.style.setProperty('--open', (0.2 + 0.8 * t).toFixed(3));
  }
  if (!reduce) {
    window.addEventListener('scroll', function () { if (!queued) { queued = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', measure);
    window.addEventListener('load', measure);
    measure();
  }

  var items = document.querySelectorAll('.reveal');
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  items.forEach(function (el) { io.observe(el); });

  // A rolling odometer for the hero counter.
  var odo = document.querySelector('[data-count]');
  if (odo) {
    var target = +odo.getAttribute('data-count'), n = 0;
    var tick = setInterval(function () { n = Math.min(target, n + Math.ceil((target - n) / 8)); odo.textContent = n.toLocaleString(); if (n >= target) clearInterval(tick); }, 45);
  }
})();
