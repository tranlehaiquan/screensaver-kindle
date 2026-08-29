/**
 * Kindle Screensaver Studio — Main Application Controller
 */

import { KINDLE_DEVICES, getDeviceById } from "./devices.js";
import { processEInkImage } from "./ditherEngine.js";
import { KindleCropper } from "./cropper.js";
import { KindlePreviewer } from "./preview.js";
import { BatchManager } from "./batch.js";
import { SAMPLE_IMAGES, getSampleDataUrl } from "./samples.js";
import { openGuideModal } from "./guide.js";
import confetti from "canvas-confetti";

class KindleApp {
  constructor() {
    this.currentDevice = KINDLE_DEVICES[1].models[1]; // Paperwhite 11th Gen
    this.currentOrientation = "portrait";
    this.colorLevels = 16;
    
    // Sliders & settings state
    this.settings = {
      algorithm: "floyd-steinberg",
      ditherAmount: 100,
      brightness: 0,
      contrast: 0,
      gamma: 1.0,
      sharpness: 25,
      invert: false,
      autoLevels: false,
      colorLevels: 16
    };

    this.rawCroppedCanvas = null;
    this.ditheredCanvas = null;

    this.initElements();
    this.initModules();
    this.populateDevicesDropdown();
    this.bindEvents();

    // Expose settings getter for batch zip export
    window.__getKindleExportSettings = () => ({
      ...this.settings,
      targetWidth: this.getTargetWidth(),
      targetHeight: this.getTargetHeight()
    });

    // Load initial sample
    this.loadInitialSample();
  }

  initElements() {
    this.selectDevice = document.getElementById("select-device");
    this.specDimText = document.getElementById("spec-dim-text");
    this.specPpiText = document.getElementById("spec-ppi-text");
    this.customDimGroup = document.getElementById("custom-dim-group");
    this.customWidth = document.getElementById("custom-width");
    this.customHeight = document.getElementById("custom-height");

    this.btnOrientPortrait = document.getElementById("btn-orient-portrait");
    this.btnOrientLandscape = document.getElementById("btn-orient-landscape");

    this.dropZone = document.getElementById("drop-zone");
    this.fileInput = document.getElementById("file-input");

    this.cropCanvas = document.getElementById("crop-canvas");

    this.btnRotateCCW = document.getElementById("btn-rotate-ccw");
    this.btnRotateCW = document.getElementById("btn-rotate-cw");
    this.btnFlipH = document.getElementById("btn-flip-h");
    this.btnFlipV = document.getElementById("btn-flip-v");

    this.fitButtons = document.querySelectorAll("[data-fit]");
    this.depthButtons = document.querySelectorAll("[data-depth]");

    this.selectAlgorithm = document.getElementById("select-algorithm");
    this.sliderDither = document.getElementById("slider-dither");
    this.valDither = document.getElementById("val-dither");
    this.sliderBrightness = document.getElementById("slider-brightness");
    this.valBrightness = document.getElementById("val-brightness");
    this.sliderContrast = document.getElementById("slider-contrast");
    this.valContrast = document.getElementById("val-contrast");
    this.sliderGamma = document.getElementById("slider-gamma");
    this.valGamma = document.getElementById("val-gamma");
    this.sliderSharpness = document.getElementById("slider-sharpness");
    this.valSharpness = document.getElementById("val-sharpness");

    this.chkInvert = document.getElementById("chk-invert");
    this.chkAutoLevels = document.getElementById("chk-autolevels");
    this.btnResetFilters = document.getElementById("btn-reset-filters");

    this.previewContainer = document.getElementById("preview-container");
    this.batchContainer = document.getElementById("batch-manager-container");

    this.exportResTag = document.getElementById("export-res-tag");
    this.exportSizeTag = document.getElementById("export-size-tag");
    this.exportRenderTime = document.getElementById("export-render-time");

    this.btnCopyClipboard = document.getElementById("btn-copy-clipboard");
    this.btnExportPng = document.getElementById("btn-export-png");

    this.btnOpenSamples = document.getElementById("btn-open-samples");
    this.btnOpenGuide = document.getElementById("btn-open-guide");
    this.samplesModal = document.getElementById("samples-modal");
    this.btnCloseSamples = document.getElementById("btn-close-samples");
    this.samplesList = document.getElementById("samples-list");
  }

