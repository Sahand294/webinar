(function () {

  // ---- confirm on destructive forms ----
  document.addEventListener("submit", function (e) {
    const form = e.target.closest("form[data-confirm]");
    if (!form) return;
    if (!window.confirm(form.dataset.confirm || "Are you sure?")) e.preventDefault();
  });

  // ---- pagination state ----
  let currentPage = 1;

  // ---- render a single tbody row from a webinar object ----
  function renderRow(wb) {
    const priceCell = wb.price === 0
      ? `<span class="badge-pill badge-green">Free</span>`
      : `$${wb.price}`;

    const isPublic = wb.type === "public";
    const statusBadge = isPublic
      ? `<span class="badge-pill badge-green">Active</span>`
      : `<span class="badge-pill badge-red">Inactive</span>`;

    const actionForm = isPublic
      ? `<form method="post" action="/admin/webinar/${wb.id}/deactivate/"
              data-confirm="Deactivate ${wb.title}?" style="display:inline">
           <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrf()}" />
           <input type="hidden" name="webinar_id" value="${wb.id}" />
           <button class="btn btn-danger btn-xs" type="submit">Deactivate</button>
         </form>`
      : `<form method="post" action="/admin/webinar/${wb.id}/activate/"
              data-confirm="Activate ${wb.title}?" style="display:inline">
           <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrf()}" />
           <input type="hidden" name="webinar_id" value="${wb.id}" />
           <button class="btn btn-primary btn-xs" type="submit">Activate</button>
         </form>`;

    return `<tr data-search="${escHtml(wb.title || wb.name || "")}">
      <td class="mono small">${wb.id}</td>
      <td>${escHtml(wb.title || wb.name || "")}</td>
      <td class="mono small">${wb.seatsLeft ?? wb.stock ?? ""}</td>
      <td class="mono small">${priceCell}</td>
      <td>${statusBadge}</td>
      <td><div class="adm-row-actions">${actionForm}</div></td>
    </tr>`;
  }

  // ---- fetch a page and re-render table ----
  function loadPage(page) {
    const tbody = document.querySelector("#webinar-table tbody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="muted small" style="padding:16px">Loading…</td></tr>`;

    fetch(`?load_js=1&page=${page}`)
      .then(r => r.json())
      .then(data => {
        currentPage = data.current_page;
        tbody.innerHTML = data.webinars.length
          ? data.webinars.map(renderRow).join("")
          : `<tr><td colspan="6" class="muted small" style="padding:16px">No webinars found.</td></tr>`;
        renderPagination(data);
        // re-apply any active search
        applySearch();
      })
      .catch(() => {
        tbody.innerHTML = `<tr><td colspan="6" class="muted small" style="padding:16px;color:#ff8a7a">Failed to load webinars.</td></tr>`;
      });
  }

  // ---- build / update pagination controls ----
  function renderPagination(data) {
    let bar = document.getElementById("webinar-pagination");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "webinar-pagination";
      bar.className = "adm-pagination";
      const card = document.querySelector(".adm-table-card");
      if (card) card.appendChild(bar);
    }

    bar.innerHTML = "";

    const prev = document.createElement("button");
    prev.className = "btn btn-ghost btn-xs";
    prev.textContent = "← Prev";
    prev.disabled = !data.has_previous;
    prev.addEventListener("click", () => loadPage(currentPage - 1));

    const info = document.createElement("span");
    info.className = "mono small muted";
    info.style.margin = "0 10px";
    info.textContent = `Page ${data.current_page} of ${data.total_pages}`;

    const next = document.createElement("button");
    next.className = "btn btn-ghost btn-xs";
    next.textContent = "Next →";
    next.disabled = !data.has_next;
    next.addEventListener("click", () => loadPage(currentPage + 1));

    bar.appendChild(prev);
    bar.appendChild(info);
    bar.appendChild(next);
  }

  // ---- live search (runs on rendered rows) ----
  function applySearch() {
    const search = document.getElementById("webinar-search");
    const table  = document.getElementById("webinar-table");
    if (!search || !table) return;
    const q = search.value.trim().toLowerCase();
    table.querySelectorAll("tbody tr").forEach(row => {
      const text = (row.dataset.search || row.textContent).toLowerCase();
      row.classList.toggle("adm-hidden", q.length > 0 && !text.includes(q));
    });
  }

  const searchEl = document.getElementById("webinar-search");
  if (searchEl) searchEl.addEventListener("input", applySearch);

  // ---- helpers ----
  function getCsrf() {
    const el = document.querySelector("[name=csrfmiddlewaretoken]");
    return el ? el.value : "";
  }
  function escHtml(str) {
    return String(str).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
  }

  // ---- kick off ----
  loadPage(1);

})();
