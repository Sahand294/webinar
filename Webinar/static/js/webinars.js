const CATEGORIES = [
  "All",
  "technology",
  "web-development",
  "ai-machine-learning",
  "cybersecurity",
  "data-science",
  "cloud-computing",
  "business",
  "entrepreneurship",
  "marketing",
  "finance",
  "python",
  "java",
  "c++",
  "science",
  "math",
  "programming-language",
  "leadership",
  "education",
  "career-growth",
  "design",
  "ui-ux",
  "content-creation",
  "health-wellness",
  "productivity",
  "gaming",
  "lifestyle",
  "networking",
  "workshops",
  "startups",
  "freelancing",
  "software-development"
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

const $  = (s) => document.querySelector(s);
const grid  = $("#grid");
const meta  = $("#meta");
const empty = $("#empty");

// ── pill rendering ────────────────────────────────────────────────────────────
function renderPills() {

  $("#cat-pills").innerHTML = CATEGORIES.map(c =>
    `<button class="pill${state.cats.has(c) ? " active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");

  $("#price-pills").innerHTML = PRICE_FILTERS.map(p =>
    `<button class="pill${p.id === state.price ? " active" : ""}" data-price="${p.id}">${p.label}</button>`
  ).join("");

  // category clicks — just update state, no fetch yet
  document.querySelectorAll("[data-cat]").forEach(btn => {
    btn.onclick = () => {
      const cat = btn.dataset.cat;
      if (cat === "All") {
        state.cats = new Set(["All"]);
      } else {
        state.cats.delete("All");
        state.cats.has(cat) ? state.cats.delete(cat) : state.cats.add(cat);
        if (state.cats.size === 0) state.cats.add("All");
      }
      renderPills(); // re-highlight pills without fetching
    };
  });

  // price clicks — just update state, no fetch yet
  document.querySelectorAll("[data-price]").forEach(btn => {
    btn.onclick = () => {
      state.price = btn.dataset.price;
      renderPills();
    };
  });
}

// ── card HTML ─────────────────────────────────────────────────────────────────
function cardHTML(w) {
  const cats = (w.categories || [])
    .map(c => `<span class="tag">${c}</span>`)
    .join("");

  const price = Number(w.price) === 0
    ? `<span class="price free">Free</span>`
    : `<span class="price">€${Number(w.price).toFixed(2)}</span>`;

  const image = w.image
    ? `<img src="${w.image}" class="w-image" alt="${w.title}">`
    : "";

  return `
    <article class="w-card">
      <a href="/webinar/detail/${w.id}/">
        ${image}
        <div class="w-top">
          <div class="tags">${cats}</div>
          ${price}
        </div>
        <h3>${w.title}</h3>
        <p class="w-blurb">${w.blurb}</p>
        <div class="w-meta">
          <div>
            <div class="w-when">${w.when}</div>
            <div class="seats">${w.seatsLeft} seats left</div>
          </div>
        </div>
      </a>
    </article>`;
}

// ── render from an already-fetched list ───────────────────────────────────────
function renderList(list) {
  renderPills();
  grid.innerHTML  = list.map(cardHTML).join("");
  meta.textContent = `SHOWING ${list.length} WEBINARS`;
  empty.hidden = list.length !== 0;
  grid.hidden  = list.length === 0;
}

// ── build query string from current state + page ──────────────────────────────
function buildQuery(page) {
  const params = new URLSearchParams();
  params.set("load_js", "1");
  params.set("page",    page);
  if (state.q.trim()) params.set("name_webinar", state.q.trim());
  if (!state.cats.has("All")) {
    state.cats.forEach(c => params.append("cats", c));
  }
  params.set("price", state.price);
  return params.toString();
}

// ── core fetch + render ───────────────────────────────────────────────────────
async function loadPage(page) {
  // show subtle loading state
  grid.style.opacity = "0.5";

  try {
    const response = await fetch(`/webinars/?${buildQuery(page)}`, {
      headers: { "X-Requested-With": "XMLHttpRequest" }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data = await response.json();

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

// ── Apply Filters button ──────────────────────────────────────────────────────
$("#apply-btn").onclick = () => loadPage(1);

// ── pagination ────────────────────────────────────────────────────────────────
$("#next-btn").onclick = () => {
  const current = Number($("#current-page").value);
  loadPage(current + 1);
};

$("#prev-btn").onclick = () => {
  const current = Number($("#current-page").value);
  if (current > 1) loadPage(current - 1);
};

// ── search: update state only; user must hit Apply (or Enter) ─────────────────
$("#q").addEventListener("input", e => {
  state.q = e.target.value;
});

$("#q").addEventListener("keydown", e => {
  if (e.key === "Enter") loadPage(1);
});

// ── boot ──────────────────────────────────────────────────────────────────────
$("#next-btn").disabled = $("#has-next").value     === "false";
$("#prev-btn").disabled = $("#has-previous").value === "false";
renderList(WEBINARS);  // render the server-side-injected first page immediately