(function () {
  const text = document.getElementById("text");
  const stats = document.getElementById("stats");
  const toast = document.getElementById("toast");
  const buttons = document.querySelectorAll(".actions button");
  const langSelect = document.getElementById("langSelect");
  const modeToggle = document.getElementById("modeToggle");

  if (!text) return;

  /* ---------- helpers ---------- */

  function countWords(str) {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  }

  function countLines(str) {
    return str ? str.split(/\r?\n/).length : 0;
  }

  function updateStats() {
    if (!stats) return;
    const t = text.value || "";
    stats.textContent = `Chars: ${t.length} · Words: ${countWords(t)} · Lines: ${countLines(t)}`;
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "inline-flex";
    setTimeout(() => (toast.style.display = "none"), 1200);
  }

  /* ---------- case actions ---------- */

  const actions = {
    upper: (s) => s.toUpperCase(),
    lower: (s) => s.toLowerCase(),
    sentence: (s) =>
      s
        .toLowerCase()
        .replace(/(^\s*[a-z])|([.!?]\s*[a-z])/g, (m) => m.toUpperCase()),
    capitalized: (s) =>
      s.toLowerCase().replace(/\b([a-z])/g, (m) => m.toUpperCase()),
    alternating: (s) => {
      let out = "";
      let flip = false;
      for (const ch of s) {
        if (/[a-z]/i.test(ch)) {
          out += flip ? ch.toUpperCase() : ch.toLowerCase();
          flip = !flip;
        } else {
          out += ch;
        }
      }
      return out;
    },
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const a = btn.dataset.action;

      if (a === "copy") {
        await navigator.clipboard.writeText(text.value || "");
        showToast("Copied ✓");
        return;
      }

      if (a === "clear") {
        text.value = "";
        updateStats();
        showToast("Cleared");
        return;
      }

      if (!actions[a]) return;

      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      text.value = actions[a](text.value || "");
      updateStats();
      showToast("Done");
    });
  });

  /* ---------- theme (default LIGHT) ---------- */

  const THEME_KEY = "cco_theme";

  function applyTheme(t) {
    if (t === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(THEME_KEY, t);
    modeToggle?.setAttribute("aria-checked", t === "dark");
  }

  applyTheme(localStorage.getItem(THEME_KEY) || "light");

  modeToggle?.addEventListener("click", () => {
    const isDark = document.documentElement.hasAttribute("data-theme");
    applyTheme(isDark ? "light" : "dark");
  });

// Language switch (cookie + navigate) — works for /hu/, /de/, etc.
(function () {
  const langSelect = document.getElementById("langSelect");
  if (!langSelect) return;

  // Set select based on URL (so /hu/ shows Hungarian selected)
  const path = window.location.pathname;
  const match = path.match(/^\/(hu|de|fr|es|nl|pt|pl)\//);
  const current = match ? match[1] : "en";
  langSelect.value = current;

  langSelect.addEventListener("change", () => {
    const v = langSelect.value;
    document.cookie = `cc_lang=${v}; Path=/; Max-Age=31536000; SameSite=Lax`;
    window.location.href = v === "en" ? "/" : `/${v}/`;
  });
})();
