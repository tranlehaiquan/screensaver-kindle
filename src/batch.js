/**
 * Batch Image Queue & ZIP Exporter
 */
import JSZip from "jszip";
import confetti from "canvas-confetti";
import { processEInkImage } from "./ditherEngine.js";

export class BatchManager {
  constructor(containerElement, onSelectImageCallback) {
    this.container = containerElement;
    this.onSelectImage = onSelectImageCallback;
    this.items = []; // array of { id, name, originalFileOrUrl, thumbnailDataUrl, cropperState }
    this.activeId = null;

    this.initDOM();
  }

  initDOM() {
    this.container.innerHTML = `
      <div class="batch-panel-header">
        <div class="batch-title-group">
          <span class="batch-title">Image Queue</span>
          <span class="badge" id="batch-count">0 images</span>
        </div>
        <div class="batch-actions">
          <label class="btn-ghost btn-sm btn-upload-more" title="Add more images to queue">
            <span>➕</span> Add Images
            <input type="file" id="batch-file-input" multiple accept="image/*" style="display:none;" />
          </label>
          <button type="button" class="btn-primary btn-sm" id="btn-export-zip" disabled>
            <span>📦</span> Export ZIP Pack
          </button>
        </div>
      </div>

      <div class="batch-thumbnails-scroll" id="batch-thumbnails-container">
        <div class="batch-empty-notice">
          <span>Drop multiple images here or choose from samples to create a screensaver pack.</span>
        </div>
      </div>
    `;

    this.container.querySelector("#batch-file-input").addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.addFiles(Array.from(e.target.files));
      }
    });

    this.container.querySelector("#btn-export-zip").addEventListener("click", () => {
      this.exportZip();
    });
  }

  async addImage(name, source) {
    const id = "img_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    
    // Generate small thumbnail
    const thumbUrl = await this.generateThumbnail(source);

    const item = {
      id,
      name: name.replace(/\.[^/.]+$/, ""), // strip extension
      source,
      thumbnailUrl: thumbUrl
    };

    this.items.push(item);
    this.render();

    // If first item, activate it
    if (this.items.length === 1) {
      this.selectItem(item.id);
    }
  }

  async addFiles(files) {
    for (const file of files) {
      await this.addImage(file.name, file);
    }
  }

  generateThumbnail(source) {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const c = document.createElement("canvas");
        const ctx = c.getContext("2d");
        const maxThumb = 80;
        const scale = Math.min(maxThumb / img.width, maxThumb / img.height);
        c.width = Math.max(1, Math.round(img.width * scale));
        c.height = Math.max(1, Math.round(img.height * scale));
        ctx.drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = () => resolve("");

      if (typeof source === "string") {
        img.src = source;
      } else if (source instanceof Blob || source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.readAsDataURL(source);
      }
    });
  }

  selectItem(id) {
    this.activeId = id;
    const item = this.items.find(i => i.id === id);
    if (item && this.onSelectImage) {
      this.onSelectImage(item);
    }
    this.render();
  }

  removeItem(id, e) {
    if (e) e.stopPropagation();
    const idx = this.items.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.items.splice(idx, 1);
      if (this.activeId === id) {
        if (this.items.length > 0) {
          this.selectItem(this.items[Math.max(0, idx - 1)].id);
        } else {
          this.activeId = null;
          if (this.onSelectImage) this.onSelectImage(null);
        }
      }
      this.render();
    }
  }

  render() {
    const list = this.container.querySelector("#batch-thumbnails-container");
    const countBadge = this.container.querySelector("#batch-count");
    const zipBtn = this.container.querySelector("#btn-export-zip");

    countBadge.textContent = `${this.items.length} image${this.items.length === 1 ? "" : "s"}`;
    zipBtn.disabled = this.items.length === 0;

    if (this.items.length === 0) {
      list.innerHTML = `
        <div class="batch-empty-notice">
          <span>Drop multiple images here or choose from samples to create a screensaver pack.</span>
        </div>
      `;
      return;
    }

    list.innerHTML = this.items.map((item, index) => `
      <div class="batch-card ${item.id === this.activeId ? "active" : ""}" data-id="${item.id}" title="${item.name}">
        <div class="batch-card-index">${index + 1}</div>
        <img src="${item.thumbnailUrl}" class="batch-card-img" alt="${item.name}" />
        <span class="batch-card-name">${item.name}</span>
        <button type="button" class="btn-batch-remove" data-id="${item.id}" title="Remove image">✕</button>
      </div>
    `).join("");

    list.querySelectorAll(".batch-card").forEach(card => {
      card.addEventListener("click", () => this.selectItem(card.dataset.id));
    });

    list.querySelectorAll(".btn-batch-remove").forEach(btn => {
      btn.addEventListener("click", (e) => this.removeItem(btn.dataset.id, e));
    });
  }

  /**
   * Process all images in the queue with the provided generator function
   */
  async exportZip(settingsGetter) {
    if (this.items.length === 0) return;

    const zip = new JSZip();
    const zipFolder = zip.folder("kindle_screensavers");

    // Modal progress dialog
    const progressModal = document.createElement("div");
    progressModal.className = "modal-backdrop";
    progressModal.innerHTML = `
      <div class="modal-card modal-progress">
        <h3>Generating Kindle Screensaver Pack</h3>
        <p id="zip-status-text">Processing image 1 of ${this.items.length}...</p>
        <div class="progress-bar-track">
          <div class="progress-bar-fill" id="zip-progress-fill" style="width: 0%;"></div>
        </div>
      </div>
    `;
    document.body.appendChild(progressModal);

    const statusText = progressModal.querySelector("#zip-status-text");
    const progressFill = progressModal.querySelector("#zip-progress-fill");

    try {
      const getSettings = window.__getKindleExportSettings || (() => ({}));
      const settings = getSettings();
      const targetW = settings.targetWidth || 1072;
      const targetH = settings.targetHeight || 1448;

      for (let i = 0; i < this.items.length; i++) {
        const item = this.items[i];
        statusText.textContent = `Processing image ${i + 1} of ${this.items.length}: "${item.name}"...`;
        progressFill.style.width = `${((i + 0.5) / this.items.length) * 100}%`;

        // Render full image into offscreen canvas
        const img = await this.loadImageElement(item.source);
        const canvas = document.createElement("canvas");
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext("2d");

        // Fit cover
        const imgAspect = img.width / img.height;
        const targetAspect = targetW / targetH;
        let sW, sH, sX, sY;

        if (imgAspect > targetAspect) {
          sH = img.height;
          sW = sH * targetAspect;
          sX = (img.width - sW) / 2;
          sY = 0;
        } else {
          sW = img.width;
          sH = sW / targetAspect;
          sX = 0;
          sY = (img.height - sH) / 2;
        }

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, sX, sY, sW, sH, 0, 0, targetW, targetH);

        // Process with Dither Engine
        const rawData = ctx.getImageData(0, 0, targetW, targetH);
        const einkData = processEInkImage(rawData, settings);
        ctx.putImageData(einkData, 0, 0);

        // Convert to Blob
        const blob = await new Promise(res => canvas.toBlob(res, "image/png"));
        
        // Use standard linkss naming (bg_ss00.png, bg_ss01.png) and descriptive name
        const padIndex = String(i).padStart(2, "0");
        const filename = `bg_ss${padIndex}_${item.name.replace(/[^a-z0-9_-]/gi, "_")}.png`;
        zipFolder.file(filename, blob);

        progressFill.style.width = `${((i + 1) / this.items.length) * 100}%`;
      }

      statusText.textContent = "Packing ZIP file...";
      const zipBlob = await zip.generateAsync({ type: "blob" });

      // Trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = URL.createObjectURL(zipBlob);
      downloadLink.download = `kindle_screensavers_${targetW}x${targetH}_pack.zip`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();

      progressModal.remove();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error(err);
      statusText.textContent = "Error creating ZIP: " + err.message;
      setTimeout(() => progressModal.remove(), 3000);
    }
  }

  loadImageElement(source) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;

      if (typeof source === "string") {
        img.src = source;
      } else if (source instanceof Blob || source instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.readAsDataURL(source);
      }
    });
  }
}
