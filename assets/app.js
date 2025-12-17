(function () {
  const text = document.getElementById("text");
  const stats = document.getElementById("stats");
  const toast = document.getElementById("toast");
  const buttons = document.querySelectorAll("button[data-action]");
  const langSelect = document.getElementById("langSelect");

  if (!text || !stats || !toast || !buttons.length) return;

  const root = document.documentElement;

  function getStrings() {
    return {
      template: root.getAttribute("data-stats") || "Chars: {chars} · Words: {words} · Lines: {lines}",
      toastCopied: root.getAttribute("data-toast-copied") || "Copied ✓",
      toastCleared: root.getAttribute("data-toast-cleared") || "Cleared",
      toastDone: root.getAttribute("data-toast-done") || "Done",
      toastCopyFail: root.getAttribute("data-toast-copy-fail") || "Copy failed",
    };
  }

  function countWords(str) {
    const s = str.trim();
    if (!s) return 0;
    return s.split(/\s+/).filter(Boolean).length;
  }

  function countLines(str) {
    if (!str) return 0;
    return str.split(/\r\n|\r|\n/).length;
  }

  function updateStats() {
    const t = text.value || "";
    const { template } = getStrings();
    const out = template
      .replace("{chars}", String(t.length))
      .replace("{words}", String(countWords(t)))
      .replace("{lines}", String(countLines(t)));
    stats.textContent = out;
  }

  function showToast(message) {
    toast.textContent = message;
    toast.style.display = "inline-flex";
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      toast.style.display = "none";
    }, 1200);
  }

  function toSentenceCase(str) {
    return (str || "")
      .toLowerCase()
      .replace(/(^\s*[a-z])|([.!?]\s*[a-z])/g, (m) => m.toUpperCase());
  }

  function toCapitalized(str) {
    return (str || "")
      .toLowerCase()
      .replace(/\b([a-z])/g, (m) => m.toUpperCase());
  }

  function toAlternating(str) {
    let out = "";
    let flip = false;
    for (const ch of (str || "")) {
      const isLetter = ch.toLowerCase() !== ch.toUpperCase();
      if (!isLetter) {
        out += ch;
        continue;
      }
      out += flip ? ch.toUpperCase() : ch.toLowerCase();
      flip = !flip;
    }
    return out;
  }

  const actions = {
    upper: (s) => (s || "").toUpperCase(),
    lower: (s) => (s || "").toLowerCase(),
    sentence: (s) => toSentenceCase(s),
    capitalized: (s) => toCapitalized(s),
    alternating: (s) => toAlternating(s),
  };

  // Convert actions
  buttons.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const a = btn.getAttribute("data-action");
      const { toastCopied, toastCleared, toastDone, toastCopyFail } = getStrings();

      // Visual active state for case buttons (do not affect copy/clear)
      if (a && actions[a]) {
        buttons.forEach((b) => {
          const act = b.getAttribute("data-action");
          if (act && actions[act]) b.classList.remove("active");
        });
        btn.classList.add("active");
      }

      if (a === "copy") {
        try {
          await navigator.clipboard.writeText(text.value || "");
          showToast(toastCopied);
        } catch (e) {
          showToast(toastCopyFail);
        }
        return;
      }

      if (a === "clear") {
        text.value = "";
        updateStats();
        showToast(toastCleared);
        return;
      }

      if (!a || !actions[a]) return;

      text.value = actions[a](text.value);
      updateStats();
      showToast(toastDone);
    });
  });

  // Theme toggle (Light/Dark)
  const modeToggle = document.getElementById("modeToggle");
  const THEME_KEY = "cc_theme";

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function applyTheme(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      if (modeToggle) modeToggle.setAttribute("aria-checked", "true");
    } else {
      document.documentElement.removeAttribute("data-theme");
      if (modeToggle) modeToggle.setAttribute("aria-checked", "false");
    }
  }

  // init theme
  applyTheme(getPreferredTheme());

  if (modeToggle) {
    modeToggle.addEventListener("click", () => {
      const isDark = document.documentElement.getAttribute("data-theme") === "dark";
      const next = isDark ? "light" : "dark";
      localStorage.setItem(THEME_KEY, next);
      applyTheme(next);
    });
  }

  // Locale switching (kept as-is; just navigates)
  if (langSelect) {
    langSelect.addEventListener("change", () => {
      const v = langSelect.value;
      if (v === "en") window.location.href = "/";
      else window.location.href = `/${v}/`;
    });
  }

  // Init stats
  updateStats();
  text.addEventListener("input", updateStats);
})();
// Back to top button
const toTop = document.getElementById("toTop");

window.addEventListener("scroll", () => {
  if (window.scrollY > 400) {
    toTop.classList.add("show");
  } else {
    toTop.classList.remove("show");
  }
});

toTop.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
});