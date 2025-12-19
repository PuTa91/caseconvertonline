document.addEventListener("DOMContentLoaded", () => {

  /* ===============================
     CASE CONVERTER TOOL
     =============================== */

  const text = document.getElementById("text");
  const stats = document.getElementById("stats");
  const toast = document.getElementById("toast");
  const actionButtons = document.querySelectorAll(".actions button");

  function countWords(str) {
    return str.trim() ? str.trim().split(/\s+/).length : 0;
  }

  function countLines(str) {
    return str ? str.split(/\r?\n/).length : 0;
  }

  function updateStats() {
    if (!text || !stats) return;
    const t = text.value || "";
    stats.textContent = `Chars: ${t.length} · Words: ${countWords(t)} · Lines: ${countLines(t)}`;
  }

  function showToast(msg) {
    if (!toast) return;
    toast.textContent = msg;
    toast.style.display = "inline-flex";
    setTimeout(() => (toast.style.display = "none"), 1200);
  }

  const actions = {
    upper: s => s.toUpperCase(),
    lower: s => s.toLowerCase(),
    sentence: s =>
      s.toLowerCase().replace(/(^\s*[a-z])|([.!?]\s*[a-z])/g, m => m.toUpperCase()),
    capitalized: s =>
      s.toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase()),
    alternating: s => {
      let out = "", flip = false;
      for (const ch of s) {
        if (/[a-z]/i.test(ch)) {
          out += flip ? ch.toUpperCase() : ch.toLowerCase();
          flip = !flip;
        } else out += ch;
      }
      return out;
    }
  };

  if (text && actionButtons.length) {
    actionButtons.forEach(btn => {
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

        actionButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");

        text.value = actions[a](text.value || "");
        updateStats();
        showToast("Done");
      });
    });

    text.addEventListener("input", updateStats);
    updateStats();
  }

  /* ===============================
     DARK / LIGHT MODE
     =============================== */

  const modeToggle = document.getElementById("modeToggle");
  const THEME_KEY = "cco_theme";

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(THEME_KEY, theme);
    if (modeToggle) modeToggle.setAttribute("aria-checked", theme === "dark");
  }

  const savedTheme = localStorage.getItem(THEME_KEY) || "light";
  applyTheme(savedTheme);

  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.hasAttribute("data-theme");
      applyTheme(isDark ? "light" : "dark");
    });
  }

  /* ===============================
     LANGUAGE SWITCH
     =============================== */

  const langSelect = document.getElementById("langSelect");

  if (langSelect) {
    const path = window.location.pathname;
    const match = path.match(/^\/(hu|de|fr|es|nl|pt|pl)\//);
    langSelect.value = match ? match[1] : "en";

    langSelect.addEventListener("change", () => {
      const v = langSelect.value;
      document.cookie = `cc_lang=${v}; Path=/; Max-Age=31536000; SameSite=Lax`;
      window.location.href = v === "en" ? "/" : `/${v}/`;
    });
  }

});
