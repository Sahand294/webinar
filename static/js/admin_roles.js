(function () {

  // ---- confirm on destructive forms ----
  document.addEventListener("submit", function (e) {
    const form = e.target.closest("form[data-confirm]");
    if (!form) return;
    if (!window.confirm(form.dataset.confirm || "Are you sure?")) e.preventDefault();
  });

  // ---- pagination state ----
  let currentPage = 1;

  // ---- render a single tbody row from a webinar_user object ----
  function renderRow(wu) {
    let roleBadge;
    if (wu.role === "HOST") {
      roleBadge = `<span class="badge-pill badge-primary">Host</span>`;
    } else if (wu.role === "PARTICIPANT") {
      roleBadge = `<span class="badge-pill badge-green">Participant</span>`;
    } else {
      roleBadge = `<span class="badge-pill badge-muted">${escHtml(wu.role)}</span>`;
    }

    const action = wu.role !== "PARTICIPANT"
      ? `<form method="post" action="/admin/roles/${wu.id}/set-participant/"
              data-confirm="Set ${escHtml(wu.user)} as PARTICIPANT for ${escHtml(wu.webinar)}?"
              style="display:inline">
           <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrf()}" />
           <input type="hidden" name="webinar_user_id" value="${wu.id}" />
           <button class="btn btn-primary btn-xs" type="submit">→ Participant</button>
         </form>`
      : `<span class="muted small">Already participant</span>`;

    return `<tr data-search="${escHtml(wu.user)} ${escHtml(wu.webinar)}">
      <td class="mono small">${wu.id}</td>
      <td>${escHtml(wu.user)}</td>
      <td class="muted small">${escHtml(wu.webinar)}</td>
      <td>${roleBadge}</td>
      <td><div class="adm-row-actions">${action}</div></td>
    </tr>`;
  }

  // ---- fetch a page and re-render table ----
  function loadPage(page) {
    const tbody = document.querySelector("#role-table tbody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" class="muted small" style="padding:16px">Loading…</td></tr>`;

    fetch(`?load_js=1&page=${page}`)
      .then(r => r.json())
      .then(data => {
        currentPage = data.current_page;
        tbody.innerHTML = data.webinar_users.length
          ? data.webinar_users.map(renderRow).join("")
          : `<tr><td colspan="5" class="muted small" style="padding:16px">No entries found.</td></tr>`;
        renderPagination(data);
        applySearch();
      })
      .catch(() => {
        tbody.innerHTML = `<tr><td colspan="5" class="muted small" style="padding:16px;color:#ff8a7a">Failed to load roles.</td></tr>`;
      });
  }

  // ---- pagination controls ----
  function renderPagination(data) {
    let bar = document.getElementById("role-pagination");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "role-pagination";
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
    const search = document.getElementById("role-search");
    const table  = document.getElementById("role-table");
    if (!search || !table) return;
    const q = search.value.trim().toLowerCase();
    table.querySelectorAll("tbody tr").forEach(row => {
      const text = (row.dataset.search || row.textContent).toLowerCase();
      row.classList.toggle("adm-hidden", q.length > 0 && !text.includes(q));
    });
  }

  const searchEl = document.getElementById("role-search");
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
