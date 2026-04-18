/* =========================================================
   Fan Feng — personal site JS
   Handles: theme (light/dark), language, mobile nav, starfield,
   and data-driven rendering for all pages.
   ========================================================= */

const SUPPORTED_LANGS = ["en", "zh"];
const DEFAULT_LANG = "en";
const SUPPORTED_THEMES = ["dark", "light"];
const DEFAULT_THEME = "dark";

/* ---------- Fallback data (used only if JSON fetch fails, e.g. file://) ---------- */
const FALLBACK_DATA = {
  site: {
    profile: {
      name: { en: "Fan Feng", zh: "冯帆" },
      role: { en: "Research Fellow", zh: "博士后研究员" },
      affiliation: {
        en: "Vanderbilt University Medical Center",
        zh: "范德堡大学医学中心",
      },
      portrait: "assets/images/portrait/fan_portrait.jpg",
      email: "fan.feng@vumc.org",
      socials: {
        scholar: "https://scholar.google.com/citations?user=1EXo-hIAAAAJ&hl=en",
        github: "https://github.com/dmcbffeng",
        linkedin: "https://www.linkedin.com/in/fan-feng-974842120/",
      },
    },
    about: {
      en: [
        "I'm a researcher at Vanderbilt University Medical Center working on computational biology, imaging, and machine learning for diabetes and pancreatic islets.",
      ],
      zh: [
        "我在范德堡大学医学中心（VUMC）做博士后研究，关注计算生物学、影像分析与机器学习。",
      ],
    },
    highlights: [
      {
        en: "Research Fellow at Vanderbilt University Medical Center.",
        zh: "范德堡大学医学中心 博士后研究员。",
      },
      {
        en: "Computational biology + imaging + ML for diabetes.",
        zh: "计算生物学 + 成像 + 机器学习，关注糖尿病。",
      },
    ],
  },
  news: [],
  works: [],
  cv: { links: { en: { pdf: "#" }, zh: { pdf: "#" } }, sections: [] },
  world: { locations: [] },
};

/* ---------- Language ---------- */
function getLanguage() {
  const params = new URLSearchParams(window.location.search);
  const urlLang = params.get("lang");
  if (SUPPORTED_LANGS.includes(urlLang)) return urlLang;
  const stored = localStorage.getItem("site_lang");
  if (SUPPORTED_LANGS.includes(stored)) return stored;
  return DEFAULT_LANG;
}

function setLanguage(lang) {
  localStorage.setItem("site_lang", lang);
  const url = new URL(window.location.href);
  url.searchParams.set("lang", lang);
  window.history.replaceState({}, "", url.toString());
}

function t(lang, path) {
  return (
    path
      .split(".")
      .reduce((acc, key) => (acc ? acc[key] : undefined), I18N[lang]) ?? path
  );
}

function applyTranslations(lang) {
  document.documentElement.lang = lang === "zh" ? "zh" : "en";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(lang, el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(lang, el.dataset.i18nAria));
  });
}

function updateInternalLinks(lang) {
  document.querySelectorAll("a[href]").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) return;
    if (!a.href.startsWith(window.location.origin)) return;
    const url = new URL(a.href);
    url.searchParams.set("lang", lang);
    a.href = url.toString();
  });
}

function initLangSwitch(lang) {
  const btn = document.getElementById("langSwitch");
  if (!btn) return;
  btn.textContent = lang === "en" ? "中文" : "EN";
  btn.addEventListener("click", () => {
    const next = getLanguage() === "en" ? "zh" : "en";
    setLanguage(next);
    window.location.reload();
  });
}

/* ---------- Theme ---------- */
function getTheme() {
  const stored = localStorage.getItem("site_theme");
  if (SUPPORTED_THEMES.includes(stored)) return stored;
  if (
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: light)").matches
  ) {
    return "light";
  }
  return DEFAULT_THEME;
}

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  const btn = document.getElementById("themeToggle");
  if (btn) {
    btn.innerHTML = theme === "light" ? sunIcon() : moonIcon();
    btn.title =
      theme === "light" ? "Switch to dark theme" : "Switch to light theme";
  }
}

