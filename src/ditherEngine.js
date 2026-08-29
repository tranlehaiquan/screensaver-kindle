/**
 * Kindle E-Ink Image Processing & Dithering Engine
 * Supports 16-level grayscale (Kindle standard) and multiple error diffusion & ordered dithering algorithms.
 */

// Kindle 16-level palette (uniform 0..255 in steps of 17)
export const KINDLE_16_PALETTE = [
  0, 17, 34, 51, 68, 85, 102, 119, 136, 153, 170, 187, 204, 221, 238, 255
];

// Bayer 4x4 matrix normalized 0..15
const BAYER_4X4 = [
  [ 0,  8,  2, 10],
  [12,  4, 14,  6],
  [ 3, 11,  1,  9],
  [15,  7, 13,  5]
];

// Bayer 8x8 matrix normalized 0..63
const BAYER_8X8 = [
  [ 0, 32,  8, 40,  2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44,  4, 36, 14, 46,  6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [ 3, 35, 11, 43,  1, 33,  9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47,  7, 39, 13, 45,  5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21]
];

/**
 * Finds the nearest palette color in Kindle 16-gray palette
 */
export function findNearestKindleColor(val) {
  if (val <= 0) return 0;
  if (val >= 255) return 255;
  // Step is 17 (255 / 15 = 17)
  const index = Math.round(val / 17);
  return Math.min(255, Math.max(0, index * 17));
}

/**
 * Applies sharpening filter (Unsharp mask approximation) to ImageData
 */
function applySharpen(data, width, height, amount) {
  if (amount <= 0) return;
  const strength = (amount / 100) * 1.5;
  const copy = new Float32Array(width * height);

  // Extract grayscale into float buffer
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    copy[i] = 0.2126 * data[idx] + 0.7152 * data[idx + 1] + 0.0722 * data[idx + 2];
  }

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;
      const center = copy[idx];
      const neighbors =
        copy[idx - 1] +
        copy[idx + 1] +
        copy[idx - width] +
        copy[idx + width];
      const laplacian = center * 4 - neighbors;
      const sharpened = center + laplacian * strength;
      const clamped = Math.min(255, Math.max(0, sharpened));
      const pIdx = idx * 4;
      data[pIdx] = clamped;
      data[pIdx + 1] = clamped;
      data[pIdx + 2] = clamped;
    }
  }
}

/**
 * Auto-levels / Histogram stretch
 */