  initModules() {
    // Initialize Cropper
    this.cropper = new KindleCropper(this.cropCanvas, () => {
      this.triggerProcessing();
    });

    // Initialize Previewer
    this.previewer = new KindlePreviewer(this.previewContainer);

    // Initialize Batch Manager
    this.batchManager = new BatchManager(this.batchContainer, (item) => {
      if (item) {
        this.cropper.loadImage(item.source);
      }
    });
  }

  getTargetWidth() {
    if (this.currentDevice.id === "custom") {
      const w = parseInt(this.customWidth.value, 10) || 1236;
      const h = parseInt(this.customHeight.value, 10) || 1648;
      return this.currentOrientation === "landscape" ? Math.max(w, h) : Math.min(w, h);
    }
    return this.currentOrientation === "landscape"
      ? Math.max(this.currentDevice.width, this.currentDevice.height)
      : Math.min(this.currentDevice.width, this.currentDevice.height);
  }

  getTargetHeight() {
    if (this.currentDevice.id === "custom") {
      const w = parseInt(this.customWidth.value, 10) || 1236;
      const h = parseInt(this.customHeight.value, 10) || 1648;
      return this.currentOrientation === "landscape" ? Math.min(w, h) : Math.max(w, h);
    }
    return this.currentOrientation === "landscape"
      ? Math.min(this.currentDevice.width, this.currentDevice.height)
      : Math.max(this.currentDevice.width, this.currentDevice.height);
  }

  populateDevicesDropdown() {
    this.selectDevice.innerHTML = "";
    KINDLE_DEVICES.forEach(group => {
      const optgroup = document.createElement("optgroup");
      optgroup.label = group.category;
      group.models.forEach(model => {
        const opt = document.createElement("option");
        opt.value = model.id;
        opt.textContent = `${model.name} (${model.width}×${model.height})`;
        if (model.id === "pw-11") opt.selected = true;
        optgroup.appendChild(opt);
      });
      this.selectDevice.appendChild(optgroup);
    });

    this.updateDeviceSpecs();
  }

  updateDeviceSpecs() {
    const targetW = this.getTargetWidth();
    const targetH = this.getTargetHeight();
    this.specDimText.textContent = `${targetW} × ${targetH} px`;
    this.specPpiText.textContent = `${this.currentDevice.ppi} PPI • ${this.currentDevice.diagonal}`;
    this.exportResTag.textContent = `${targetW} × ${targetH} px`;

    if (this.currentDevice.id === "custom") {
      this.customDimGroup.style.display = "flex";
    } else {
      this.customDimGroup.style.display = "none";
    }

    this.cropper.setTargetDimensions(targetW, targetH, this.currentOrientation);
    this.triggerProcessing();
  }

  bindEvents() {
    // Device dropdown change
    this.selectDevice.addEventListener("change", (e) => {
      this.currentDevice = getDeviceById(e.target.value);
      this.updateDeviceSpecs();
    });

    // Custom dimensions inputs
    const handleCustomChange = () => {
      if (this.currentDevice.id === "custom") {
        this.updateDeviceSpecs();
      }
    };
    this.customWidth.addEventListener("input", handleCustomChange);
    this.customHeight.addEventListener("input", handleCustomChange);

    // Orientation toggle
    this.btnOrientPortrait.addEventListener("click", () => {
      this.currentOrientation = "portrait";
      this.btnOrientPortrait.classList.add("active");
      this.btnOrientLandscape.classList.remove("active");
      this.updateDeviceSpecs();
    });

    this.btnOrientLandscape.addEventListener("click", () => {
      this.currentOrientation = "landscape";
      this.btnOrientLandscape.classList.add("active");
      this.btnOrientPortrait.classList.remove("active");
      this.updateDeviceSpecs();
    });

    // File input & Drag-drop
    this.dropZone.addEventListener("click", () => this.fileInput.click());
    this.fileInput.addEventListener("change", (e) => {
      if (e.target.files && e.target.files.length > 0) {
        this.handleUploadedFiles(Array.from(e.target.files));
      }
    });

    this.dropZone.addEventListener("dragover", (e) => {
      e.preventDefault();
      this.dropZone.classList.add("drag-over");
    });
    this.dropZone.addEventListener("dragleave", () => {
      this.dropZone.classList.remove("drag-over");
    });
    this.dropZone.addEventListener("drop", (e) => {
      e.preventDefault();
      this.dropZone.classList.remove("drag-over");
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        this.handleUploadedFiles(Array.from(e.dataTransfer.files));
      }
    });

