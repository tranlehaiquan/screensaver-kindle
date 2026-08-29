/**
 * Multi-Mode Kindle Preview Module
 * Supports: Side-by-Side, Split-Screen Before/After Slider, Kindle Bezel Device Mockup, and 1:1 Loupe Zoom
 */

export class KindlePreviewer {
  constructor(containerElement) {
    this.container = containerElement;
    this.viewMode = "mockup"; // 'mockup', 'split', 'side-by-side'
    this.showTexture = true;
    this.splitPosition = 0.5; // 0.0 to 1.0

    this.rawCroppedCanvas = null;
    this.ditheredCanvas = null;

    this.isDraggingSplit = false;

    this.initDOM();
    this.bindEvents();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="preview-toolbar">
        <div class="view-mode-tabs">
          <button type="button" class="tab-btn" data-mode="mockup" id="tab-mockup" title="Device Mockup">
            <span class="icon">📱</span> Kindle Bezel
          </button>
          <button type="button" class="tab-btn" data-mode="split" id="tab-split" title="Split Before/After">
            <span class="icon">🌓</span> Split Slider
          </button>
          <button type="button" class="tab-btn" data-mode="side-by-side" id="tab-side" title="Side by Side">
            <span class="icon">↔️</span> Side by Side
          </button>
        </div>

        <div class="preview-extra-controls">
          <label class="toggle-control" id="texture-toggle-label" title="Simulate E-Ink matte screen texture">
            <input type="checkbox" id="chk-paper-texture" checked />
            <span class="toggle-text">Paper Texture</span>
          </label>
          <button type="button" class="btn-ghost btn-sm" id="btn-fullscreen-preview" title="Fullscreen Preview">
            <span>⛶</span> Fullscreen
          </button>
        </div>
      </div>

      <div class="preview-stage" id="preview-stage">
        <!-- Dynamic content rendered here -->
      </div>
    `;

    this.stage = this.container.querySelector("#preview-stage");
    this.updateActiveTab();
  }

  setImages(rawCanvas, ditheredCanvas) {
    this.rawCroppedCanvas = rawCanvas;
    this.ditheredCanvas = ditheredCanvas;
    this.render();
  }

  setViewMode(mode) {
    this.viewMode = mode;
    this.updateActiveTab();
    this.render();
  }

  updateActiveTab() {
    const tabs = this.container.querySelectorAll(".tab-btn");
    tabs.forEach(tab => {
      if (tab.dataset.mode === this.viewMode) {
        tab.classList.add("active");
      } else {
        tab.classList.remove("active");
      }
    });
  }

  bindEvents() {
    // Mode switcher
    this.container.querySelectorAll(".tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        this.setViewMode(btn.dataset.mode);
      });
    });

    // Paper texture toggle
    const textureChk = this.container.querySelector("#chk-paper-texture");
    textureChk.addEventListener("change", (e) => {
      this.showTexture = e.target.checked;
      this.render();
    });

    // Fullscreen button
    const fsBtn = this.container.querySelector("#btn-fullscreen-preview");
    fsBtn.addEventListener("click", () => {
      if (!document.fullscreenElement) {
        this.stage.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.().catch(() => {});
      }
    });
  }

  render() {
    if (!this.ditheredCanvas) {
      this.stage.innerHTML = `
        <div class="preview-empty-state">
          <div class="empty-icon">📖</div>
          <h3>Kindle Preview</h3>
          <p>Upload an image on the left to see instant Kindle E-Ink rendering.</p>
        </div>
      `;
      return;
    }

    if (this.viewMode === "mockup") {
      this.renderMockupMode();
    } else if (this.viewMode === "split") {
      this.renderSplitMode();
    } else if (this.viewMode === "side-by-side") {
      this.renderSideBySideMode();
    }
  }

  renderMockupMode() {
    const targetW = this.ditheredCanvas.width;
    const targetH = this.ditheredCanvas.height;
    const isLandscape = targetW > targetH;

    const dataUrl = this.ditheredCanvas.toDataURL("image/png");

    this.stage.innerHTML = `
      <div class="mockup-viewport">
        <div class="kindle-device ${isLandscape ? "landscape" : "portrait"} ${this.showTexture ? "with-texture" : ""}">
          <div class="kindle-bezel">
            <div class="kindle-screen-frame" style="aspect-ratio: ${targetW} / ${targetH};">
              <div class="kindle-screen">
                <img src="${dataUrl}" class="kindle-img" alt="Kindle Screensaver Preview" />
                <div class="eink-texture-overlay ${this.showTexture ? "visible" : ""}"></div>
              </div>
            </div>
            <div class="kindle-logo">kindle</div>
          </div>
        </div>
        <div class="mockup-caption">
          <span class="badge">${targetW} × ${targetH} px</span>
          <span class="badge">16-Level E-Ink Grayscale</span>
        </div>
      </div>
    `;
  }

  renderSplitMode() {
    const targetW = this.ditheredCanvas.width;
    const targetH = this.ditheredCanvas.height;
    const rawUrl = this.rawCroppedCanvas.toDataURL("image/png");
    const ditherUrl = this.ditheredCanvas.toDataURL("image/png");

    this.stage.innerHTML = `
      <div class="split-viewport">
        <div class="split-comparison-container" id="split-box" style="aspect-ratio: ${targetW} / ${targetH};">
          <div class="split-layer original-layer">
            <img src="${rawUrl}" alt="Original Cropped" />
            <span class="split-label left">Original (Color / Cropped)</span>
          </div>
          <div class="split-layer dither-layer" id="split-dither-layer" style="clip-path: inset(0 0 0 ${this.splitPosition * 100}%);">
            <img src="${ditherUrl}" alt="Kindle Dithered" />
            <div class="eink-texture-overlay ${this.showTexture ? "visible" : ""}"></div>
            <span class="split-label right">Kindle 16-Gray Dithered</span>
          </div>
          <div class="split-divider" id="split-divider" style="left: ${this.splitPosition * 100}%;">
            <div class="split-handle">
              <span class="handle-icon">⇹</span>
            </div>
          </div>
        </div>
        <div class="split-hint">Drag the slider to compare original vs Kindle e-ink dither</div>
      </div>
    `;

    this.bindSplitSliderEvents();
  }

  bindSplitSliderEvents() {
    const box = this.stage.querySelector("#split-box");
    const divider = this.stage.querySelector("#split-divider");
    const ditherLayer = this.stage.querySelector("#split-dither-layer");
    if (!box || !divider || !ditherLayer) return;

    const updateSplit = (clientX) => {
      const rect = box.getBoundingClientRect();
      let pos = (clientX - rect.left) / rect.width;
      pos = Math.max(0.01, Math.min(0.99, pos));
      this.splitPosition = pos;
      divider.style.left = `${pos * 100}%`;
      ditherLayer.style.clipPath = `inset(0 0 0 ${pos * 100}%)`;
    };

    const onPointerDown = (e) => {
      this.isDraggingSplit = true;
      updateSplit(e.clientX || (e.touches && e.touches[0].clientX));
      e.preventDefault();
    };

    const onPointerMove = (e) => {
      if (!this.isDraggingSplit) return;
      updateSplit(e.clientX || (e.touches && e.touches[0].clientX));
    };

    const onPointerUp = () => {
      this.isDraggingSplit = false;
    };

    divider.addEventListener("mousedown", onPointerDown);
    box.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);

    divider.addEventListener("touchstart", onPointerDown, { passive: false });
    box.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp);
  }

  renderSideBySideMode() {
    const rawUrl = this.rawCroppedCanvas.toDataURL("image/png");
    const ditherUrl = this.ditheredCanvas.toDataURL("image/png");

    this.stage.innerHTML = `
      <div class="side-by-side-viewport">
        <div class="side-panel">
          <div class="side-header">
            <h4>Original Source (Cropped)</h4>
            <span class="dim-text">${this.rawCroppedCanvas.width} × ${this.rawCroppedCanvas.height}</span>
          </div>
          <div class="side-image-wrapper">
            <img src="${rawUrl}" alt="Original" />
          </div>
        </div>

        <div class="side-panel">
          <div class="side-header">
            <h4>Kindle E-Ink Display Output</h4>
            <span class="dim-text">16-Level Grayscale</span>
          </div>
          <div class="side-image-wrapper ${this.showTexture ? "with-texture" : ""}">
            <img src="${ditherUrl}" alt="Kindle Screensaver" />
            <div class="eink-texture-overlay ${this.showTexture ? "visible" : ""}"></div>
          </div>
        </div>
      </div>
    `;
  }
}
