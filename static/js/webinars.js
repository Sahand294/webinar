const CATEGORIES = [
  "All","technology","web-development","ai-machine-learning","cybersecurity",
  "data-science","cloud-computing","business","entrepreneurship","marketing",
  "finance","python","java","c++","science","math","programming-language",
  "leadership","education","career-growth","design","ui-ux","content-creation",
  "health-wellness","productivity","gaming","lifestyle","networking","workshops",
  "startups","freelancing","software-development"
];

const PRICE_FILTERS = [
  { id: "any",     label: "Any"       },
  { id: "free",    label: "Free"      },
  { id: "under20", label: "Under €20" },
  { id: "under50", label: "Under €50" },
];

const state = {
  q:     "",
  cats:  new Set(["All"]),
  price: "any"
};

const $     = (s) => document.querySelector(s);
const grid  = $("#grid");
const meta  = $("#meta");
const empty = $("#empty");

// ── searchable category select ────────────────────────────────────
let catFilterText = "";
let catPanelOpen  = false;

function selectedCatLabel(c) { return c === "All" ? "All" : c; }

function renderCatChips() {
  const chips = state.cats.has("All") ? [] : [...state.cats];
  $("#cat-chips").innerHTML = chips.map(c => `
    <span class="cat-chip" data-chip="${c}">
      ${selectedCatLabel(c)}
      <button type="button" data-remove-cat="${c}" aria-label="Remove ${c}">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
          <path d="M18 6 6 18M6 6l12 12"/>
        </svg>
      </button>
    </span>`).join("");

  document.querySelectorAll("[data-remove-cat]").forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const cat = btn.dataset.removeCat;
      state.cats.delete(cat);
      if (state.cats.size === 0) state.cats.add("All");
      renderCatChips();
      renderCatPanel();
    };
  });
}

function renderCatPanel() {
  const q = catFilterText.trim().toLowerCase();
  const options = CATEGORIES.filter(c => c.toLowerCase().includes(q));

  $("#cat-panel").innerHTML = options.length
    ? options.map(c => `
        <label class="cat-option${state.cats.has(c) ? " selected" : ""}" data-cat-option="${c}">
          <input type="checkbox" ${state.cats.has(c) ? "checked" : ""} data-cat-checkbox="${c}">
          ${c}
        </label>`).join("")
    : `<div class="cat-option-empty">No categories match "${catFilterText}"</div>`;

  document.querySelectorAll("[data-cat-checkbox]").forEach(box => {
    box.onclick = (e) => {
      e.stopPropagation();
      const cat = box.dataset.catCheckbox;
      if (cat === "All") {
        state.cats = new Set(["All"]);
      } else {
        state.cats.delete("All");
        state.cats.has(cat) ? state.cats.delete(cat) : state.cats.add(cat);
        if (state.cats.size === 0) state.cats.add("All");
      }
      renderCatChips();
      renderCatPanel();
    };
  });
}

function openCatPanel() {
  catPanelOpen = true;
  $("#cat-select").classList.add("open");
  renderCatPanel();
}
function closeCatPanel() {
  catPanelOpen = false;
  $("#cat-select").classList.remove("open");
  catFilterText = "";
  $("#cat-search").value = "";
}

$("#cat-select-input").addEventListener("click", () => {
  if (!catPanelOpen) openCatPanel();
  $("#cat-search").focus();
});
$("#cat-search").addEventListener("input", (e) => {
  catFilterText = e.target.value;
  if (!catPanelOpen) openCatPanel();
  renderCatPanel();
});
document.addEventListener("click", (e) => {
  if (catPanelOpen && !$("#cat-select").contains(e.target)) closeCatPanel();
});

// ── price pill rendering ───────────────────────────────────────────
function renderPills() {
  $("#price-pills").innerHTML = PRICE_FILTERS.map(p =>
    `<button class="pill${p.id === state.price ? " active" : ""}" data-price="${p.id}">${p.label}</button>`
  ).join("");

  document.querySelectorAll("[data-price]").forEach(btn => {
    btn.onclick = () => {
      state.price = btn.dataset.price;
      renderPills();
    };
  });

  renderCatChips();
}

// ── card HTML — matches new CSS structure ─────────────────────────
const PLACEHOLDER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
  <rect x="3" y="5" width="18" height="14" rx="2"/>
  <circle cx="9" cy="10.5" r="1.6"/>
  <path d="m21 16-5.2-5.2a2 2 0 0 0-2.8 0L4 19"/>
</svg>`;

function cardHTML(w) {
  const price = Number(w.price) === 0
    ? `<span class="price free">Free</span>`
    : `<span class="price">€${Number(w.price).toFixed(2)}</span>`;

  const image = w.image
    ? `<img src="${w.image}" class="w-image" alt="${w.title}">`
    : `<div class="w-image placeholder">${PLACEHOLDER_SVG}</div>`;

  return `
    <article class="w-card">
      <a href="/webinar/detail/${w.id}/" style="display:contents;text-decoration:none;color:inherit;">
        ${image}
        <div class="w-body">
          <div class="w-top">
            ${price}
          </div>
          <h3>${w.title}</h3>
          <p class="w-blurb">${w.blurb}</p>
          <div class="w-meta">
            <div class="w-meta-left">
              <span class="w-when">${w.when}</span>
            </div>
            <span class="seats">${w.seatsLeft} seats left</span>
          </div>
        </div>
      </a>
    </article>`;
}

// ── render from fetched list ──────────────────────────────────────
function renderList(list) {
  renderPills();
  grid.innerHTML   = list.map(cardHTML).join("");
  meta.textContent = `SHOWING ${list.length} WEBINARS`;
  empty.hidden = list.length !== 0;
  grid.hidden  = list.length === 0;
}

// ── build query params ────────────────────────────────────────────
function buildQuery(page) {
  const params = new URLSearchParams();
  params.set("load_js", "1");
  params.set("page", page);
  if (state.q.trim()) params.set("name_webinar", state.q.trim());
  if (!state.cats.has("All")) {
    state.cats.forEach(c => params.append("cats", c));
  }
  params.set("price", state.price);
  return params.toString();
}

// ── core fetch ────────────────────────────────────────────────────
async function loadPage(page) {
  grid.style.opacity = "0.5";
  try {
    const res = await fetch(`/webinars/?${buildQuery(page)}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    WEBINARS = data.webinars;
    $("#current-page").value = data.current_page;
    $("#next-btn").disabled  = !data.has_next;
    $("#prev-btn").disabled  = !data.has_previous;

    renderList(data.webinars);
  } catch (err) {
    console.error("Failed to load webinars:", err);
  } finally {
    grid.style.opacity = "1";
  }
}

// ── apply filters ─────────────────────────────────────────────────
$("#apply-btn").onclick = () => loadPage(1);

// ── pagination ────────────────────────────────────────────────────
$("#next-btn").onclick = () => loadPage(Number($("#current-page").value) + 1);
$("#prev-btn").onclick = () => {
  const cur = Number($("#current-page").value);
  if (cur > 1) loadPage(cur - 1);
};

// ── search ────────────────────────────────────────────────────────
$("#q").addEventListener("input", e => { state.q = e.target.value; });
$("#q").addEventListener("keydown", e => { if (e.key === "Enter") loadPage(1); });

// ── boot ──────────────────────────────────────────────────────────
$("#next-btn").disabled = $("#has-next").value     === "false";
$("#prev-btn").disabled = $("#has-previous").value === "false";
renderList(WEBINARS);