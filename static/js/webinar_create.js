(function () {

  // ================================================================
  //  SHARED: custom multi-select
  //  selectId   = id of .cat-select wrapper
  //  hiddenId   = id of hidden input that gets comma-separated IDs
  //  previewId  = id of preview tag element (null to skip)
  //  preselected = comma-separated string of already-selected IDs
  // ================================================================
  function initCatSelect(selectId, hiddenId, previewId, preselected) {
    const wrap    = document.getElementById(selectId);
    const hidden  = document.getElementById(hiddenId);
    const preview = previewId ? document.getElementById(previewId) : null;
    if (!wrap || !hidden) return;

    const trigger  = wrap.querySelector(".cat-select-trigger");
    const dropdown = wrap.querySelector(".cat-select-dropdown");
    const tagsEl   = wrap.querySelector(".cat-select-tags");
    const checkboxes = [...wrap.querySelectorAll(".cat-option input[type='checkbox']")];

    // pre-select from existing value
    if (preselected) {
      const ids = preselected.split(",").map(s => s.trim()).filter(Boolean);
      checkboxes.forEach(cb => {
        if (ids.includes(String(cb.value).trim())) cb.checked = true;
      });
    }

    function syncTags() {
      const selected = checkboxes.filter(cb => cb.checked);
      const ids      = selected.map(cb => cb.value);
      hidden.value   = ids.join(",");

      // rebuild tag pills
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

      // update live preview tag
      if (preview) {
        preview.textContent = selected.length ? selected[0].dataset.name : "Live";
      }
    }

    // open / close
    function open()  { wrap.classList.add("open");    }
    function close() { wrap.classList.remove("open"); }
    function toggle(){ wrap.classList.contains("open") ? close() : open(); }

    trigger.addEventListener("click", toggle);
    trigger.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
      if (e.key === "Escape") close();
    });

    // close on outside click
    document.addEventListener("click", e => {
      if (!wrap.contains(e.target)) close();
    });

    // checkbox change
    dropdown.addEventListener("change", syncTags);

    // remove tag via × button (delegated)
    tagsEl.addEventListener("click", e => {
      const btn = e.target.closest(".cat-tag-remove");
      if (!btn) return;
      const cb = checkboxes.find(c => String(c.value) === String(btn.dataset.val));
      if (cb) { cb.checked = false; syncTags(); }
    });

    // init display
    syncTags();
  }

  // ---- init category select ----
  const existingVal = document.getElementById("wc-category")?.value || "";
  initCatSelect("wc-cat-select", "wc-category", "prev-category", existingVal);

  // ---- cover image upload ----
  const imgDrop      = document.getElementById("wc-image-drop");
  const imgInput     = document.getElementById("wc-image");
  const imgEmpty     = document.getElementById("wc-image-empty");
  const imgPreview   = document.getElementById("wc-image-preview");
  const imgPreviewEl = document.getElementById("wc-image-preview-img");
  const imgRemoveBtn = document.getElementById("wc-image-remove");

  const prevImage      = document.getElementById("prev-image");
  const prevImageEmpty = document.getElementById("prev-image-empty");

  function showImageFile(file) {
    if (!file || !file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);

    imgPreviewEl.src = url;
    imgEmpty.hidden   = true;
    imgPreview.hidden = false;

    prevImage.src    = url;
    prevImage.hidden = false;
    prevImageEmpty.hidden = true;
  }

  function clearImageFile() {
    imgInput.value = "";
    imgPreviewEl.src = "";
    imgEmpty.hidden   = false;
    imgPreview.hidden = true;

    prevImage.src     = "";
    prevImage.hidden  = true;
    prevImageEmpty.hidden = false;
  }

  imgDrop.addEventListener("click", (e) => {
    if (e.target.closest(".wc-image-remove")) return;
    imgInput.click();
  });
  imgInput.addEventListener("change", () => {
    if (imgInput.files && imgInput.files[0]) showImageFile(imgInput.files[0]);
  });

  imgRemoveBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    clearImageFile();
  });

  ["dragenter", "dragover"].forEach(evt => {
    imgDrop.addEventListener(evt, (e) => {
      e.preventDefault();
      imgDrop.classList.add("drag-over");
    });
  });
  ["dragleave", "drop"].forEach(evt => {
    imgDrop.addEventListener(evt, (e) => {
      e.preventDefault();
      imgDrop.classList.remove("drag-over");
    });
  });
  imgDrop.addEventListener("drop", (e) => {
    const file = e.dataTransfer.files && e.dataTransfer.files[0];
    if (!file) return;
    imgInput.files = e.dataTransfer.files;
    showImageFile(file);
  });

  // ---- live preview ----
  const prevTitle = document.getElementById("prev-title");
  const prevDesc  = document.getElementById("prev-desc");
  const prevPrice = document.getElementById("prev-price");
  const prevDate  = document.getElementById("prev-date");
  const inTitle   = document.getElementById("wc-title");
  const inDesc    = document.getElementById("wc-desc");
  const inPrice   = document.getElementById("wc-price");
  const inExpires = document.getElementById("wc-expires");

  function updatePreview() {
    const titleVal = inTitle.value.trim();
    prevTitle.textContent = titleVal || "Your webinar title";
    prevTitle.classList.toggle("prev-placeholder", !titleVal);

    const descVal = inDesc.value.trim();
    prevDesc.textContent = descVal
      ? (descVal.length > 100 ? descVal.slice(0, 100) + "…" : descVal)
      : "Your description will appear here…";

    const priceVal = parseFloat(inPrice.value);
    if (!inPrice.value.trim() || priceVal === 0) {
      prevPrice.textContent = "Free"; prevPrice.className = "price free";
    } else {
      prevPrice.textContent = "$" + priceVal.toFixed(2).replace(/\.00$/, "");
      prevPrice.className = "price";
    }

    if (inExpires.value) {
      const d = new Date(inExpires.value);
      prevDate.textContent = d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
    } else {
      prevDate.textContent = "—";
    }
  }

  inTitle.addEventListener("input", updatePreview);
  inDesc.addEventListener("input", updatePreview);
  inPrice.addEventListener("input", updatePreview);
  inExpires.addEventListener("input", updatePreview);

  // ---- client-side validation ----
  const form      = document.getElementById("createForm");
  const errEl     = document.getElementById("formError");
  const submitBtn = document.getElementById("submit-btn");

  form.addEventListener("submit", function (e) {
    errEl.textContent = "";
    const title   = inTitle.value.trim();
    const desc    = inDesc.value.trim();
    const expires = inExpires.value;
    const stock   = parseInt(document.getElementById("wc-stock").value, 10);
    const price   = parseFloat(inPrice.value);
    const link    = document.getElementById("wc-link").value.trim();

    if (!title)   { e.preventDefault(); errEl.textContent = "A title is required."; inTitle.focus(); return; }
    if (!desc)    { e.preventDefault(); errEl.textContent = "Please add a description."; inDesc.focus(); return; }
    if (!expires) { e.preventDefault(); errEl.textContent = "Set a ticket expiration date."; inExpires.focus(); return; }
    if (new Date(expires) <= new Date()) { e.preventDefault(); errEl.textContent = "Expiration date must be in the future."; inExpires.focus(); return; }
    if (isNaN(stock) || stock < 1) { e.preventDefault(); errEl.textContent = "Tickets available must be at least 1."; document.getElementById("wc-stock").focus(); return; }
    if (!isNaN(price) && price < 0) { e.preventDefault(); errEl.textContent = "Price cannot be negative."; inPrice.focus(); return; }
    if (link && !/^https?:\/\/.+/.test(link)) { e.preventDefault(); errEl.textContent = "Join link must start with http:// or https://"; document.getElementById("wc-link").focus(); return; }

    submitBtn.disabled = true;
    submitBtn.textContent = "Publishing…";
  });

})();