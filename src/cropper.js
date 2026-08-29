/**
 * Interactive Visual Image Cropper & Transformer for Kindle Displays
 */

export class KindleCropper {
  constructor(canvasElement, onChangeCallback) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.onChange = onChangeCallback || (() => {});

    this.image = null;
    this.targetWidth = 1072;
    this.targetHeight = 1448;
    this.orientation = "portrait"; // portrait or landscape
    this.fitMode = "cover"; // 'cover', 'contain-white', 'contain-black', 'custom'

    // Transform states
    this.rotation = 0; // 0, 90, 180, 270
    this.flipH = false;
    this.flipV = false;

    // Crop box in image coordinates { x, y, width, height }
    this.crop = { x: 0, y: 0, width: 100, height: 100 };

    // Interaction states
    this.isDragging = false;
    this.dragMode = null; // 'move', 'nw', 'ne', 'se', 'sw', 'n', 's', 'e', 'w'
    this.dragStart = { x: 0, y: 0 };
    this.cropStart = { x: 0, y: 0, width: 0, height: 0 };

    // Display scale & offsets from canvas coordinate to image coordinate
    this.displayScale = 1;
    this.displayOffset = { x: 0, y: 0 };

    this.bindEvents();
  }

  setTargetDimensions(width, height, orientation = "portrait") {
    this.orientation = orientation;
    if (orientation === "landscape") {
      this.targetWidth = Math.max(width, height);
      this.targetHeight = Math.min(width, height);
    } else {
      this.targetWidth = Math.min(width, height);
      this.targetHeight = Math.max(width, height);
    }

    if (this.image) {
      this.applyFitMode(this.fitMode);
    }
  }

  getAspectRatio() {
    return this.targetWidth / this.targetHeight;
  }

  loadImage(imgSource) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.image = img;
        this.rotation = 0;
        this.flipH = false;
        this.flipV = false;
        this.applyFitMode(this.fitMode);
        this.render();
        this.onChange();
        resolve(img);
      };
      img.onerror = reject;

      if (typeof imgSource === "string") {
        img.src = imgSource;
      } else if (imgSource instanceof Blob || imgSource instanceof File) {
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.readAsDataURL(imgSource);
      }
    });
  }

  rotate(degrees = 90) {
    this.rotation = (this.rotation + degrees + 360) % 360;
    this.applyFitMode(this.fitMode);
    this.render();
    this.onChange();
  }

  toggleFlipH() {
    this.flipH = !this.flipH;
    this.render();
    this.onChange();
  }

  toggleFlipV() {
    this.flipV = !this.flipV;
    this.render();
    this.onChange();
  }

  applyFitMode(mode) {
    this.fitMode = mode;
    if (!this.image) return;

    const imgW = this.getEffectiveImageWidth();
    const imgH = this.getEffectiveImageHeight();
    const targetAspect = this.getAspectRatio();
    const imgAspect = imgW / imgH;

    let cropW, cropH;

    if (mode === "cover" || mode === "custom") {
      if (imgAspect > targetAspect) {
        // Image is wider than target aspect ratio -> fit height, center crop width
        cropH = imgH;
        cropW = cropH * targetAspect;
      } else {
        // Image is taller than target aspect ratio -> fit width, center crop height
        cropW = imgW;
        cropH = cropW / targetAspect;
      }
      this.crop = {
        x: (imgW - cropW) / 2,
        y: (imgH - cropH) / 2,
        width: cropW,
        height: cropH
      };
    } else if (mode === "contain-white" || mode === "contain-black") {
      // In contain mode, we take the entire image and will pad borders on export
      this.crop = {
        x: 0,
        y: 0,
        width: imgW,
        height: imgH
      };
    }

    this.render();
    this.onChange();
  }

  getEffectiveImageWidth() {
    if (!this.image) return 100;
    return (this.rotation === 90 || this.rotation === 270) ? this.image.height : this.image.width;
  }

  getEffectiveImageHeight() {
    if (!this.image) return 100;
    return (this.rotation === 90 || this.rotation === 270) ? this.image.width : this.image.height;
  }

  zoom(factor) {
    if (!this.image || this.fitMode.startsWith("contain")) return;
    const imgW = this.getEffectiveImageWidth();
    const imgH = this.getEffectiveImageHeight();
    const targetAspect = this.getAspectRatio();

    let newWidth = this.crop.width * factor;
    let newHeight = newWidth / targetAspect;

    // Minimum size 50px
    if (newWidth < 50 || newHeight < 50) return;
    // Maximum size cannot exceed image bounds
    if (newWidth > imgW) {
      newWidth = imgW;
      newHeight = newWidth / targetAspect;
    }
    if (newHeight > imgH) {
      newHeight = imgH;
      newWidth = newHeight * targetAspect;
    }

    // Keep centered
    const centerX = this.crop.x + this.crop.width / 2;
    const centerY = this.crop.y + this.crop.height / 2;

    let newX = centerX - newWidth / 2;
    let newY = centerY - newHeight / 2;

    // Clamp
    newX = Math.max(0, Math.min(imgW - newWidth, newX));
    newY = Math.max(0, Math.min(imgH - newHeight, newY));

    this.crop = { x: newX, y: newY, width: newWidth, height: newHeight };
    this.fitMode = "custom";
    this.render();
    this.onChange();
  }

  bindEvents() {
    const c = this.canvas;

    const getCanvasPos = (e) => {
      const rect = c.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (c.width / rect.width),
        y: (clientY - rect.top) * (c.height / rect.height)
      };
    };

    const handleStart = (e) => {
      if (!this.image) return;
      if (this.fitMode.startsWith("contain")) return; // Contain mode locks full image
      const pos = getCanvasPos(e);
      const hit = this.hitTest(pos.x, pos.y);

      if (hit) {
        this.isDragging = true;
        this.dragMode = hit;
        this.dragStart = pos;
        this.cropStart = { ...this.crop };
        e.preventDefault();
      }
    };

    const handleMove = (e) => {
      if (!this.image) return;
      const pos = getCanvasPos(e);

      if (this.isDragging) {
        const dx = (pos.x - this.dragStart.x) / this.displayScale;
        const dy = (pos.y - this.dragStart.y) / this.displayScale;
        this.updateCropOnDrag(dx, dy);
        this.render();
        this.onChange();
        e.preventDefault();
      } else {
        // Update cursor
        const hit = this.hitTest(pos.x, pos.y);
        if (hit === "move") c.style.cursor = "move";
        else if (hit === "nw" || hit === "se") c.style.cursor = "nwse-resize";
        else if (hit === "ne" || hit === "sw") c.style.cursor = "nesw-resize";
        else c.style.cursor = "default";
      }
    };

    const handleEnd = () => {
      this.isDragging = false;
      this.dragMode = null;
    };

    c.addEventListener("mousedown", handleStart);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleEnd);

    c.addEventListener("touchstart", handleStart, { passive: false });
    window.addEventListener("touchmove", handleMove, { passive: false });
    window.addEventListener("touchend", handleEnd);

    // Mouse wheel zoom
    c.addEventListener("wheel", (e) => {
      if (!this.image || this.fitMode.startsWith("contain")) return;
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      this.zoom(zoomFactor);
    }, { passive: false });
  }

  hitTest(canvasX, canvasY) {
    const handleSize = 14;
    const cropScreenX = this.displayOffset.x + this.crop.x * this.displayScale;
    const cropScreenY = this.displayOffset.y + this.crop.y * this.displayScale;
    const cropScreenW = this.crop.width * this.displayScale;
    const cropScreenH = this.crop.height * this.displayScale;

    // Check corner handles
    const isNear = (x, y, targetX, targetY) => Math.abs(x - targetX) <= handleSize && Math.abs(y - targetY) <= handleSize;

    if (isNear(canvasX, canvasY, cropScreenX, cropScreenY)) return "nw";
    if (isNear(canvasX, canvasY, cropScreenX + cropScreenW, cropScreenY)) return "ne";
    if (isNear(canvasX, canvasY, cropScreenX + cropScreenW, cropScreenY + cropScreenH)) return "se";
    if (isNear(canvasX, canvasY, cropScreenX, cropScreenY + cropScreenH)) return "sw";

    // Check inside crop box
    if (
      canvasX >= cropScreenX &&
      canvasX <= cropScreenX + cropScreenW &&
      canvasY >= cropScreenY &&
      canvasY <= cropScreenY + cropScreenH
    ) {
      return "move";
    }

    return null;
  }

  updateCropOnDrag(dx, dy) {
    const imgW = this.getEffectiveImageWidth();
    const imgH = this.getEffectiveImageHeight();
    const aspect = this.getAspectRatio();
    this.fitMode = "custom";

    if (this.dragMode === "move") {
      let newX = this.cropStart.x + dx;
      let newY = this.cropStart.y + dy;

      newX = Math.max(0, Math.min(imgW - this.cropStart.width, newX));
      newY = Math.max(0, Math.min(imgH - this.cropStart.height, newY));

      this.crop.x = newX;
      this.crop.y = newY;
    } else if (this.dragMode === "se") {
      let newW = this.cropStart.width + dx;
      let newH = newW / aspect;

      if (newW > 40 && this.cropStart.x + newW <= imgW && this.cropStart.y + newH <= imgH) {
        this.crop.width = newW;
        this.crop.height = newH;
      }
    } else if (this.dragMode === "nw") {
      let newW = this.cropStart.width - dx;
      let newH = newW / aspect;
      let newX = this.cropStart.x + (this.cropStart.width - newW);
      let newY = this.cropStart.y + (this.cropStart.height - newH);

      if (newW > 40 && newX >= 0 && newY >= 0) {
        this.crop.x = newX;
        this.crop.y = newY;
        this.crop.width = newW;
        this.crop.height = newH;
      }
    } else if (this.dragMode === "ne") {
      let newW = this.cropStart.width + dx;
      let newH = newW / aspect;
      let newY = this.cropStart.y + (this.cropStart.height - newH);

      if (newW > 40 && this.cropStart.x + newW <= imgW && newY >= 0) {
        this.crop.y = newY;
        this.crop.width = newW;
        this.crop.height = newH;
      }
    } else if (this.dragMode === "sw") {
      let newW = this.cropStart.width - dx;
      let newH = newW / aspect;
      let newX = this.cropStart.x + (this.cropStart.width - newW);

      if (newW > 40 && newX >= 0 && this.cropStart.y + newH <= imgH) {
        this.crop.x = newX;
        this.crop.width = newW;
        this.crop.height = newH;
      }
    }
  }

  render() {
    const ctx = this.ctx;
    const canvas = this.canvas;
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);

    if (!this.image) {
      // Empty placeholder state
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "#64748b";
      ctx.font = "16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("No Image Loaded", w / 2, h / 2);
      return;
    }

    const imgW = this.getEffectiveImageWidth();
    const imgH = this.getEffectiveImageHeight();

    // Compute display scale to fit image inside editor canvas with padding
    const padding = 20;
    const availW = w - padding * 2;
    const availH = h - padding * 2;
    const scale = Math.min(availW / imgW, availH / imgH);
    this.displayScale = scale;

    const screenImgW = imgW * scale;
    const screenImgH = imgH * scale;
    const offsetX = (w - screenImgW) / 2;
    const offsetY = (h - screenImgH) / 2;
    this.displayOffset = { x: offsetX, y: offsetY };

    // 1. Draw Checkerboard background for transparency
    this.drawCheckerboard(offsetX, offsetY, screenImgW, screenImgH);

    // 2. Draw Transformed Image
    ctx.save();
    ctx.translate(offsetX + screenImgW / 2, offsetY + screenImgH / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);

    const rawW = this.image.width;
    const rawH = this.image.height;
    ctx.drawImage(this.image, -rawW * scale / 2, -rawH * scale / 2, rawW * scale, rawH * scale);
    ctx.restore();

    // 3. Draw Darkened Overlay outside crop area
    const cropScreenX = offsetX + this.crop.x * scale;
    const cropScreenY = offsetY + this.crop.y * scale;
    const cropScreenW = this.crop.width * scale;
    const cropScreenH = this.crop.height * scale;

    ctx.fillStyle = "rgba(0, 0, 0, 0.65)";
    // Top
    ctx.fillRect(offsetX, offsetY, screenImgW, cropScreenY - offsetY);
    // Bottom
    ctx.fillRect(offsetX, cropScreenY + cropScreenH, screenImgW, offsetY + screenImgH - (cropScreenY + cropScreenH));
    // Left
    ctx.fillRect(offsetX, cropScreenY, cropScreenX - offsetX, cropScreenH);
    // Right
    ctx.fillRect(cropScreenX + cropScreenW, cropScreenY, offsetX + screenImgW - (cropScreenX + cropScreenW), cropScreenH);

    // 4. Draw Crop Boundary & Grid
    ctx.strokeStyle = "#38bdf8";
    ctx.lineWidth = 2;
    ctx.strokeRect(cropScreenX, cropScreenY, cropScreenW, cropScreenH);

    // Rule of thirds lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    ctx.beginPath();
    ctx.moveTo(cropScreenX + cropScreenW / 3, cropScreenY);
    ctx.lineTo(cropScreenX + cropScreenW / 3, cropScreenY + cropScreenH);
    ctx.moveTo(cropScreenX + (cropScreenW * 2) / 3, cropScreenY);
    ctx.lineTo(cropScreenX + (cropScreenW * 2) / 3, cropScreenY + cropScreenH);

    ctx.moveTo(cropScreenX, cropScreenY + cropScreenH / 3);
    ctx.lineTo(cropScreenX + cropScreenW, cropScreenY + cropScreenH / 3);
    ctx.moveTo(cropScreenX, cropScreenY + (cropScreenH * 2) / 3);
    ctx.lineTo(cropScreenX + cropScreenW, cropScreenY + (cropScreenH * 2) / 3);
    ctx.stroke();
    ctx.setLineDash([]);

    // 5. Draw Corner Resize Handles (if not locked in contain mode)
    if (!this.fitMode.startsWith("contain")) {
      const handleRadius = 6;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = "#0284c7";
      ctx.lineWidth = 2;

      const corners = [
        [cropScreenX, cropScreenY],
        [cropScreenX + cropScreenW, cropScreenY],
        [cropScreenX + cropScreenW, cropScreenY + cropScreenH],
        [cropScreenX, cropScreenY + cropScreenH]
      ];

      for (const [cx, cy] of corners) {
        ctx.beginPath();
        ctx.arc(cx, cy, handleRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
    }
  }

  drawCheckerboard(x, y, w, h) {
    const ctx = this.ctx;
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    const size = 12;
    for (let py = y; py < y + h; py += size) {
      for (let px = x; px < x + w; px += size) {
        ctx.fillStyle = ((Math.floor(px / size) + Math.floor(py / size)) % 2 === 0) ? "#1e293b" : "#0f172a";
        ctx.fillRect(px, py, size, size);
      }
    }
    ctx.restore();
  }

  /**
   * Generates full resolution raw cropped canvas matching exact target Kindle dimensions.
   */
  getCroppedCanvas() {
    if (!this.image) return null;

    const outCanvas = document.createElement("canvas");
    outCanvas.width = this.targetWidth;
    outCanvas.height = this.targetHeight;
    const outCtx = outCanvas.getContext("2d");

    // Fill background color
    const bgColor = this.fitMode === "contain-white" ? "#ffffff" : "#000000";
    outCtx.fillStyle = bgColor;
    outCtx.fillRect(0, 0, this.targetWidth, this.targetHeight);

    // Create intermediate rotated/flipped image buffer
    const effW = this.getEffectiveImageWidth();
    const effH = this.getEffectiveImageHeight();
    const bufferCanvas = document.createElement("canvas");
    bufferCanvas.width = effW;
    bufferCanvas.height = effH;
    const bCtx = bufferCanvas.getContext("2d");

    bCtx.translate(effW / 2, effH / 2);
    bCtx.rotate((this.rotation * Math.PI) / 180);
    bCtx.scale(this.flipH ? -1 : 1, this.flipV ? -1 : 1);
    bCtx.drawImage(this.image, -this.image.width / 2, -this.image.height / 2);

    if (this.fitMode === "contain-white" || this.fitMode === "contain-black") {
      // Contain mode: scale entire image to fit inside target canvas with borders
      const targetAspect = this.getAspectRatio();
      const imgAspect = effW / effH;
      let drawW, drawH, drawX, drawY;

      if (imgAspect > targetAspect) {
        drawW = this.targetWidth;
        drawH = drawW / imgAspect;
        drawX = 0;
        drawY = (this.targetHeight - drawH) / 2;
      } else {
        drawH = this.targetHeight;
        drawW = drawH * imgAspect;
        drawX = (this.targetWidth - drawW) / 2;
        drawY = 0;
      }

      outCtx.drawImage(bufferCanvas, 0, 0, effW, effH, drawX, drawY, drawW, drawH);
    } else {
      // Standard Crop mode
      outCtx.drawImage(
        bufferCanvas,
        this.crop.x,
        this.crop.y,
        this.crop.width,
        this.crop.height,
        0,
        0,
        this.targetWidth,
        this.targetHeight
      );
    }

    return outCanvas;
  }
}
