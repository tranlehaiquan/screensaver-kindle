/**
 * Interactive Step-by-Step Kindle Screensaver Guide Modal
 */

export function openGuideModal() {
  const existing = document.getElementById("guide-modal");
  if (existing) existing.remove();

  const modal = document.createElement("div");
  modal.id = "guide-modal";
  modal.className = "modal-backdrop";
  modal.innerHTML = `
    <div class="modal-card">
      <div class="modal-header">
        <div class="modal-title-group">
          <span class="modal-icon">📖</span>
          <h3>How to Set Screensavers on Your Kindle</h3>
        </div>
        <button type="button" class="btn-close" id="btn-close-guide" aria-label="Close">✕</button>
      </div>

      <div class="modal-tabs">
        <button type="button" class="modal-tab-btn active" data-tab="stock">
          Standard Kindle (No Jailbreak)
        </button>
        <button type="button" class="modal-tab-btn" data-tab="jailbroken">
          Jailbroken Kindle (linkss)
        </button>
        <button type="button" class="modal-tab-btn" data-tab="tips">
          E-Ink Best Practices
        </button>
      </div>

      <div class="modal-body">
        <!-- Tab 1: Stock Kindle -->
        <div class="modal-tab-pane active" id="pane-stock">
          <div class="guide-banner">
            <span class="badge info">Official Amazon Feature</span>
            <p>Works on all Kindle devices running firmware <strong>5.13.5+ (Ad-Free / Special Offers Removed)</strong>.</p>
          </div>

          <ol class="guide-steps">
            <li>
              <strong>Enable "Display Cover" on your Kindle:</strong>
              <p>Go to <code>Settings → Device Options → Display Cover</code> and switch it <strong>ON</strong>. (If you don't see this setting, ensure lockscreen ads are removed via Amazon account or support).</p>
            </li>
            <li>
              <strong>Export your Screensaver Image:</strong>
              <p>Select your exact Kindle model in this tool, crop your favorite picture, and click <strong>Export PNG</strong>.</p>
            </li>
            <li>
              <strong>Create a Book / Cover Container:</strong>
              <p>Open <strong>Calibre</strong> (free e-book manager), add a blank EPUB/AZW3 or short book, click <em>Edit Metadata</em>, and set your exported PNG as the book cover.</p>
            </li>
            <li>
              <strong>Send to Kindle & Enjoy:</strong>
              <p>Connect Kindle via USB or use <em>Send to Kindle</em>. Open the book once on your device, then press the power button to lock — your custom art will remain as the permanent screensaver!</p>
            </li>
          </ol>
        </div>

        <!-- Tab 2: Jailbroken Kindle -->
        <div class="modal-tab-pane" id="pane-jailbroken">
          <div class="guide-banner">
            <span class="badge success">Custom Screensavers Directory</span>
            <p>For jailbroken Kindles with <strong>KUAL</strong> and the <strong>ScreenSavers Hack (linkss)</strong> installed.</p>
          </div>

          <ol class="guide-steps">
            <li>
              <strong>Export Batch or Single Screensavers:</strong>
              <p>Export your images with naming format: <code>bg_ss00.png</code>, <code>bg_ss01.png</code>, etc., matching your Kindle's native resolution.</p>
            </li>
            <li>
              <strong>Connect Kindle via USB:</strong>
              <p>Navigate to the root folder of your Kindle drive on your computer.</p>
            </li>
            <li>
              <strong>Copy into <code>linkss/screensavers</code>:</strong>
              <p>Copy all exported PNG files directly into: <br/><code>/mnt/us/linkss/screensavers/</code> (or <code>Kindle/linkss/screensavers/</code> in Explorer/Finder).</p>
            </li>
            <li>
              <strong>Configure in KUAL:</strong>
              <p>Open <strong>KUAL</strong> on your Kindle → <strong>ScreenSavers</strong> → choose <strong>Random</strong> or <strong>Cycle</strong> mode. Your screensavers will automatically cycle each time you put the Kindle to sleep!</p>
            </li>
          </ol>
        </div>

        <!-- Tab 3: Tips -->
        <div class="modal-tab-pane" id="pane-tips">
          <div class="tips-grid">
            <div class="tip-card">
              <h4>🎯 Exact Pixel Match</h4>
              <p>Kindle displays have fixed hardware grid resolutions (e.g. 1236×1648 for PW5). Exporting at the exact pixel dimension avoids blurry hardware scaling.</p>
            </div>
            <div class="tip-card">
              <h4>⚡ Dithering Comparison</h4>
              <p><strong>Floyd-Steinberg:</strong> Best for photos and natural gradients.<br/><strong>Atkinson:</strong> Best for typography, line art, and comic panels (clean whites & blacks).</p>
            </div>
            <div class="tip-card">
              <h4>🔍 Sharpening Filter</h4>
              <p>E-Ink screens benefit from a subtle unsharp mask (+25% to +40%) because micro-capsules have a natural soft diffusion.</p>
            </div>
            <div class="tip-card">
              <h4>🌙 Dark Mode vs Light Mode</h4>
              <p>Use the <strong>Invert</strong> toggle to create striking inverted black-background screensavers that look stunning on flush-front Kindles (Paperwhite / Oasis / Scribe).</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button type="button" class="btn-primary" id="btn-guide-ok">Got it, let's create!</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Close handlers
  const close = () => modal.remove();
  modal.querySelector("#btn-close-guide").addEventListener("click", close);
  modal.querySelector("#btn-guide-ok").addEventListener("click", close);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) close();
  });

  // Tab switching
  const tabBtns = modal.querySelectorAll(".modal-tab-btn");
  const panes = modal.querySelectorAll(".modal-tab-pane");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetId = `pane-${btn.dataset.tab}`;
      modal.querySelector(`#${targetId}`)?.classList.add("active");
    });
  });
}
