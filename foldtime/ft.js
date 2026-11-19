// The hinge light opens up as you scroll, like the phone unfolding. Cards fade in as they arrive.
(function () {
  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function onScroll() {
    var max = Math.max(1, document.body.scrollHeight - window.innerHeight);
    var t = Math.min(1, window.scrollY / Math.min(max, 900));
    root.style.setProperty('--open', (0.2 + 0.8 * t).toFixed(3));
  }
  if (!reduce) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

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
