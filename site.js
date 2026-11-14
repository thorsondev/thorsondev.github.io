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
  // The device switcher: one frame that takes each device's true shape.
  const show = document.querySelector(".showcase");
  if (show) {
    const stage = show.querySelector(".device-stage");
    const device = show.querySelector(".device");
    const buttons = [...show.querySelectorAll(".device-switch button")];
    const caption = show.querySelector(".device-caption");
    // Screen proportions (width / height) from the real screenshots.
    const shapes = { duo: 2853 / 2007, iphone: 1206 / 2622, ipad: 1668 / 2420 };
    const captions = {
      duo: "Opened like a book: the Library on one page, today's reflection on the other.",
      iphone: "Everything in one hand: today's verse, your streak and the day's reflection.",
      ipad: "Room to read: the Library and Reading Plans side by side.",
    };
    const fit = () => {
      const name = show.dataset.device;
      const pad = parseFloat(getComputedStyle(device).getPropertyValue("--pad")) || 12;
      const box = stage.getBoundingClientRect();
      const a = shapes[name];
      let w = box.width - 2 * pad, h = w / a;
      if (h > box.height - 2 * pad) { h = box.height - 2 * pad; w = h * a; }
      device.style.width = `${w + 2 * pad}px`;
      device.style.height = `${h + 2 * pad}px`;
    };
    const pick = (name, focus) => {
      show.dataset.device = name;
      buttons.forEach((b) => {
        const on = b.dataset.device === name;
        b.setAttribute("aria-checked", on);
        b.tabIndex = on ? 0 : -1;
        if (on && focus) b.focus();
      });
      caption.textContent = captions[name];
      fit();
    };
    buttons.forEach((b, i) => {
      b.addEventListener("click", () => pick(b.dataset.device));
      b.addEventListener("keydown", (e) => {
        const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!step) return;
        e.preventDefault();
        pick(buttons[(i + step + buttons.length) % buttons.length].dataset.device, true);
      });
    });
    addEventListener("resize", fit);
    new ResizeObserver(fit).observe(stage);
    fit();
  }
})();
