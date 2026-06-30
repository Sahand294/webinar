(function () {

  // ================================================================
  //  SHARED: custom multi-select
  // ================================================================
  function initCatSelect(selectId, hiddenId, previewId, preselected) {
    const wrap    = document.getElementById(selectId);
    const hidden  = document.getElementById(hiddenId);
    const preview = previewId ? document.getElementById(previewId) : null;
    if (!wrap || !hidden) return;

    const trigger    = wrap.querySelector(".cat-select-trigger");
    const dropdown   = wrap.querySelector(".cat-select-dropdown");
    const tagsEl     = wrap.querySelector(".cat-select-tags");
    const checkboxes = [...wrap.querySelectorAll(".cat-option input[type='checkbox']")];

    // pre-select from existing value or checked state in HTML
    const ids = (preselected || "").split(",").map(s => s.trim()).filter(Boolean);
    checkboxes.forEach(cb => {
      if (ids.includes(String(cb.value).trim())) cb.checked = true;
    });

    function syncTags() {
      const selected = checkboxes.filter(cb => cb.checked);
      hidden.value   = selected.map(cb => cb.value).join(",");

      tagsEl.innerHTML = "";
      if (selected.length === 0) {
        tagsEl.innerHTML = '<span class="cat-select-placeholder">Select categories…</span>';
      } else {
        selected.forEach(cb => {
          const tag = document.createElement("span");
          tag.className = "cat-tag";
          tag.innerHTML = `${cb.dataset.name}<span class="cat-tag-remove" data-val="${cb.value}">×</span>`;
          tagsEl.appendChild(tag);
        });
      }

      if (preview) {
        preview.textContent = selected.length ? selected[0].dataset.name : "Live";
      }
    }

    function open()  { wrap.classList.add("open"); }
    function close() { wrap.classList.remove("open"); }
    function toggle(){ wrap.classList.contains("open") ? close() : open(); }

    trigger.addEventListener("click", toggle);
    trigger.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      if (e.key === "Escape") close();
    });
    document.addEventListener("click", e => { if (!wrap.contains(e.target)) close(); });
    dropdown.addEventListener("change", syncTags);
    tagsEl.addEventListener("click", e => {
      const btn = e.target.closest(".cat-tag-remove");
      if (!btn) return;
      const cb = checkboxes.find(c => String(c.value) === String(btn.dataset.val));
      if (cb) { cb.checked = false; syncTags(); }
    });

    syncTags();
  }

  // ================================================================
  //  SHARED: image upload dropzone
  //  prefix = id prefix, e.g. "f" -> #f-image-drop, #f-image, etc.
  // ================================================================
  function initImageDrop(prefix) {
    const drop      = document.getElementById(`${prefix}-image-drop`);
    const input     = document.getElementById(`${prefix}-image`);
    const empty     = document.getElementById(`${prefix}-image-empty`);
    const preview   = document.getElementById(`${prefix}-image-preview`);
    const previewEl = document.getElementById(`${prefix}-image-preview-img`);
    const removeBtn = document.getElementById(`${prefix}-image-remove`);
    if (!drop || !input) return;

    function showFile(file) {
      if (!file || !file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      previewEl.src = url;
      empty.hidden   = true;
      preview.hidden = false;
    }

    function clearFile() {
      input.value = "";
      previewEl.src = "";
      empty.hidden   = false;
      preview.hidden = true;
    }

    drop.addEventListener("click", (e) => {
      if (e.target.closest(".wc-image-remove")) return;
      input.click();
    });
    input.addEventListener("change", () => {
      if (input.files && input.files[0]) showFile(input.files[0]);
    });

    if (removeBtn) {
      removeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearFile();
      });
    }

    ["dragenter", "dragover"].forEach(evt => {
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.add("drag-over"); });
    });
    ["dragleave", "drop"].forEach(evt => {
      drop.addEventListener(evt, (e) => { e.preventDefault(); drop.classList.remove("drag-over"); });
    });
    drop.addEventListener("drop", (e) => {
      const file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (!file) return;
      input.files = e.dataTransfer.files;
      showFile(file);
    });
  }

  // ---- copy join link ----
  const copyBtn = document.getElementById("copy-btn");
  if (copyBtn) {
    copyBtn.addEventListener("click", async function () {
      const link = this.closest(".wd-join")?.querySelector("a")?.href || "";
      try {
        await navigator.clipboard.writeText(link);
        const prev = this.textContent;
        this.textContent = "Copied";
        setTimeout(() => (this.textContent = prev), 1400);
      } catch (e) { this.textContent = "Failed"; }
    });
  }

  // ---- delete confirm ----
  const deleteBtn = document.getElementById("delete-btn");
  if (deleteBtn) {
    deleteBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (window.confirm("Delete this webinar? This cannot be undone.")) {
        document.getElementById("delete-form").submit();
      }
    });
  }

  // ---- init edit page category select ----
  const fCatHidden = document.getElementById("f-category");
  if (fCatHidden) {
    initCatSelect("f-cat-select", "f-category", null, fCatHidden.value);
    initImageDrop("f");
  }

  // ---- edit modal open/close ----
  const fab         = document.getElementById("fab-create");
  const modal       = document.getElementById("create-modal");
  const modalClose  = document.getElementById("modal-close");
  const modalCancel = document.getElementById("modal-cancel");

  if (fab && modal) {
    let pickerReady = false;

    function openModal() {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";

      if (!pickerReady) {
        pickerReady = true;
        const selectedRaw = modal.dataset.selected || "";
        initCatSelect("m-cat-select", "m-category", null, selectedRaw);
        initImageDrop("m");
      }

      modal.querySelector("input, textarea")?.focus();
    }

    function closeModal() {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }

    fab.addEventListener("click", openModal);
    if (modalClose)  modalClose.addEventListener("click", closeModal);
    if (modalCancel) modalCancel.addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
    });
  }

})();