function initThemeToggle() {
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const current =
      document.documentElement.getAttribute("data-theme") || DEFAULT_THEME;
    const next = current === "light" ? "dark" : "light";
    localStorage.setItem("site_theme", next);
    applyTheme(next);
  });
}

function moonIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"/></svg>';
}
function sunIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
}
function menuIcon() {
  return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>';
}

/* ---------- Mobile nav ---------- */
function initNavToggle() {
  const btn = document.getElementById("navToggle");
  const nav = document.querySelector(".site-nav");
  if (!btn || !nav) return;
  btn.innerHTML = menuIcon();
  btn.addEventListener("click", () => {
    nav.classList.toggle("open");
    const open = nav.classList.contains("open");
    btn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.querySelectorAll("a").forEach((a) => {
    a.addEventListener("click", () => nav.classList.remove("open"));
  });
  window.matchMedia("(min-width: 821px)").addEventListener("change", (e) => {
    if (e.matches) nav.classList.remove("open");
  });
}

/* Mark active nav item based on current page. */
function markActiveNav() {
  const page = document.body.dataset.page;
  const map = {
    home: "index.html",
    cv: "cv.html",
    news: "news.html",
    works: "works.html",
    "work-detail": "works.html",
    world: "world.html",
  };
  const target = map[page];
  if (!target) return;
  document.querySelectorAll(".site-nav a").forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.split("?")[0] === target) a.setAttribute("aria-current", "page");
  });
}

