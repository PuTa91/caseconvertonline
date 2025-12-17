(() => {
  const input = document.getElementById("input");
  const stats = document.getElementById("stats");
  const copyBtn = document.getElementById("copyBtn");
  const clearBtn = document.getElementById("clearBtn");
  const buttons = Array.from(document.querySelectorAll(".btn[data-action]"));

  const THEME_KEY = "cco_theme";

  function countStats(text) {
    const chars = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const lines = text ? text.split(/\r?\n/).length : 0;
    return { chars, words, lines };
  }

  function updateStats() {
    if (!stats || !input) return;
    const { chars, words, lines } = countStats(input.value);
    stats.textContent = `Chars: ${chars} · Words: ${words} · Lines: ${lines}`;
  }

  function toSentenceCase(text) {
    // Split by sentence endings and recompose
    return text.replace(/(^\s*[a-z])|([.!?]\s+)([a-z])/g, (m, p1, p2, p3) => {
      if (p1) return p1.toUpperCase();
      return p2 + p3.toUpperCase();
    });
  }

  function toCapitalized(text) {
    return text.replace(/\b([a-z])/gi, (m) => m.toUpperCase());
  }

  function toAlternating(text) {
    let out = "";
    let upper = false;
    for (const ch of text) {
      if (/[a-z]/i.test(ch)) {
        out += upper ? ch.toUpperCase() : ch.toLowerCase();
        upper = !upper;
      } else {
        out += ch;
      }
    }
    return out;
  }

  function applyAction(action) {
    if (!input) return;
    const t = input.value;

    let next = t;
    switch (action) {
      case "upper":
        next = t.toUpperCase();
        break;
      case "lower":
        next = t.toLowerCase();
        break;
      case "sentence":
        next = toSentenceCase(t);
        break;
      case "capitalized":
        next = toCapitalized(t);
        break;
      case "alternating":
        next = toAlternating(t);
        break;
      default:
        break;
    }

    input.value = next;
    updateStats();
  }

  function setActive(action) {
    buttons.forEach((b) => b.classList.toggle("is-active", b.dataset.action === action));
  }

  // Theme (default LIGHT)
  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    localStorage.setItem(THEME_KEY, theme);

    const toggle = document.getElementById("modeToggle");
    if (toggle) toggle.setAttribute("aria-checked", theme === "dark" ? "true" : "false");
  }

  const modeToggle = document.getElementById("modeToggle");
  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const current = document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
      applyTheme(current === "dark" ? "light" : "dark");
    });
  }
  applyTheme(getPreferredTheme());

  // Button handlers
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const action = btn.dataset.action;
      setActive(action);
      applyAction(action);
    });
  });

  // Copy / Clear
  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      if (!input) return;
      try {
        await navigator.clipboard.writeText(input.value);
      } catch (_) {}
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (!input) return;
      input.value = "";
      updateStats();
    });
  }

  if (input) {
    input.addEventListener("input", updateStats);
    updateStats();
  }

  // Footer year
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Back to top button (guarded)
  const toTop = document.getElementById("toTop");
  if (toTop) {
    window.addEventListener("scroll", () => {
      if (window.scrollY > 400) toTop.classList.add("show");
      else toTop.classList.remove("show");
    });
    toTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Locale switching (cookie only; no navigation until /hu etc exist)
  const langSelect = document.getElementById("langSelect");
  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const v = langSelect.value;
      document.cookie = `cc_lang=${v}; Path=/; Max-Age=31536000; SameSite=Lax`;
      if (v !== "en") {
        langSelect.value = "en";
        alert("Language pages coming soon.");
      }
    });
  }
})();
