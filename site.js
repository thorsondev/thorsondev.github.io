// Stars for every night sky on the page, drawn once and gently twinkling
// (still when the reader prefers reduced motion). Plus the email copy buttons.
(() => {
  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const skies = [...document.querySelectorAll("canvas.stars")];
  const fields = skies.map((canvas) => {
    const ctx = canvas.getContext("2d");
    const stars = [];
    const size = () => {
      const r = canvas.getBoundingClientRect();
      const dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars.length = 0;
      const count = Math.round((r.width * r.height) / 2600);
      for (let i = 0; i < count; i++) {
        // Fewer stars toward the glowing horizon.
        const y = Math.pow(Math.random(), 1.6) * r.height * 0.85;
        stars.push({ x: Math.random() * r.width, y, r: Math.random() * 1.1 + 0.3, p: Math.random() * Math.PI * 2, s: 0.4 + Math.random() * 1.2 });
      }
      return r;
    };
    let box = size();
    addEventListener("resize", () => { box = size(); draw(performance.now()); });
    const draw = (t) => {
      ctx.clearRect(0, 0, box.width, box.height);
      for (const s of stars) {
        const a = still ? 0.75 : 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(t / 1000 * s.s + s.p));
        ctx.globalAlpha = a * (1 - s.y / box.height * 0.6);
        ctx.fillStyle = "#fff8ec";
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2); ctx.fill();
      }
    };
    draw(0);
    return draw;
  });
  if (!still && fields.length) {
    const loop = (t) => { fields.forEach((d) => d(t)); requestAnimationFrame(loop); };
    requestAnimationFrame(loop);
  }

  document.querySelectorAll("[data-copy]").forEach((b) => {
    b.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Copied"; }
      catch { const r = document.createRange(); r.selectNodeContents(document.querySelector(b.dataset.select)); getSelection().removeAllRanges(); getSelection().addRange(r); }
      setTimeout(() => (b.textContent = "Copy"), 1800);
    });
  });
  // The gallery: the switch shows that device's row of screens.
  const gallery = document.querySelector(".gallery");
  if (gallery) {
    const devices = [...gallery.querySelectorAll(".device-switch button")];
    const strips = [...gallery.querySelectorAll(".strip")];
    const [prev, next] = gallery.querySelectorAll(".strip-nav .round");
    const current = () => strips.find((s) => !s.hidden);
    const dots = [...gallery.querySelectorAll(".strip-dots span")];
    const updateNav = () => {
      const s = current(); if (!s) return;
      // Which screen is in view, for the dots under the row.
      const figs = [...s.querySelectorAll("figure")];
      const left = s.getBoundingClientRect().left;
      let at = 0, best = Infinity;
      const mid = left + s.clientWidth / 2;
      figs.forEach((f, i) => { const r = f.getBoundingClientRect(); const d = Math.abs(r.left + r.width / 2 - mid); if (d < best) { best = d; at = i; } });
      if (s.scrollLeft + s.clientWidth > s.scrollWidth - 8) at = figs.length - 1;
      dots.forEach((d, i) => d.classList.toggle("on", i === at));
      if (!prev) return;
      prev.disabled = s.scrollLeft < 8;
      next.disabled = s.scrollLeft + s.clientWidth > s.scrollWidth - 8;
    };
    // Pad each row so its first and last screens can sit in the middle.
    const center = () => {
      const s = current(); if (!s) return;
      const fig = s.querySelector("figure");
      const pad = Math.max(16, (s.clientWidth - fig.getBoundingClientRect().width) / 2);
      s.style.paddingInline = `${pad}px`;
      s.style.scrollPaddingInline = `${pad}px`;
    };
    const pick = (name, focus) => {
      gallery.dataset.device = name;
      devices.forEach((b) => { const on = b.dataset.device === name; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; if (on && focus) b.focus(); });
      strips.forEach((s) => { s.hidden = s.dataset.for !== name; });
      center();
      const s = current(); s.style.scrollBehavior = "auto"; s.scrollLeft = 0; s.style.scrollBehavior = "";
      updateNav();
    };
    devices.forEach((b, i) => {
      b.addEventListener("click", () => pick(b.dataset.device));
      b.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        pick(devices[(i + d + devices.length) % devices.length].dataset.device, true);
      });
    });
    [prev, next].forEach((b) => b?.addEventListener("click", () => {
      const s = current(), fig = s.querySelector("figure");
      s.scrollBy({ left: Number(b.dataset.step) * (fig.getBoundingClientRect().width + 28), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    }));
    strips.forEach((s) => s.addEventListener("scroll", updateNav, { passive: true }));
    addEventListener("resize", () => { center(); updateNav(); });
    // Images set the frames' widths: center once they're in.
    strips.forEach((s) => s.querySelectorAll("img").forEach((i) => i.addEventListener("load", () => { if (!s.hidden) { center(); updateNav(); } })));
    center();
    updateNav();
    // Once the page is up, fetch the other devices' screens so switching is instant.
    addEventListener("load", () => gallery.querySelectorAll("img[loading=lazy]").forEach((i) => { i.loading = "eager"; }));
  }
})();