    // Transform buttons
    this.btnRotateCCW.addEventListener("click", () => this.cropper.rotate(-90));
    this.btnRotateCW.addEventListener("click", () => this.cropper.rotate(90));
    this.btnFlipH.addEventListener("click", () => this.cropper.toggleFlipH());
    this.btnFlipV.addEventListener("click", () => this.cropper.toggleFlipV());

    // Fit mode buttons
    this.fitButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.fitButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.cropper.applyFitMode(btn.dataset.fit);
      });
    });

    // Color depth buttons
    this.depthButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        this.depthButtons.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        this.settings.colorLevels = parseInt(btn.dataset.depth, 10);
        document.getElementById("val-depth").textContent = btn.dataset.depth === "2" ? "1-Bit Pure B&W" : "16 Grays";
        this.triggerProcessing();
      });
    });

    // Algorithm change
    this.selectAlgorithm.addEventListener("change", (e) => {
      this.settings.algorithm = e.target.value;
      this.triggerProcessing();
    });

    // Sliders
    const setupSlider = (slider, valEl, key, suffix = "", formatFn = v => v) => {
      slider.addEventListener("input", (e) => {
        const v = parseFloat(e.target.value);
        valEl.textContent = formatFn(v) + suffix;
        this.settings[key] = v;
        this.triggerProcessing();
      });
    };

    setupSlider(this.sliderDither, this.valDither, "ditherAmount", "%");
    setupSlider(this.sliderBrightness, this.valBrightness, "brightness", "");
    setupSlider(this.sliderContrast, this.valContrast, "contrast", "");
    setupSlider(this.sliderGamma, this.valGamma, "gamma", "", v => v.toFixed(2));
    setupSlider(this.sliderSharpness, this.valSharpness, "sharpness", "%");

    // Toggles
    this.chkInvert.addEventListener("change", (e) => {
      this.settings.invert = e.target.checked;
      this.triggerProcessing();
    });

    this.chkAutoLevels.addEventListener("change", (e) => {
      this.settings.autoLevels = e.target.checked;
      this.triggerProcessing();
    });

    // Reset filters
    this.btnResetFilters.addEventListener("click", () => {
      this.sliderDither.value = 100;
      this.valDither.textContent = "100%";
      this.sliderBrightness.value = 0;
      this.valBrightness.textContent = "0";
      this.sliderContrast.value = 0;
      this.valContrast.textContent = "0";
      this.sliderGamma.value = 1.0;
      this.valGamma.textContent = "1.00";
      this.sliderSharpness.value = 25;
      this.valSharpness.textContent = "25%";
      this.chkInvert.checked = false;
      this.chkAutoLevels.checked = false;

      this.settings = {
        ...this.settings,
        ditherAmount: 100,
        brightness: 0,
        contrast: 0,
        gamma: 1.0,
        sharpness: 25,
        invert: false,
        autoLevels: false
      };
      this.triggerProcessing();
    });

    // Export PNG
    this.btnExportPng.addEventListener("click", () => {
      this.exportImage("png");
    });

    // Copy to clipboard
    this.btnCopyClipboard.addEventListener("click", () => {
      this.copyToClipboard();
    });

    // Sample Art modal
    this.btnOpenSamples.addEventListener("click", () => {
      this.openSamplesModal();
    });
    this.btnCloseSamples.addEventListener("click", () => {
      this.samplesModal.style.display = "none";
    });
    this.samplesModal.addEventListener("click", (e) => {
      if (e.target === this.samplesModal) {
        this.samplesModal.style.display = "none";
      }
    });

    // Guide modal
    this.btnOpenGuide.addEventListener("click", () => {
      openGuideModal();
    });
  }

  async handleUploadedFiles(files) {
    if (!files || files.length === 0) return;
    await this.batchManager.addFiles(files);
  }

  async loadInitialSample() {
    // Add sample artworks to batch queue so user has an immediately working demo!
    for (const sample of SAMPLE_IMAGES) {
      const url = getSampleDataUrl(sample);
      await this.batchManager.addImage(sample.title, url);
    }
  }

  triggerProcessing() {
    if (!this.cropper.image) return;

    const startTime = performance.now();
    const croppedCanvas = this.cropper.getCroppedCanvas();
    if (!croppedCanvas) return;

    this.rawCroppedCanvas = croppedCanvas;

    const w = croppedCanvas.width;
    const h = croppedCanvas.height;
    const ctx = croppedCanvas.getContext("2d");
    const rawData = ctx.getImageData(0, 0, w, h);

    // Apply E-Ink Dithering Engine
    const ditheredData = processEInkImage(rawData, this.settings);

    // Create Dithered Canvas
    const ditherCanvas = document.createElement("canvas");
    ditherCanvas.width = w;
    ditherCanvas.height = h;
    const dCtx = ditherCanvas.getContext("2d");
    dCtx.putImageData(ditheredData, 0, 0);

    this.ditheredCanvas = ditherCanvas;

    const elapsed = Math.round(performance.now() - startTime);
    this.exportRenderTime.textContent = `⚡ ${elapsed}ms`;

    // Estimate file size
    ditherCanvas.toBlob((blob) => {
      if (blob) {
        const kb = Math.round(blob.size / 1024);
        this.exportSizeTag.textContent = `PNG • ~${kb} KB`;
      }
    }, "image/png");

    // Update previewer
    this.previewer.setImages(this.rawCroppedCanvas, this.ditheredCanvas);
  }

  exportImage(format = "png") {
    if (!this.ditheredCanvas) return;
    const mimeType = format === "jpg" ? "image/jpeg" : "image/png";
    const ext = format === "jpg" ? "jpg" : "png";
    const deviceName = this.currentDevice.name.toLowerCase().replace(/[^a-z0-9]+/g, "_");

    this.ditheredCanvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kindle_screensaver_${deviceName}_${this.ditheredCanvas.width}x${this.ditheredCanvas.height}.${ext}`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.7 }
      });
    }, mimeType, 0.95);
  }

  async copyToClipboard() {
    if (!this.ditheredCanvas) return;
    try {
      this.ditheredCanvas.toBlob(async (blob) => {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob })
        ]);
        const origText = this.btnCopyClipboard.innerHTML;
        this.btnCopyClipboard.innerHTML = "<span>✅</span> Copied!";
        setTimeout(() => {
          this.btnCopyClipboard.innerHTML = origText;
        }, 2000);
      }, "image/png");
    } catch (err) {
      console.error(err);
      alert("Failed to copy image to clipboard: " + err.message);
    }
  }

  openSamplesModal() {
    this.samplesList.innerHTML = SAMPLE_IMAGES.map(sample => {
      const url = getSampleDataUrl(sample);
      return `
        <div class="sample-card" data-id="${sample.id}">
          <div class="sample-card-preview">
            <img src="${url}" alt="${sample.title}" />
          </div>
          <div class="sample-card-info">
            <span class="sample-card-title">${sample.title}</span>
            <span class="sample-card-category">${sample.category}</span>
          </div>
        </div>
      `;
    }).join("");

    this.samplesList.querySelectorAll(".sample-card").forEach(card => {
      card.addEventListener("click", () => {
        const sample = SAMPLE_IMAGES.find(s => s.id === card.dataset.id);
        if (sample) {
          const url = getSampleDataUrl(sample);
          this.batchManager.addImage(sample.title, url);
          this.samplesModal.style.display = "none";
        }
      });
    });

    this.samplesModal.style.display = "flex";
  }
}

// Bootstrap Application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new KindleApp();
});
