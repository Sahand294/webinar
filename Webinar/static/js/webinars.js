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
  { id: "any", label: "Any" },
  { id: "free", label: "Free" },
  { id: "under20", label: "Under €20" },
  { id: "under50", label: "Under €50" },
];

const state = {
  q: "",
  cats: new Set(["All"]),
  price: "any"
};

const $ = (s) => document.querySelector(s);

const grid = $("#grid");
const meta = $("#meta");
const empty = $("#empty");

function renderPills() {

  $("#cat-pills").innerHTML = CATEGORIES.map(c =>
    `<button class="pill${state.cats.has(c) ? " active" : ""}" data-cat="${c}">
      ${c}
    </button>`
  ).join("");

  $("#price-pills").innerHTML = PRICE_FILTERS.map(p =>
    `<button class="pill${p.id === state.price ? " active" : ""}" data-price="${p.id}">
      ${p.label}
    </button>`
  ).join("");

  // CATEGORY FILTERS
  document.querySelectorAll("[data-cat]").forEach(btn => {

    btn.onclick = () => {

      const cat = btn.dataset.cat;

      if (cat === "All") {

        state.cats = new Set(["All"]);

      } else {

        state.cats.delete("All");

        if (state.cats.has(cat)) {
          state.cats.delete(cat);
        } else {
          state.cats.add(cat);
        }

        if (state.cats.size === 0) {
          state.cats.add("All");
        }
      }

      render();
    };
  });

  // PRICE FILTERS
  document.querySelectorAll("[data-price]").forEach(btn => {

    btn.onclick = () => {

      state.price = btn.dataset.price;

      render();
    };
  });
}

function matches(w) {

  const q = state.q.trim().toLowerCase();

  // SEARCH
  if (
    q &&
    !(w.title + " " + w.blurb)
      .toLowerCase()
      .includes(q)
  ) {
    return false;
  }

  // CATEGORY
  if (
    !state.cats.has("All") &&
    !w.categories.some(c =>
      state.cats.has(c.toLowerCase())
    )
  ) {
    return false;
  }

  // PRICE
  if (state.price === "free" && Number(w.price) !== 0)
    return false;

  if (state.price === "under20" && Number(w.price) >= 20)
    return false;

  if (state.price === "under50" && Number(w.price) >= 50)
    return false;

  return true;
}

function cardHTML(w) {

  const cats = (w.categories || []).map(c =>
    `<span class="tag">${c}</span>`
  ).join("");

  const price =
    Number(w.price) === 0
      ? `<span class="price free">Free</span>`
      : `<span class="price">€${w.price}</span>`;

  const image = w.image
    ? `<img src="${w.image}" class="w-image" alt="${w.title}">`
    : "";

  return `
    <article class="w-card">
        <a href="http://127.0.0.1:8000/webinar/detail/${w.id}/">
      ${image}

      <div class="w-top">

        <div class="tags">
          ${cats}
        </div>

        ${price}

      </div>

      <h3>${w.title}</h3>

      <p class="w-blurb">
        ${w.blurb}
      </p>

      <div class="w-meta">

        <div>
          <div class="w-when">${w.when}</div>

          <div class="seats">
            ${w.seatsLeft} seats left
          </div>
        </div>

      </div>
    </a>
    </article>
  `;
}

function render() {

  renderPills();

  const list = WEBINARS.filter(matches);

  grid.innerHTML = list.map(cardHTML).join("");

  meta.textContent =
    `SHOWING ${list.length} WEBINARS`;

  empty.hidden = list.length !== 0;

  grid.hidden = list.length === 0;
}

async function loadPage(page) {

  const response = await fetch(`/get_webinar_by_js/?page=${page}`, {
    headers: {
      "X-Requested-With": "XMLHttpRequest"
    }
  });

  const data = await response.json();

  WEBINARS = data.webinars;

  document.querySelector("#current-page").value =
    data.current_page;

  document.querySelector("#next-btn").disabled =
    !data.has_next;

  document.querySelector("#prev-btn").disabled =
    !data.has_previous;

  render();
}

// NEXT PAGE
document.querySelector("#next-btn").onclick = () => {

  const current =
    Number(document.querySelector("#current-page").value);

  loadPage(current + 1);
};


// PREVIOUS PAGE
document.querySelector("#prev-btn").onclick = () => {

  const current =
    Number(document.querySelector("#current-page").value);

  if (current > 1) {
    loadPage(current - 1);
  }
};

// SEARCH
$("#q").addEventListener("input", e => {

  state.q = e.target.value;

  render();
});
document.querySelector("#next-btn").disabled =
  document.querySelector("#has-next").value === "false";

document.querySelector("#prev-btn").disabled =
  document.querySelector("#has-previous").value === "false";
render();