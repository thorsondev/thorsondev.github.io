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
  // The gallery: the switch picks the device (the frame takes its true shape),
  // the tabs pick the screen, and both stay put as the other changes.
  const show = document.querySelector(".showcase");
  if (show) {
    const stage = show.querySelector(".device-stage");
    const device = show.querySelector(".device");
    const shot = show.querySelector("img.shot");
    const devices = [...show.querySelectorAll(".device-switch button")];
    const tabs = [...show.querySelectorAll(".screen-tabs button")];
    const caption = show.querySelector(".device-caption");
    // Screen proportions (width / height) of each device's screenshots.
    const shapes = { duo: 2853 / 2007, iphone: 1320 / 2868, ipad: 2064 / 2752 };
    const names = { duo: "the iPhone Duo", iphone: "iPhone", ipad: "iPad" };
    const captions = {
      library: { duo: "The Library on one page, Reading Plans on the other.", iphone: "Today's verse, your streak and the day's reflection.", ipad: "The Library beside Reading Plans." },
      reflection: { duo: "Today's verse on one page, its reflection and prayer on the other.", other: "A short reflection and prayer on today's verse, written on your device." },
      reader: { duo: "Two pages, set like a printed Bible.", other: "Scripture set like a printed Bible, with verse-by-verse listening." },
      quiet: { duo: "Today's verse beside five quiet minutes of prayer.", other: "Breathe, read the verse slowly and pray. About five minutes." },
      chat: { duo: "Bible Chat answers on one page, with the verses beside it.", other: "Questions answered from Scripture, privately, on your device." },
    };
    const alts = { library: "the Library", reflection: "Today's Reflection", reader: "the reader", quiet: "a quiet time", chat: "Bible Chat" };
    let state = { device: show.dataset.device || "duo", screen: "reflection" };
    let token = 0;

    const fit = () => {
      const pad = parseFloat(getComputedStyle(device).getPropertyValue("--pad")) || 12;
      const box = stage.getBoundingClientRect();
      const a = shapes[state.device];
      let w = box.width - 2 * pad, h = w / a;
      if (h > box.height - 2 * pad) { h = box.height - 2 * pad; w = h * a; }
      device.style.width = `${w + 2 * pad}px`;
      device.style.height = `${h + 2 * pad}px`;
    };
    const update = (focusEl) => {
      show.dataset.device = state.device;
      devices.forEach((b) => { const on = b.dataset.device === state.device; b.setAttribute("aria-checked", on); b.tabIndex = on ? 0 : -1; });
      tabs.forEach((b) => { const on = b.dataset.screen === state.screen; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; });
      const c = captions[state.screen];
      caption.textContent = c[state.device] || c.other;
      fit();
      // Fade to the new screenshot once it has loaded, so nothing flashes empty.
      const src = `img/${state.device}-${state.screen}.jpg`;
      const mine = ++token;
      shot.classList.add("swap");
      const next = new Image();
      next.onload = next.onerror = () => {
        if (mine !== token) return;
        setTimeout(() => {
          shot.src = src;
          shot.alt = `Be Still on ${names[state.device]}: ${alts[state.screen]}.`;
          shot.classList.remove("swap");
        }, 120);
      };
      next.src = src;
      focusEl?.focus();
    };
    const order = tabs.map((b) => b.dataset.screen);
    const step = (n, focus) => {
      state.screen = order[(order.indexOf(state.screen) + n + order.length) % order.length];
      update(focus ? tabs[order.indexOf(state.screen)] : null);
    };

    devices.forEach((b, i) => {
      b.addEventListener("click", () => { state.device = b.dataset.device; update(); });
      b.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (!d) return;
        e.preventDefault();
        const next = devices[(i + d + devices.length) % devices.length];
        state.device = next.dataset.device; update(next);
      });
    });
    tabs.forEach((b) => {
      b.addEventListener("click", () => { state.screen = b.dataset.screen; update(); });
      b.addEventListener("keydown", (e) => {
        const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key];
        if (d) { e.preventDefault(); step(d, true); }
      });
    });
    // Swipe the frame for the next or previous screen.
    let startX = null;
    device.addEventListener("pointerdown", (e) => { startX = e.clientX; });
    device.addEventListener("pointerup", (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX; startX = null;
      if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
    });
    device.addEventListener("pointercancel", () => { startX = null; });

    addEventListener("resize", fit);
    new ResizeObserver(fit).observe(stage);
    update();
    requestAnimationFrame(() => requestAnimationFrame(() => show.classList.add("ready")));
    // Warm the cache for the screens a visitor is likely to tap next.
    addEventListener("load", () => {
      for (const d of Object.keys(shapes)) for (const s of order) { const i = new Image(); i.src = `img/${d}-${s}.jpg`; }
    });
  }
})();