function applyAutoLevels(buf, width, height) {
  let min = 255;
  let max = 0;
  for (let i = 0; i < width * height; i++) {
    const v = buf[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  if (max > min) {
    const range = max - min;
    for (let i = 0; i < width * height; i++) {
      buf[i] = ((buf[i] - min) / range) * 255;
    }
  }
}

/**
 * Main Image Processing Function
 * @param {ImageData} srcImageData - Raw cropped canvas image data
 * @param {Object} options - Tuning options
 * @returns {ImageData} - Processed E-Ink ImageData
 */
export function processEInkImage(srcImageData, options = {}) {
  const {
    algorithm = "floyd-steinberg",
    brightness = 0,     // -100 to +100
    contrast = 0,       // -100 to +100
    gamma = 1.0,        // 0.4 to 2.5
    sharpness = 25,     // 0 to 100
    ditherAmount = 100, // 0 to 100%
    invert = false,
    autoLevels = false,
    colorLevels = 16    // 16 or 2 (pure 1-bit)
  } = options;

  const width = srcImageData.width;
  const height = srcImageData.height;
  const src = srcImageData.data;

  // Working float buffer for grayscale & error diffusion
  const buf = new Float32Array(width * height);

  // Precompute contrast & brightness factors
  const bFactor = (brightness / 100) * 255;
  const cFactor = (contrast >= 0)
    ? Math.tan(((contrast + 100) / 400) * Math.PI)
    : (contrast + 100) / 100;
  const invGamma = 1.0 / Math.max(0.1, gamma);

  // 1. Convert to Grayscale & Apply Pre-adjustments
  for (let i = 0; i < width * height; i++) {
    const idx = i * 4;
    // Standard Rec. 709 Luminance
    let lum = 0.2126 * src[idx] + 0.7152 * src[idx + 1] + 0.0722 * src[idx + 2];

    // Invert if requested before contrast/gamma
    if (invert) {
      lum = 255 - lum;
    }

    // Brightness
    if (brightness !== 0) {
      lum += bFactor;
    }

    // Contrast
    if (contrast !== 0) {
      lum = (lum - 128) * cFactor + 128;
    }

    // Gamma correction
    if (gamma !== 1.0) {
      lum = 255 * Math.pow(Math.max(0, Math.min(255, lum)) / 255, invGamma);
    }

    buf[i] = Math.max(0, Math.min(255, lum));
  }

  // 2. Auto Levels (Optional)
  if (autoLevels) {
    applyAutoLevels(buf, width, height);
  }

  // 3. Sharpening filter directly on float buffer
  if (sharpness > 0) {
    const sharpCopy = new Float32Array(buf);
    const sStrength = (sharpness / 100) * 1.2;
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const center = sharpCopy[idx];
        const laplacian = center * 4 - (
          sharpCopy[idx - 1] +
          sharpCopy[idx + 1] +
          sharpCopy[idx - width] +
          sharpCopy[idx + width]
        );
        buf[idx] = Math.max(0, Math.min(255, center + laplacian * sStrength));
      }
    }
  }

  // 4. Dithering & Quantization
  const dFactor = Math.max(0, Math.min(100, ditherAmount)) / 100;
  const quantizeFn = (val) => {
    if (colorLevels === 2) {
      return val < 128 ? 0 : 255;
    }
    return findNearestKindleColor(val);
  };

  const outputImageData = new ImageData(width, height);
  const outData = outputImageData.data;

  // Dither branching
  if (algorithm === "none") {
    for (let i = 0; i < width * height; i++) {
      const q = quantizeFn(buf[i]);
      const oIdx = i * 4;
      outData[oIdx] = q;
      outData[oIdx + 1] = q;
      outData[oIdx + 2] = q;
      outData[oIdx + 3] = 255;
    }
  } else if (algorithm === "bayer-4") {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const bayerVal = (BAYER_4X4[y % 4][x % 4] / 16 - 0.5) * (17 * dFactor);
        const q = quantizeFn(buf[i] + bayerVal);
        const oIdx = i * 4;
        outData[oIdx] = q;
        outData[oIdx + 1] = q;
        outData[oIdx + 2] = q;
        outData[oIdx + 3] = 255;
      }
    }
  } else if (algorithm === "bayer-8") {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const bayerVal = (BAYER_8X8[y % 8][x % 8] / 64 - 0.5) * (17 * dFactor);
        const q = quantizeFn(buf[i] + bayerVal);
        const oIdx = i * 4;
        outData[oIdx] = q;
        outData[oIdx + 1] = q;
        outData[oIdx + 2] = q;
        outData[oIdx + 3] = 255;
      }
    }
  } else {
    // Error Diffusion Algorithms
    const distributeError = (x, y, err, weight, divisor) => {
      if (x >= 0 && x < width && y >= 0 && y < height) {
        buf[y * width + x] += (err * weight * dFactor) / divisor;
      }
    };

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        const oldVal = buf[i];
        const newVal = quantizeFn(oldVal);
        const err = oldVal - newVal;

        const oIdx = i * 4;
        outData[oIdx] = newVal;
        outData[oIdx + 1] = newVal;
        outData[oIdx + 2] = newVal;
        outData[oIdx + 3] = 255;

        switch (algorithm) {
          case "atkinson":
            // Bill Atkinson (1/8 each to 6 neighbors)
            distributeError(x + 1, y, err, 1, 8);
            distributeError(x + 2, y, err, 1, 8);
            distributeError(x - 1, y + 1, err, 1, 8);
            distributeError(x, y + 1, err, 1, 8);
            distributeError(x + 1, y + 1, err, 1, 8);
            distributeError(x, y + 2, err, 1, 8);
            break;

          case "sierra-3":
            // Sierra-3 (32 divisor)
            distributeError(x + 1, y, err, 5, 32);
            distributeError(x + 2, y, err, 3, 32);
            distributeError(x - 2, y + 1, err, 2, 32);
            distributeError(x - 1, y + 1, err, 4, 32);
            distributeError(x, y + 1, err, 5, 32);
            distributeError(x + 1, y + 1, err, 4, 32);
            distributeError(x + 2, y + 1, err, 2, 32);
            distributeError(x - 1, y + 2, err, 2, 32);
            distributeError(x, y + 2, err, 3, 32);
            distributeError(x + 1, y + 2, err, 2, 32);
            break;

          case "sierra-2":
            // Two-Row Sierra (16 divisor)
            distributeError(x + 1, y, err, 4, 16);
            distributeError(x + 2, y, err, 3, 16);
            distributeError(x - 2, y + 1, err, 1, 16);
            distributeError(x - 1, y + 1, err, 2, 16);
            distributeError(x, y + 1, err, 3, 16);
            distributeError(x + 1, y + 1, err, 2, 16);
            distributeError(x + 2, y + 1, err, 1, 16);
            break;

          case "sierra-lite":
            // Sierra Lite (4 divisor)
            distributeError(x + 1, y, err, 2, 4);
            distributeError(x - 1, y + 1, err, 1, 4);
            distributeError(x, y + 1, err, 1, 4);
            break;

          case "burkes":
            // Burkes (32 divisor)
            distributeError(x + 1, y, err, 8, 32);
            distributeError(x + 2, y, err, 4, 32);
            distributeError(x - 2, y + 1, err, 2, 32);
            distributeError(x - 1, y + 1, err, 4, 32);
            distributeError(x, y + 1, err, 8, 32);
            distributeError(x + 1, y + 1, err, 4, 32);
            distributeError(x + 2, y + 1, err, 2, 32);
            break;

          case "jjn":
            // Jarvis, Judice, and Ninke (48 divisor)
            distributeError(x + 1, y, err, 7, 48);
            distributeError(x + 2, y, err, 5, 48);
            distributeError(x - 2, y + 1, err, 3, 48);
            distributeError(x - 1, y + 1, err, 5, 48);
            distributeError(x, y + 1, err, 7, 48);
            distributeError(x + 1, y + 1, err, 5, 48);
            distributeError(x + 2, y + 1, err, 3, 48);
            distributeError(x - 2, y + 2, err, 1, 48);
            distributeError(x - 1, y + 2, err, 3, 48);
            distributeError(x, y + 2, err, 5, 48);
            distributeError(x + 1, y + 2, err, 3, 48);
            distributeError(x + 2, y + 2, err, 1, 48);
            break;

          case "stucki":
            // Stucki (42 divisor)
            distributeError(x + 1, y, err, 8, 42);
            distributeError(x + 2, y, err, 4, 42);
            distributeError(x - 2, y + 1, err, 2, 42);
            distributeError(x - 1, y + 1, err, 4, 42);
            distributeError(x, y + 1, err, 8, 42);
            distributeError(x + 1, y + 1, err, 4, 42);
            distributeError(x + 2, y + 1, err, 2, 42);
            distributeError(x - 2, y + 2, err, 1, 42);
            distributeError(x - 1, y + 2, err, 2, 42);
            distributeError(x, y + 2, err, 4, 42);
            distributeError(x + 1, y + 2, err, 2, 42);
            distributeError(x + 2, y + 2, err, 1, 42);
            break;

          case "floyd-steinberg":
          default:
            // Floyd-Steinberg (16 divisor)
            distributeError(x + 1, y, err, 7, 16);
            distributeError(x - 1, y + 1, err, 3, 16);
            distributeError(x, y + 1, err, 5, 16);
            distributeError(x + 1, y + 1, err, 1, 16);
            break;
        }
      }
    }
  }

  return outputImageData;
}
