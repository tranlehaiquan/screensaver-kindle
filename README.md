# 📖 Kindle Screensaver Studio

An ultra-crisp, browser-based image converter and precision cropper specifically designed to create custom screensavers for Amazon Kindle devices.

---

## 🌟 Why a Web App is Ideal for this Tool
1. **Zero Installation**: Runs instantly in any modern web browser across macOS, Windows, Linux, iPad, and Chromebook.
2. **100% Client-side & Private**: All image cropping, 16-level grayscale color reduction, dithering, and formatting happen locally in your browser with HTML5 Canvas — your photos never leave your device.
3. **PWA / Desktop Installable**: Can be saved as a standalone desktop app directly from Chrome/Edge/Safari ("Install App").

---

## ✨ Features

- **📱 Comprehensive Kindle Hardware Database**:
  - **Kindle Basic** 11th Gen (2022/2024 - `1072 × 1448`), 10th Gen (`600 × 800`), 8th/7th/4th/5th Gen.
  - **Kindle Paperwhite** 12th Gen 2024 7" (`1264 × 1680`), 11th Gen PW5 6.8" (`1236 × 1648`), PW4/PW3 (`1072 × 1448`), PW1/PW2 (`758 × 1024`).
  - **Kindle Oasis** 2/3 7" (`1264 × 1680`), Oasis 1 (`1072 × 1448`).
  - **Kindle Scribe** 10.2" (`1860 × 2480`).
  - **Kindle Colorsoft** Signature Edition (`1264 × 1680`).
  - **Kindle Voyage** (`1072 × 1448`), **Kindle DX** (`824 × 1200`), and **Custom Dimensions**.
  - **Orientation Switcher**: Portrait & Landscape modes.

- **✂️ Interactive Visual Cropper**:
  - Drag to pan & reposition the crop area with rule-of-thirds grid.
  - Resize handles with automatic aspect ratio locking to match target Kindle dimensions.
  - Quick-fit modes: `Cover / Fill`, `Fit (White Matte)`, `Fit (Black Matte)`.
  - Geometric transformations: Rotate 90° CW/CCW, Flip Horizontal / Vertical, Mouse-wheel Zoom.

- **⚡ Hardware-Accurate 16-Level E-Ink Dithering Engine**:
  - True 16-level Kindle E-Ink palette mapping (`[0, 17, 34, 51, ..., 255]`).
  - Dithering Algorithms:
    - **Floyd-Steinberg** (Natural diffusion, best for photos and portraits)
    - **Atkinson** (Classic Macintosh algorithm, crisp line art, clean whites and deep blacks)
    - **Sierra-3, Two-Row Sierra, Sierra Lite**
    - **Burkes, Jarvis-Judice-Ninke, Stucki**
    - **Ordered Bayer 4×4 & 8×8 Matrix** (Retro textured halftone)
    - **Direct 16-Level Quantization / Posterize** (No dithering)
    - **1-Bit Pure B&W** (Optimized for Manga / Comic art)
  - Fine-tuning controls: Dither Intensity, Brightness, Contrast, Gamma Curve, Unsharp Mask Sharpness, Invert (Dark Mode screensavers), Auto-levels Histogram Stretch.

- **👁️ Multi-Mode Live Preview Studio**:
  - **Kindle Bezel Mockup**: Renders inside a simulated Kindle hardware chassis with authentic matte e-paper texture.
  - **Interactive Split Slider**: Draggable vertical slider comparing original color source vs e-ink dithered output on the exact same frame.
  - **Side-by-Side Mode**: Dual-panel side-by-side view with pixel specs and file size estimates.
  - **Fullscreen Preview**: Immersive full-screen inspection mode.

- **📦 Batch Queue & ZIP Exporter**:
  - Drag and drop multiple images to queue an entire screensaver collection.
  - One-click **Export ZIP Pack** with Kindle-compatible file naming (`bg_ss00.png`, `bg_ss01.png`, etc.).
  - Single-click **Copy to Clipboard** and **Download PNG**.

- **📖 Step-by-Step Screensaver Setup Guide**:
  - Instructions for standard Kindles (Official *Display Cover* feature with Calibre/EPUB).
  - Instructions for jailbroken Kindles (KUAL + `linkss` Screensavers hack).

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Start Local Development Server
```bash
pnpm dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Build for Production
```bash
pnpm build
```
The output will be placed in the `dist/` directory, ready to be hosted on GitHub Pages, Vercel, Netlify, or any static file server.
