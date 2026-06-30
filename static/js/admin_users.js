(function () {

  // ---- confirm on destructive forms ----
  document.addEventListener("submit", function (e) {
    const form = e.target.closest("form[data-confirm]");
    if (!form) return;
    if (!window.confirm(form.dataset.confirm || "Are you sure?")) e.preventDefault();
  });

  // ---- inline edit / cancel toggle ----
  document.addEventListener("click", function (e) {

    const trigger = e.target.closest(".adm-edit-trigger");
    if (trigger) {
      const block = document.getElementById(trigger.dataset.target);
      if (!block) return;
      const isOpen = block.style.display !== "none";
      block.style.display = isOpen ? "none" : "block";
      trigger.textContent = isOpen ? "Edit" : "Cancel";
      return;
    }

    const cancel = e.target.closest(".adm-edit-cancel");
    if (cancel) {
      const block = document.getElementById(cancel.dataset.target);
      if (block) block.style.display = "none";
      const trig = document.querySelector(`.adm-edit-trigger[data-target="${cancel.dataset.target}"]`);
      if (trig) trig.textContent = "Edit";
      return;
    }

    const pwdToggle = e.target.closest(".adm-pwd-toggle");
    if (pwdToggle) {
      const field = document.getElementById(pwdToggle.dataset.target);
      const input = field.querySelector("input");
      const isOpen = field.style.display !== "none";
      field.style.display = isOpen ? "none" : "block";
      input.disabled = isOpen;
      pwdToggle.textContent = input.disabled ? "Change password" : "Password unlocked";
    }

  });

  // ---- pagination state ----
  let currentPage = 1;

  // ---- render a single tbody row from a user object ----
  function renderRow(u) {
    const staffBadge = u.is_staff
      ? `<span class="badge-pill badge-green">Staff</span>`
      : `<span class="badge-pill badge-muted">User</span>`;

    const editForm = `
      <div class="adm-inline-edit" id="edit-user-${u.id}" style="display:none">
        <form class="adm-form adm-form-compact" method="post"
              action="/admin/users/${u.id}/edit/"
              data-confirm="Save changes to ${escHtml(u.username)}?">
          <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrf()}" />
          <input type="hidden" name="action" value="edit_user" />
          <input type="hidden" name="user_id" value="${u.id}" />
          <div class="field-row">
            <div class="field"><label>First name</label>
              <input name="first_name" type="text" value="${escHtml(u.first_name)}" required /></div>
            <div class="field"><label>Last name</label>
              <input name="last_name" type="text" value="${escHtml(u.last_name)}" required /></div>
          </div>
          <div class="field-row">
            <div class="field"><label>Username</label>
              <input name="username" type="text" value="${escHtml(u.username)}" required /></div>
            <div class="field"><label>Email</label>
              <input name="email" type="email" value="${escHtml(u.email)}" required /></div>
          </div>
          <div class="field-row">
            <div class="field" id="pwd-field-${u.id}" style="display:none">
              <label>New password</label>
              <input name="password" type="password" placeholder="••••••••" disabled />
            </div>
            <div class="field" style="justify-content:flex-end">
              <button type="button" class="btn btn-ghost btn-xs adm-pwd-toggle"
                      data-target="pwd-field-${u.id}">Change password</button>
            </div>
            <div class="field"><label>Role</label>
              <select name="is_staff">
                <option value="0" ${!u.is_staff ? "selected" : ""}>User</option>
                <option value="1" ${u.is_staff  ? "selected" : ""}>Staff / Admin</option>
              </select></div>
          </div>
          <p style="min-height:18px;font-size:13px;color:#ff8a7a;" aria-live="polite"></p>
          <div class="adm-form-actions">
            <button class="btn btn-primary btn-sm" type="submit">Save →</button>
            <button class="btn btn-ghost btn-sm adm-edit-cancel"
                    data-target="edit-user-${u.id}" type="button">Cancel</button>
          </div>
        </form>
      </div>`;

    return `<tr data-search="${escHtml(u.first_name)} ${escHtml(u.last_name)} ${escHtml(u.username)} ${escHtml(u.email)}">
      <td class="mono small">${u.id}</td>
      <td>${escHtml(u.first_name)} ${escHtml(u.last_name)}</td>
      <td class="mono small">${escHtml(u.username)}</td>
      <td class="muted small">${escHtml(u.email)}</td>
      <td>${staffBadge}</td>
      <td>
        <div class="adm-row-actions">
          <button class="btn btn-ghost btn-xs adm-edit-trigger"
                  data-target="edit-user-${u.id}">Edit</button>
          <form method="post" action="/admin/users/${u.id}/delete/"
                data-confirm="Permanently delete ${escHtml(u.username)}? This cannot be undone."
                style="display:inline">
            <input type="hidden" name="csrfmiddlewaretoken" value="${getCsrf()}" />
            <input type="hidden" name="action" value="delete_user" />
            <input type="hidden" name="user_id" value="${u.id}" />
            <button class="btn btn-danger btn-xs" type="submit">Delete</button>
          </form>
        </div>
        ${editForm}
      </td>
    </tr>`;
  }

  // ---- fetch a page and re-render table ----
  function loadPage(page) {
    const tbody = document.querySelector("#user-table tbody");
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="muted small" style="padding:16px">Loading…</td></tr>`;

    fetch(`?load_js=1&page=${page}`)
      .then(r => r.json())
      .then(data => {
        currentPage = data.current_page;
        tbody.innerHTML = data.users.length
          ? data.users.map(renderRow).join("")
          : `<tr><td colspan="6" class="muted small" style="padding:16px">No users found.</td></tr>`;
        renderPagination(data);
        applySearch();
      })
      .catch(() => {
        tbody.innerHTML = `<tr><td colspan="6" class="muted small" style="padding:16px;color:#ff8a7a">Failed to load users.</td></tr>`;
      });
  }

  // ---- pagination controls ----
  function renderPagination(data) {
    let bar = document.getElementById("user-pagination");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "user-pagination";
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
    const search = document.getElementById("user-search");
    const table  = document.getElementById("user-table");
    if (!search || !table) return;
    const q = search.value.trim().toLowerCase();
    table.querySelectorAll("tbody tr").forEach(row => {
      const text = (row.dataset.search || row.textContent).toLowerCase();
      row.classList.toggle("adm-hidden", q.length > 0 && !text.includes(q));
    });
  }

  const searchEl = document.getElementById("user-search");
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
