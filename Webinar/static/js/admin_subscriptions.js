(function () {

  // ---- confirm on destructive forms ----
  document.addEventListener("submit", function (e) {
    const form = e.target.closest("form[data-confirm]");
    if (!form) return;
    if (!window.confirm(form.dataset.confirm || "Are you sure?")) e.preventDefault();
  });

  // ---- pagination state ----
  let currentPage = 1;

  // ---- render a single tbody row from a subscription object ----
  function renderRow(sub) {
    const statusBadge = sub.is_active
      ? `<span class="badge-pill badge-green">Active</span>`
      : `<span class="badge-pill badge-red">Inactive</span>`;

    const actionForm = sub.is_active
      ? `<form method="post" action="/admin/subscriptions/${sub.id}/deactivate/"
              data-confirm="Deactivate subscription #${sub.id}?" style="display:inline">
           <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrf()}" />
           <input type="hidden" name="subscription_id" value="${sub.id}" />
           <button class="btn btn-danger btn-xs" type="submit">Deactivate</button>
         </form>`
      : `<form method="post" action="/admin/subscriptions/${sub.id}/activate/"
              data-confirm="Activate subscription #${sub.id}?" style="display:inline">
           <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrf()}" />
           <input type="hidden" name="subscription_id" value="${sub.id}" />
           <button class="btn btn-primary btn-xs" type="submit">Activate</button>
         </form>`;

    return `<tr data-search="${escHtml(sub.user)} ${escHtml(sub.plan)}">
      <td class="mono small">${sub.id}</td>
      <td>${escHtml(sub.user)}</td>
      <td class="mono small">${escHtml(sub.plan)}</td>
      <td class="mono small muted">${escHtml(sub.started_at || "")}</td>
      <td class="mono small muted">${escHtml(sub.expires_at || "")}</td>
      <td>${statusBadge}</td>
      <td><div class="adm-row-actions">${actionForm}</div></td>
    </tr>`;
  }

  // ---- fetch a page and re-render table ----
  function loadPage(page) {
    const tbody = document.querySelector("#sub-table tbody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" class="muted small" style="padding:16px">Loading…</td></tr>`;

    fetch(`?load_js=1&page=${page}`)
      .then(r => r.json())
      .then(data => {
        currentPage = data.current_page;
        tbody.innerHTML = data.subscriptions.length
          ? data.subscriptions.map(renderRow).join("")
          : `<tr><td colspan="7" class="muted small" style="padding:16px">No subscriptions found.</td></tr>`;
        renderPagination(data);
        applySearch();
      })
      .catch(() => {
        tbody.innerHTML = `<tr><td colspan="7" class="muted small" style="padding:16px;color:#ff8a7a">Failed to load subscriptions.</td></tr>`;
      });
  }

  // ---- pagination controls ----
  function renderPagination(data) {
    let bar = document.getElementById("sub-pagination");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "sub-pagination";
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

  // ---- live search ----
  function applySearch() {
    const search = document.getElementById("sub-search");
    const table  = document.getElementById("sub-table");
    if (!search || !table) return;
    const q = search.value.trim().toLowerCase();
    table.querySelectorAll("tbody tr").forEach(row => {
      const text = (row.dataset.search || row.textContent).toLowerCase();
      row.classList.toggle("adm-hidden", q.length > 0 && !text.includes(q));
    });
  }

  const searchEl = document.getElementById("sub-search");
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
