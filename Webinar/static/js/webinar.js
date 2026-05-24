(function () {
  const root = document.getElementById("root");
  let w = window.__WEBINAR__;
  const role = (window.__ROLE__ || "").toUpperCase(); // "" | "PARTICIPANT" | "HOST"

  if (!w) {
    root.innerHTML = `
      <div class="empty">
        <h3>Webinar not found.</h3>
        <p class="muted">It may have ended or been moved.</p>
        <p style="margin-top:18px"><a class="btn btn-primary" href="{% url "webinars" %}}">Browse all webinars →</a></p>
      </div>`;
    return;
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
  const attr = (s) => String(s ?? "").replace(/"/g, "&quot;");

  function fmtDate(iso) {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d)) return esc(iso);
    return d.toLocaleString(undefined, {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit"
    });
  }

  function render() {
    document.title = `${w.title} — Signal.live`;
    const canSeeLink = role === "HOST" || role === "PARTICIPANT";
    const priceTxt = Number(w.price) === 0
      ? `<span class="price-free">Free</span>`
      : `$${esc(w.price)}`;

    const joinBlock = canSeeLink
      ? `<div class="wd-join">
           <a href="${attr(w.link)}" target="_blank" rel="noopener">${esc(w.link || "(no link set)")}</a>
           <button class="wd-copy" id="copy-btn" type="button">Copy</button>
         </div>`
      : `<div class="wd-join locked" aria-live="polite">🔒 Reserve a seat to reveal the join link</div>`;

    const actions =
      role === "HOST"
        ? `<button class="btn btn-primary" id="edit-btn" type="button">Edit webinar</button>
           <button class="btn btn-ghost" id="delete-btn" type="button">Delete</button>`
        : role === "PARTICIPANT"
          ? `<span class="success-inline">✓ You're signed up</span>`
          : (Number(w.stock) <= 0
              ? `<button class="btn btn-primary" disabled>Sold out of tickets</button>`
              : `<button class="btn btn-primary" id="signup-btn" type="button">Reserve a seat →</button>`);

    root.innerHTML = `
      <a class="wd-back" href="./webinars.html">← All webinars</a>

      <div class="wd-shell">
        <figure class="wd-media">
          <span class="badge"><i></i>Live webinar</span>
          <img src="${attr(w.image)}" alt="${attr(w.title)}" loading="eager" />
        </figure>

        <article class="wd-card">
          <header class="wd-head">
            ${role === "HOST"
              ? `<span class="tag wd-host-tag" style="background: color-mix(in oklab, var(--primary) 28%, transparent)">You host this</span>`
              : `<span class="tag wd-host-tag">Upcoming session</span>`}
            <h1 class="wd-title">${esc(w.title)}</h1>
            <p class="wd-lead">${esc(w.description)}</p>
          </header>

          <dl class="wd-rows">
            <div class="wd-row"><dt>Host</dt><dd>${esc(w.hostName)}</dd></div>
            <div class="wd-row"><dt>Expires</dt>
              <dd><time class="mono" datetime="${attr(w.expiresAt)}">${fmtDate(w.expiresAt)}</time></dd>
            </div>
            <div class="wd-row"><dt>Seats left</dt>
              <dd><span class="seats-num">${esc(w.stock)}</span></dd>
            </div>
            <div class="wd-row"><dt>Price</dt><dd>${priceTxt}</dd></div>
            <div class="wd-row"><dt>Join link</dt><dd>${joinBlock}</dd></div>
          </dl>

          <div class="wd-actions">${actions}</div>
        </article>
      </div>`;

    bind();
  }

  function bind() {
    const $ = (id) => document.getElementById(id);
    if ($("edit-btn")) $("edit-btn").onclick = renderEdit;
    if ($("delete-btn")) $("delete-btn").onclick = () => {
      if (confirm("Delete this webinar? This cannot be undone.")) {
        // hook into your store / form post here
        location.href = "./webinars.html";
      }
    };
    if ($("signup-btn")) $("signup-btn").onclick = () => {
      // hook into your reserve flow here
      alert("Reserved! (wire this to your backend)");
    };
    if ($("copy-btn")) $("copy-btn").onclick = async () => {
      try {
        await navigator.clipboard.writeText(w.link || "");
        const b = $("copy-btn");
        const prev = b.textContent;
        b.textContent = "Copied";
        setTimeout(() => (b.textContent = prev), 1400);
      } catch {}
    };
  }

  function renderEdit() {
    root.innerHTML = `
      <a class="wd-back" href="{% url "webinars" %}">← All webinars</a>
      <form class="wd-card" id="edit-form" method="post" style="max-width:780px">
        {% csrf_token %}
        <input name="edit" value="yes">
        <h2 class="wd-title" style="font-size:36px">Edit webinar</h2>

        <div class="field"><label>Title</label>
          <input name="title" value="${attr(w.title)}" required />
        </div>
        <div class="field"><label>Host name</label>
          <input name="hostName" value="${attr(w.hostName)}" required />
        </div>
        <div class="field"><label>Description</label>
          <textarea name="description" required>${esc(w.description)}</textarea>
        </div>
        <div class="field"><label>Image URL</label>
          <input name="image" value="${attr(w.image)}" placeholder="https://..." />
        </div>
        <div class="field-row">
          <div class="field"><label>Ticket expiration</label>
            <input name="expiresAt" type="datetime-local"
              value="${attr((w.expiresAt || '').slice(0,16))}" />
          </div>
          <div class="field"><label>Tickets left</label>
            <input name="stock" type="number" min="0" value="${attr(w.stock)}" />
          </div>
        </div>
        <div class="field"><label>Hidden join link</label>
          <input name="link" value="${attr(w.link || '')}" placeholder="https://..." />
        </div>

        <div class="wd-actions">
          <button type="submit" class="btn btn-primary">Save changes</button>
          <button type="button" class="btn btn-ghost" id="cancel-btn">Cancel</button>
        </div>
      </form>`;

    document.getElementById("cancel-btn").onclick = render;
    document.getElementById("edit-form").onsubmit = (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      w = Object.assign({}, w, {
        title: fd.get("title"),
        hostName: fd.get("hostName"),
        description: fd.get("description"),
        image: fd.get("image"),
        expiresAt: fd.get("expiresAt"),
        stock: Number(fd.get("stock")) || 0,
        link: fd.get("link"),
      });
      window.__WEBINAR__ = w;
      render();
    };
  }

  render();
})();
