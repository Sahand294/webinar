(function () {

    // ---- tab switching (reuses same pattern as account.js) ----
    const tabs = document.querySelectorAll(".acc-tab");
    const panels = document.querySelectorAll(".acc-panel");

    function activate(name) {
        tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === name));
        panels.forEach(p => p.classList.toggle("active", p.id === "tab-" + name));
        history.replaceState(null, "", "#" + name);
    }

    tabs.forEach(t => t.addEventListener("click", () => activate(t.dataset.tab)));

    const hash = (location.hash || "").replace("#", "");
    if (["users", "webinars", "subscriptions", "roles"].includes(hash)) activate(hash);


    // ---- confirm before any form with data-confirm ----
    document.addEventListener("submit", function (e) {
        const form = e.target.closest("form[data-confirm]");
        if (!form) return;
        const msg = form.dataset.confirm || "Are you sure?";
        if (!window.confirm(msg)) e.preventDefault();
    });


    // ---- inline edit toggle ----
    document.addEventListener("click", function (e) {
const pwdToggle = e.target.closest(".adm-pwd-toggle");
if (pwdToggle) {
  const field = document.getElementById(pwdToggle.dataset.target);
  const input = field.querySelector("input");
  input.disabled = !input.disabled;
  pwdToggle.textContent = input.disabled ? "Change password" : "Cancel";
}
        // open edit row
        const trigger = e.target.closest(".adm-edit-trigger");
        if (trigger) {
            const targetId = trigger.dataset.target;
            const block = document.getElementById(targetId);
            if (block) {
                const isOpen = block.style.display !== "none";
                block.style.display = isOpen ? "none" : "block";
                trigger.textContent = isOpen ? "Edit" : "Cancel";
            }
            return;
        }

        // cancel edit row
        const cancel = e.target.closest(".adm-edit-cancel");
        if (cancel) {
            const targetId = cancel.dataset.target;
            const block = document.getElementById(targetId);
            if (block) block.style.display = "none";
            // reset the matching trigger button text
            const trigger = document.querySelector(`.adm-edit-trigger[data-target="${targetId}"]`);
            if (trigger) trigger.textContent = "Edit";
        }

    });


    // ---- live table search ----
    function bindSearch(inputId, tableId) {
        const input = document.getElementById(inputId);
        const table = document.getElementById(tableId);
        if (!input || !table) return;

        input.addEventListener("input", function () {
            const q = this.value.trim().toLowerCase();
            table.querySelectorAll("tbody tr").forEach(row => {
                const text = (row.dataset.search || row.textContent).toLowerCase();
                row.classList.toggle("adm-hidden", q.length > 0 && !text.includes(q));
            });
        });
    }

    bindSearch("user-search", "user-table");
    bindSearch("webinar-search", "webinar-table");
    bindSearch("sub-search", "sub-table");
    bindSearch("role-search", "role-table");

})();