/* ---------- Starfield (skipped in light theme by CSS) ---------- */
function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let stars = [];
  let comets = [];
  let width = 0;
  let height = 0;

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    stars = Array.from(
      { length: Math.max(60, Math.floor(width / 22)) },
      () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 0.8 + 0.2,
        twinkle: Math.random() * Math.PI * 2,
      }),
    );
    comets = [];
  }

  function draw() {
    ctx.clearRect(0, 0, width, height);
    const starRgb =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--starfield-color")
        .trim() || "129, 168, 255";
    if (Math.random() < 0.008) {
      comets.push({
        x: Math.random() * width,
        y: -20,
        vx: -2.2 - Math.random() * 1.8,
        vy: 2.2 + Math.random() * 1.8,
        life: 0,
      });
    }
    for (const star of stars) {
      star.y += star.z * 0.3;
      if (star.y > height) {
        star.y = 0;
        star.x = Math.random() * width;
      }
      const size = star.z * 1.8;
      star.twinkle += 0.04 + star.z * 0.04;
      const alpha = 0.18 + star.z * 0.5 + Math.sin(star.twinkle) * 0.2;
      ctx.fillStyle = `rgba(${starRgb}, ${Math.max(0.1, alpha)})`;
      ctx.beginPath();
      ctx.arc(star.x, star.y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    comets = comets.filter((c) => c.life < 120);
    comets.forEach((c) => {
      c.x += c.vx;
      c.y += c.vy;
      c.life += 1;
      const opacity = 1 - c.life / 120;
      ctx.strokeStyle = `rgba(${starRgb}, ${opacity * 0.7})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(c.x, c.y);
      ctx.lineTo(c.x - c.vx * 10, c.y - c.vy * 10);
      ctx.stroke();
    });
    requestAnimationFrame(draw);
  }

  window.addEventListener("resize", resize);
  resize();
  draw();
}

/* ---------- Utilities ---------- */
async function fetchJson(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to fetch ${path}`);
  return res.json();
}

function esc(str) {
  return String(str ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[c],
  );
}

/* ---------- Home renderers ---------- */
function renderHighlights(lang, siteData) {
  const list = document.getElementById("homeHighlights");
  if (!list) return;
  list.innerHTML = "";
  (siteData.highlights || []).forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item[lang];
    list.appendChild(li);
  });
}

function renderAbout(lang, siteData) {
  const wrap = document.getElementById("homeAbout");
  if (!wrap) return;
  const portrait = siteData.profile?.portrait || "";
  const paragraphs = (siteData.about?.[lang] || [])
    .map((p) => `<p>${p}</p>`)
    .join("");
  wrap.innerHTML = `
    ${portrait ? `<img class="about-portrait" src="${esc(portrait)}" alt="${esc(siteData.profile?.name?.[lang] || "")}" loading="lazy">` : ""}
    <div>${paragraphs}</div>
  `;
}

function renderFocusCards(lang) {
  const grid = document.getElementById("homeFocusGrid");
  if (!grid) return;
  const focus = I18N[lang].home.focus;
  const items = [
    { key: "research", icon: "🔬" },
    { key: "tech", icon: "⚙️" },
    { key: "travel", icon: "🌏" },
  ];
  grid.innerHTML = items
    .map(({ key, icon }) => {
      const f = focus[key];
      const bullets = (f.bullets || [])
        .map((b) => `<li>${esc(b)}</li>`)
        .join("");
      return `
        <article class="focus-card">
          <span class="focus-icon" aria-hidden="true">${icon}</span>
          <h3>${esc(f.title)}</h3>
          <p>${esc(f.desc)}</p>
          <ul>${bullets}</ul>
        </article>`;
    })
    .join("");
}

function renderHomeRecentNews(lang, newsData) {
  const list = document.getElementById("homeRecentNews");
  if (!list) return;
  const sorted = [...newsData]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);
  list.innerHTML = sorted
    .map((item) => {
      const content = item.url
        ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.text[lang])}</a>`
        : esc(item.text[lang]);
      return `<li class="timeline-item"><div class="timeline-date">${esc(item.date)}</div><div class="timeline-content">${content}</div></li>`;
    })
    .join("");
}

function renderHomeCvSnapshot(lang, cvData) {
  const roleList = document.getElementById("homeCvRole");
  const eduList = document.getElementById("homeCvEducation");
  if (!roleList || !eduList) return;
  const roleSection = cvData.sections.find(
    (s) => s.id === "work-experience" || s.id === "current-position",
  );
  const eduSection = cvData.sections.find((s) => s.id === "education");
  roleList.innerHTML = (roleSection?.items || [])
    .map((i) => `<li>${i[lang]}</li>`)
    .join("");
  eduList.innerHTML = (eduSection?.items || [])
    .map((i) => `<li>${i[lang]}</li>`)
    .join("");
}

const HOME_FEATURED_WORK_IDS = [
  "pediatric-islet-2026",
  "rcmc-cleopatra-2025",
  "pankbase-pankgraph-2025",
  "genomickb-2023",
];

function renderHomeFeaturedWorks(lang, worksData) {
  const wrapper = document.getElementById("homeFeaturedWorks");
  if (!wrapper) return;
  const byId = new Map(worksData.map((w) => [w.id, w]));
  const featured = HOME_FEATURED_WORK_IDS.map((id) => byId.get(id)).filter(
    Boolean,
  );
  wrapper.innerHTML = featured
    .map((work) => {
      const tag = work.tag
        ? `<p class="meta-note">${esc(work.tag[lang] || "")} · ${esc(work.date)}</p>`
        : `<p class="meta-note">${esc(work.date)}</p>`;
      return `<a class="card-link" href="work.html?id=${encodeURIComponent(work.id)}&lang=${lang}">${tag}<h3>${esc(work.title[lang])}</h3><p>${esc(work.summary[lang])}</p></a>`;
    })
    .join("");
}

/* ---------- Works list & detail ---------- */
function renderWorks(lang, worksData) {
  const cards = document.getElementById("workCards");
  if (!cards) return;
  const sorted = [...worksData].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  cards.innerHTML = sorted
    .map((work) => {
      const tag = work.tag
        ? `<p class="meta-note">${esc(work.tag[lang] || "")} · ${esc(work.date)}</p>`
        : `<p class="meta-note">${esc(work.date)}</p>`;
      return `<a class="card-link" href="work.html?id=${encodeURIComponent(work.id)}&lang=${lang}">${tag}<h3>${esc(work.title[lang])}</h3><p>${esc(work.summary[lang])}</p></a>`;
    })
    .join("");
}

function renderWorkDetail(lang, worksData) {
  const wrapper = document.getElementById("workDetail");
  if (!wrapper) return;
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  const work = worksData.find((item) => item.id === id) || worksData[0];
  if (!work) {
    wrapper.innerHTML = `<p>${esc(t(lang, "workDetail.back"))}</p>`;
    return;
  }
  document.title = `${work.title[lang]} | Fan Feng`;

  const sectionsHtml = (work.sections || [])
    .map(
      (section) =>
        `<section class="work-block"><h2>${esc(section.heading[lang])}</h2><p>${esc(section.text[lang])}</p></section>`,
    )
    .join("");

  const links = (work.links || [])
    .map(
      (link) =>
        `<li><a href="${esc(link.url)}" target="_blank" rel="noopener">${esc(link.label[lang])}</a></li>`,
    )
    .join("");

  const gallery = (work.gallery || [])
    .map(
      (image) =>
        `<img src="${esc(image.src)}" alt="${esc(image.alt?.[lang] || "")}" class="work-image" loading="lazy">`,
    )
    .join("");

  wrapper.innerHTML = `
    <a class="btn ghost" href="works.html?lang=${lang}">${esc(t(lang, "workDetail.back"))}</a>
    <div class="section-head" style="margin-top:18px">
      <p class="kicker">${work.tag ? esc(work.tag[lang] || "") + " · " : ""}${esc(work.date)}</p>
      <h1>${esc(work.title[lang])}</h1>
      <p class="lead">${esc(work.summary[lang])}</p>
    </div>
    ${sectionsHtml}
    ${links ? `<section class="work-block"><h2>${esc(t(lang, "workDetail.links"))}</h2><ul>${links}</ul></section>` : ""}
    ${gallery ? `<section class="image-grid">${gallery}</section>` : ""}
  `;
}

/* ---------- News ---------- */
function renderNews(lang, newsData) {
  const timeline = document.getElementById("newsTimeline");
  if (!timeline) return;
  const sorted = [...newsData].sort(
    (a, b) => new Date(b.date) - new Date(a.date),
  );
  timeline.innerHTML = sorted
    .map((item) => {
      const content = item.url
        ? `<a href="${esc(item.url)}" target="_blank" rel="noopener">${esc(item.text[lang])}</a>`
        : esc(item.text[lang]);
      return `<li class="timeline-item"><div class="timeline-date">${esc(item.date)}</div><div class="timeline-content">${content}</div></li>`;
    })
    .join("");
}

/* ---------- CV ---------- */
function renderCv(lang, cvData) {
  const sections = document.getElementById("cvSections");
  const toc = document.getElementById("cvToc");
  const pdf = document.getElementById("cvPdfLink");
  if (!sections) return;
  if (pdf) pdf.href = cvData.links[lang].pdf;

  if (toc) {
    toc.innerHTML = cvData.sections
      .map((s) => `<li><a href="#${esc(s.id)}">${esc(s.title[lang])}</a></li>`)
      .join("");
  }

  sections.innerHTML = cvData.sections
    .map((section) => {
      const items = section.items
        .map((item) => `<li>${item[lang]}</li>`)
        .join("");
      return `
        <article id="${esc(section.id)}" class="glass cv-card">
          <h2>${esc(section.title[lang])}</h2>
          <ul>${items}</ul>
        </article>
      `;
    })
    .join("");
}

/* ---------- World map ---------- */
function renderWorld(lang, worldData) {
  const pins = document.getElementById("worldPins");
  const dialog = document.getElementById("worldDialog");
  if (!pins || !dialog) return;

  const dialogImage = document.getElementById("dialogImage");
  const dialogTitle = document.getElementById("dialogTitle");
  const dialogDesc = document.getElementById("dialogDesc");
  const dialogLink = document.getElementById("dialogLink");
  const closeDialog = document.getElementById("closeDialog");

  pins.innerHTML = "";
  (worldData.locations || []).forEach((loc) => {
    const pin = document.createElement("button");
    pin.type = "button";
    pin.className = "map-thumb";
    pin.style.left = `${loc.xPercent}%`;
    pin.style.top = `${loc.yPercent}%`;
    pin.title = loc.city[lang];
    pin.innerHTML = `<img src="${esc(loc.thumbnail || loc.photo)}" alt="${esc(loc.city[lang])}">`;
    pin.addEventListener("click", () => {
      if (dialogImage) {
        dialogImage.src = loc.fullImage || loc.photo || loc.thumbnail || "";
        dialogImage.alt = loc.city[lang];
      }
      if (dialogTitle)
        dialogTitle.textContent = `${loc.city[lang]} · ${loc.date}`;
      if (dialogDesc) dialogDesc.textContent = loc.note[lang];
      if (dialogLink) {
        if (loc.link) {
          dialogLink.href = loc.link;
          dialogLink.style.display = "";
          dialogLink.textContent =
            lang === "zh" ? "查看 Vlog ↗" : "Watch vlog ↗";
        } else {
          dialogLink.style.display = "none";
        }
      }
      dialog.showModal();
    });
    pins.appendChild(pin);
  });

  if (closeDialog) closeDialog.addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (evt) => {
    const rect = dialog.getBoundingClientRect();
    const inside =
      evt.clientX >= rect.left &&
      evt.clientX <= rect.right &&
      evt.clientY >= rect.top &&
      evt.clientY <= rect.bottom;
    if (!inside) dialog.close();
  });

  initMapCalibration();
}

function initMapCalibration() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("calibrate") !== "1") return;

  const wrap = document.getElementById("worldMapWrap");
  const overlay = document.getElementById("calibrationOverlay");
  const valueEl = document.getElementById("calibrationValue");
  if (!wrap || !overlay || !valueEl) return;

  wrap.classList.add("calibrating");
  overlay.hidden = false;

  wrap.addEventListener("click", (evt) => {
    if (evt.target.closest(".map-thumb")) return;
    const rect = wrap.getBoundingClientRect();
    const xPercent = ((evt.clientX - rect.left) / rect.width) * 100;
    const yPercent = ((evt.clientY - rect.top) / rect.height) * 100;
    const snippet = `"xPercent": ${xPercent.toFixed(2)}, "yPercent": ${yPercent.toFixed(2)}`;
    valueEl.textContent = snippet;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet).catch(() => {});
    }
  });
}

/* ---------- Boot ---------- */
async function boot() {
  applyTheme(getTheme());
  initThemeToggle();

  const lang = getLanguage();
  setLanguage(lang);
  applyTranslations(lang);
  updateInternalLinks(lang);
  initLangSwitch(lang);
  initNavToggle();
  markActiveNav();
  initStarfield();

  const page = document.body.dataset.page;
  let siteData, worksData, newsData, cvData, worldData;
  try {
    [siteData, worksData, newsData, cvData, worldData] = await Promise.all([
      fetchJson("data/site.json"),
      fetchJson("data/works.json"),
      fetchJson("data/news.json"),
      fetchJson("data/cv.json"),
      fetchJson("data/world.json"),
    ]);
  } catch (_err) {
    siteData = FALLBACK_DATA.site;
    worksData = FALLBACK_DATA.works;
    newsData = FALLBACK_DATA.news;
    cvData = FALLBACK_DATA.cv;
    worldData = FALLBACK_DATA.world;
  }

  if (page === "home") {
    renderHighlights(lang, siteData);
    renderAbout(lang, siteData);
    renderFocusCards(lang);
    renderHomeRecentNews(lang, newsData);
    renderHomeCvSnapshot(lang, cvData);
    renderHomeFeaturedWorks(lang, worksData);
  }
  if (page === "works") renderWorks(lang, worksData);
  if (page === "work-detail") renderWorkDetail(lang, worksData);
  if (page === "news") renderNews(lang, newsData);
  if (page === "cv") renderCv(lang, cvData);
  if (page === "world") renderWorld(lang, worldData);
}

boot().catch((err) => {
  console.error(err);
});
