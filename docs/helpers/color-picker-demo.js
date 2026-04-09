const BASIC_COLORS = [
  "#FF8080", "#FFFF80", "#80FF80", "#00FF80", "#80FFFF", "#0080FF", "#FF80C0", "#FF80FF",
  "#FF0000", "#FFFF00", "#80FF00", "#00FF40", "#00FFFF", "#0080C0", "#8080C0", "#FF00FF",
  "#804040", "#FF8040", "#00FF00", "#008080", "#004080", "#8080FF", "#800040", "#FF0080",
  "#800000", "#FF8000", "#008000", "#008040", "#0000FF", "#0000A0", "#800080", "#8000FF",
  "#400000", "#804000", "#004000", "#004040", "#000080", "#000040", "#400040", "#400080",
  "#000000", "#808000", "#808040", "#808080", "#408080", "#C0C0C0", "#400040", "#FFFFFF",
];

const CUSTOM_COLORS = Array.from({ length: 16 }, () => "#FFFFFF");

function renderSwatches(colors) {
  return colors
    .map((color) => `                      <div class="color-swatch" style="background:${color}"></div>`)
    .join("\n");
}

function renderColorPickerDialog({
  dialogId = "cp-dialog",
  initialColor = "#FF0000",
  previousColor = "#000000",
} = {}) {
  return `
          [[<div class="window active" style="display: inline-block" id="${dialogId}" data-color-picker-dialog>]]
            <div class="title-bar">
              <div class="title-bar-text">Color</div>
              <div class="title-bar-controls">
                <button type="button" aria-label="Help"></button>
                <button type="button" aria-label="Close"></button>
              </div>
            </div>
            <div class="window-body">
              <div class="color-picker">
                <div class="color-picker-top">
                  <div class="color-picker-left">
                    <label style="margin-bottom: 4px">Basic colors:</label>
                    <div class="color-picker-basic" data-role="basic-swatches" style="margin-bottom: 8px">
${renderSwatches(BASIC_COLORS)}
                    </div>
                    <label style="margin-bottom: 4px">Custom colors:</label>
                    <div class="color-picker-custom" data-role="custom-swatches" style="margin-bottom: 8px">
${renderSwatches(CUSTOM_COLORS)}
                    </div>
                  </div>

                  <div class="color-picker-right">
                    <div class="color-spectrum" data-role="spectrum">
                      <canvas width="190" height="181" data-role="spectrum-canvas"></canvas>
                      <div class="color-spectrum-cursor" data-role="spectrum-cursor" style="left: 0px; top: 90px"></div>
                    </div>
                    <div class="color-luminance" data-role="luminance">
                      <canvas width="12" height="181" data-role="luminance-canvas"></canvas>
                      <div class="color-luminance-arrows" data-role="luminance-arrows" style="top: 86px">
                        <div class="color-luminance-arrow-right"></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="color-picker-controls">
                  <div class="color-picker-preview-block">
                    <div class="color-preview-label"><span>Color</span><span>|</span><span>Solid</span></div>
                    <div class="color-preview-dual">
                      <div class="color-preview-new" data-role="preview-new" style="background: ${initialColor}"></div>
                      <div class="color-preview-old" data-role="preview-old" style="background: ${previousColor}"></div>
                    </div>
                  </div>

                  <div class="color-inputs">
                    <div class="color-input-group">
                      <div class="color-input-row">
                        <label>Hue:</label>
                        <input type="number" data-channel="hue" value="0" min="0" max="360">
                      </div>
                      <div class="color-input-row">
                        <label>Sat:</label>
                        <input type="number" data-channel="sat" value="240" min="0" max="240">
                      </div>
                      <div class="color-input-row">
                        <label>Lum:</label>
                        <input type="number" data-channel="lum" value="120" min="0" max="240">
                      </div>
                    </div>
                    <div class="color-input-group">
                      <div class="color-input-row">
                        <label>Red:</label>
                        <input type="number" data-channel="red" value="255" min="0" max="255">
                      </div>
                      <div class="color-input-row">
                        <label>Green:</label>
                        <input type="number" data-channel="green" value="0" min="0" max="255">
                      </div>
                      <div class="color-input-row">
                        <label>Blue:</label>
                        <input type="number" data-channel="blue" value="0" min="0" max="255">
                      </div>
                    </div>
                  </div>
                </div>

                <div class="color-picker-bottom">
                  <div class="color-picker-bottom-left">
                    <button type="button" style="min-width: 68px">OK</button>
                    <button type="button" style="min-width: 68px">Cancel</button>
                  </div>
                  <button type="button" data-action="add-custom">Add to Custom Colors</button>
                </div>
              </div>
            </div>
          [[</div>]]
        `;
}

module.exports = {
  renderColorPickerDialog,
};
