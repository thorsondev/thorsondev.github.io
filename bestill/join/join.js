// Reads ?code=, shows who invited you (if the server is set up), and opens
// the app. Never puts page text into HTML: everything goes in with textContent.
(() => {
  const code = (new URLSearchParams(location.search).get("code") || "").trim().toLowerCase();
  const valid = /^[23456789abcdefghjkmnpqrstuvwxyz]{10}$/.test(code);
  const $ = (id) => document.getElementById(id);

  const show = (state) => document.body.dataset.state = state;
  if (!valid) { show("bad"); return; }

  $("code").textContent = code;
  $("open").href = `bestill://join?code=${code}`;
  $("copy-code").dataset.copy = code;
  show("ready");

  const cfg = window.BESTILL_SUPABASE || {};
  if (!cfg.url || !cfg.anonKey) return;
  fetch(`${cfg.url.replace(/\/$/, "")}/rest/v1/rpc/preview_invite`, {
    method: "POST",
    headers: { apikey: cfg.anonKey, Authorization: `Bearer ${cfg.anonKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ p_code: code }),
  })
    .then((r) => (r.ok ? r.json() : []))
    .then((rows) => {
      const g = Array.isArray(rows) ? rows[0] : null;
      if (!g) { show("bad"); return; }
      if (!g.valid) { show("expired"); return; }
      const from = String(g.owner_first_name || "").slice(0, 40);
      const name = String(g.group_name || "").slice(0, 80);
      $("title").textContent = name || "You're invited";
      $("lede").textContent = from ? `${from} invited you to read the Bible together in Be Still.` : "You're invited to read the Bible together in Be Still.";
      const n = Number(g.member_count) || 0;
      $("count").textContent = n === 1 ? "1 person so far" : `${n} people so far`;
      $("count").hidden = n < 1;
    })
    .catch(() => {});
})();
