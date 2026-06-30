document.querySelectorAll("a#delete").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    e.preventDefault();
    const title = this.closest(".w-card")?.querySelector("h3")?.textContent?.trim() || "this webinar";
    const confirmed = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (confirmed) {
      window.location.href = this.href;
    }
  });
});
(function () {
  const tabs = document.querySelectorAll(".acc-tab");
  const panels = document.querySelectorAll(".acc-panel");

  function activate(name) {
    tabs.forEach((t) => t.classList.toggle("active", t.dataset.tab === name));
    panels.forEach((p) => p.classList.toggle("active", p.id === "tab-" + name));
    history.replaceState(null, "", "#" + name);
  }

  tabs.forEach((t) => t.addEventListener("click", () => activate(t.dataset.tab)));

  // Deep-link via hash
  const hash = (location.hash || "").replace("#", "");
  if (["joined", "hosted", "profile"].includes(hash)) activate(hash);

  // Client-side password match check
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    const err = document.getElementById("profileError");
    err.textContent = "";

    const newPwd = form.new_password?.value || "";
    const confirm = form.confirm_password?.value || "";
    const current = form.current_password?.value || "";

    if (newPwd || confirm || current) {
      if (!current) {
        e.preventDefault();
        err.textContent = "Enter your current password to change it.";
        return;
      }
      if (newPwd.length < 8) {
        e.preventDefault();
        err.textContent = "New password must be at least 8 characters.";
        return;
      }
      if (newPwd !== confirm) {
        e.preventDefault();
        err.textContent = "New passwords do not match.";
        return;
      }
    }

    const email = form.email.value.trim();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      e.preventDefault();
      err.textContent = "Please enter a valid email.";
    }
  });
})();
