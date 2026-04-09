const themeSwitcher = document.getElementById("theme-switcher-select");
const stylesheet = document.getElementById("theme-stylesheet");

const defaultThemeUrl = stylesheet.href.split("/");
const defaultTheme = defaultThemeUrl[defaultThemeUrl.length - 1];

setTheme(defaultTheme);

function setTheme(theme) {
  stylesheet.href = theme;
  document.getElementsByTagName("h1")[0].innerText = theme;
}

themeSwitcher.addEventListener("change", (e) => setTheme(e.target.value));

function initColorPickerDialog(dialog) {
  const spectrumWidth = 190;
  const spectrumHeight = 181;
  const luminanceWidth = 12;
  const luminanceHeight = 181;

  const spectrum = dialog.querySelector('[data-role="spectrum"]');
  const spectrumCanvas = dialog.querySelector('[data-role="spectrum-canvas"]');
  const spectrumCursor = dialog.querySelector('[data-role="spectrum-cursor"]');
  const luminance = dialog.querySelector('[data-role="luminance"]');
  const luminanceCanvas = dialog.querySelector('[data-role="luminance-canvas"]');
  const luminanceArrows = dialog.querySelector('[data-role="luminance-arrows"]');
  const previewNew = dialog.querySelector('[data-role="preview-new"]');
  const basicGrid = dialog.querySelector('[data-role="basic-swatches"]');
  const customGrid = dialog.querySelector('[data-role="custom-swatches"]');
  const saveCustomButton = dialog.querySelector('[data-action="save-custom"]');

  if (!spectrumCanvas || !luminanceCanvas || !previewNew || !basicGrid || !customGrid || !saveCustomButton) {
    return;
  }

  const inputs = {
    hue: dialog.querySelector('[data-channel="hue"]'),
    sat: dialog.querySelector('[data-channel="sat"]'),
    lum: dialog.querySelector('[data-channel="lum"]'),
    red: dialog.querySelector('[data-channel="red"]'),
    green: dialog.querySelector('[data-channel="green"]'),
    blue: dialog.querySelector('[data-channel="blue"]'),
  };

  let hue = 0;
  let sat = 100;
  let lum = 50;
  let customIndex = 0;
  let draggingSpectrum = false;
  let draggingLuminance = false;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;

    if (s === 0) {
      const gray = Math.round(l * 255);
      return [gray, gray, gray];
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    function channel(t) {
      let value = t;
      if (value < 0) value += 1;
      if (value > 1) value -= 1;
      if (value < 1 / 6) return p + (q - p) * 6 * value;
      if (value < 1 / 2) return q;
      if (value < 2 / 3) return p + (q - p) * (2 / 3 - value) * 6;
      return p;
    }

    return [
      Math.round(channel(h + 1 / 3) * 255),
      Math.round(channel(h) * 255),
      Math.round(channel(h - 1 / 3) * 255),
    ];
  }

  function rgbToHsl(r, g, b) {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;
    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    let h = 0;
    let s = 0;
    const l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

      if (max === red) {
        h = (green - blue) / d + (green < blue ? 6 : 0);
      } else if (max === green) {
        h = (blue - red) / d + 2;
      } else {
        h = (red - green) / d + 4;
      }

      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b]
      .map((channel) => channel.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()}`;
  }

  function hexToRgb(hex) {
    const matches = hex.replace("#", "").match(/.{2}/g);
    if (!matches) {
      return [0, 0, 0];
    }
    return matches.map((channel) => Number.parseInt(channel, 16));
  }

  function rgbStyleToHex(value) {
    if (value.startsWith("#")) {
      return value.toUpperCase();
    }

    const matches = value.match(/\d+/g);
    if (!matches) {
      return "#000000";
    }

    return rgbToHex(Number(matches[0]), Number(matches[1]), Number(matches[2]));
  }

  function drawSpectrum() {
    const ctx = spectrumCanvas.getContext("2d");
    const image = ctx.createImageData(spectrumWidth, spectrumHeight);

    for (let y = 0; y < spectrumHeight; y += 1) {
      for (let x = 0; x < spectrumWidth; x += 1) {
        const [r, g, b] = hslToRgb((x / spectrumWidth) * 360, (1 - y / spectrumHeight) * 100, 50);
        const index = (y * spectrumWidth + x) * 4;
        image.data[index] = r;
        image.data[index + 1] = g;
        image.data[index + 2] = b;
        image.data[index + 3] = 255;
      }
    }

    ctx.putImageData(image, 0, 0);
  }

  function drawLuminance() {
    const ctx = luminanceCanvas.getContext("2d");

    for (let y = 0; y < luminanceHeight; y += 1) {
      const [r, g, b] = hslToRgb(hue, sat, (1 - y / luminanceHeight) * 100);
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(0, y, luminanceWidth, 1);
    }
  }

  function updateUI() {
    const [r, g, b] = hslToRgb(hue, sat, lum);
    const hex = rgbToHex(r, g, b);

    spectrumCursor.style.left = `${(hue / 360) * spectrumWidth}px`;
    spectrumCursor.style.top = `${(1 - sat / 100) * spectrumHeight}px`;
    luminanceArrows.style.top = `${(1 - lum / 100) * luminanceHeight - 4}px`;
    previewNew.style.background = hex;

    inputs.hue.value = Math.round((hue / 360) * 240);
    inputs.sat.value = Math.round(sat * 2.4);
    inputs.lum.value = Math.round(lum * 2.4);
    inputs.red.value = r;
    inputs.green.value = g;
    inputs.blue.value = b;

    drawLuminance();
  }

  function setFromHsl(nextHue, nextSat, nextLum) {
    hue = clamp(nextHue, 0, 360);
    sat = clamp(nextSat, 0, 100);
    lum = clamp(nextLum, 0, 100);
    updateUI();
  }

  function setFromRgb(r, g, b) {
    [hue, sat, lum] = rgbToHsl(r, g, b);
    updateUI();
  }

  function setFromHex(hex) {
    const [r, g, b] = hexToRgb(hex);
    setFromRgb(r, g, b);
  }

  function clearSelectedSwatches() {
    dialog.querySelectorAll(".color-swatch.selected").forEach((swatch) => {
      swatch.classList.remove("selected");
    });
  }

  function selectSwatch(event, isCustomGrid) {
    const swatch = event.target.closest(".color-swatch");
    if (!swatch) {
      return;
    }

    clearSelectedSwatches();
    swatch.classList.add("selected");

    if (isCustomGrid) {
      customIndex = Array.from(customGrid.children).indexOf(swatch);
    }

    setFromHex(rgbStyleToHex(swatch.style.background));
  }

  function pickSpectrum(event) {
    const rect = spectrum.getBoundingClientRect();
    const x = clamp(event.clientX - rect.left, 0, spectrumWidth - 1);
    const y = clamp(event.clientY - rect.top, 0, spectrumHeight - 1);

    hue = Math.round((x / spectrumWidth) * 360);
    sat = Math.round((1 - y / spectrumHeight) * 100);
    updateUI();
  }

  function pickLuminance(event) {
    const rect = luminance.getBoundingClientRect();
    const y = clamp(event.clientY - rect.top, 0, luminanceHeight - 1);

    lum = Math.round((1 - y / luminanceHeight) * 100);
    updateUI();
  }

  spectrum.addEventListener("mousedown", (event) => {
    draggingSpectrum = true;
    pickSpectrum(event);
    event.preventDefault();
  });

  luminance.addEventListener("mousedown", (event) => {
    draggingLuminance = true;
    pickLuminance(event);
    event.preventDefault();
  });

  window.addEventListener("mousemove", (event) => {
    if (draggingSpectrum) {
      pickSpectrum(event);
    }
    if (draggingLuminance) {
      pickLuminance(event);
    }
  });

  window.addEventListener("mouseup", () => {
    draggingSpectrum = false;
    draggingLuminance = false;
  });

  basicGrid.addEventListener("click", (event) => selectSwatch(event, false));
  customGrid.addEventListener("click", (event) => selectSwatch(event, true));

  inputs.hue.addEventListener("input", () => setFromHsl((Number(inputs.hue.value) / 240) * 360, sat, lum));
  inputs.sat.addEventListener("input", () => setFromHsl(hue, Math.round(Number(inputs.sat.value) / 2.4), lum));
  inputs.lum.addEventListener("input", () => setFromHsl(hue, sat, Math.round(Number(inputs.lum.value) / 2.4)));

  function updateFromRgbInputs() {
    setFromRgb(
      Number(inputs.red.value),
      Number(inputs.green.value),
      Number(inputs.blue.value)
    );
  }

  inputs.red.addEventListener("input", updateFromRgbInputs);
  inputs.green.addEventListener("input", updateFromRgbInputs);
  inputs.blue.addEventListener("input", updateFromRgbInputs);

  saveCustomButton.addEventListener("click", (event) => {
    event.preventDefault();

    const swatches = customGrid.querySelectorAll(".color-swatch");
    const hex = rgbToHex(...hslToRgb(hue, sat, lum));

    swatches[customIndex].style.background = hex;
    clearSelectedSwatches();
    swatches[customIndex].classList.add("selected");
    customIndex = (customIndex + 1) % swatches.length;
  });

  drawSpectrum();
  setFromHex(rgbStyleToHex(previewNew.style.background || "#FF0000"));
}

document.querySelectorAll("[data-color-picker-dialog]").forEach((dialog) => {
  initColorPickerDialog(dialog);
});

const tabs = document.querySelectorAll("menu[role=tablist]");

for (let i = 0; i < tabs.length; i++) {
  const tab = tabs[i];

  const tabButtons = tab.querySelectorAll("menu[role=tablist] > button");

  tabButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      e.preventDefault();

      tabButtons.forEach((button) => {
        if (
          button.getAttribute("aria-controls") ===
          e.target.getAttribute("aria-controls")
        ) {
          button.setAttribute("aria-selected", true);
          openTab(e, tab);
        } else {
          button.setAttribute("aria-selected", false);
        }
      });
    })
  );
}

function openTab(event, tab) {
  const articles = tab.parentNode.querySelectorAll('[role="tabpanel"]');
  articles.forEach((p) => {
    p.setAttribute("hidden", true);
  });
  const article = tab.parentNode.querySelector(
    `[role="tabpanel"]#${event.target.getAttribute("aria-controls")}`
  );
  article.removeAttribute("hidden");
}

// Explorer Side Panel toggle
const primaryUp = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%235980D0'/%3E%3Cstop offset='1' stop-color='%232E60C1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='8' cy='8' r='7' fill='url(%23g)' stroke='%2373A1E2'/%3E%3Cpath d='M4.5 9L8 6.5L11.5 9M4.5 12L8 9.5L11.5 12' stroke='white' stroke-width='1.2' fill='none'/%3E%3C/svg%3E";
const primaryDown = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%235980D0'/%3E%3Cstop offset='1' stop-color='%232E60C1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='8' cy='8' r='7' fill='url(%23g)' stroke='%2373A1E2'/%3E%3Cpath d='M4.5 6L8 8.5L11.5 6M4.5 9L8 11.5L11.5 9' stroke='white' stroke-width='1.2' fill='none'/%3E%3C/svg%3E";
const defaultUp = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='1' stop-color='%23E7EEF4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='8' cy='8' r='7' fill='url(%23g)' stroke='%23AEB8DA'/%3E%3Cpath d='M4.5 9L8 6.5L11.5 9M4.5 12L8 9.5L11.5 12' stroke='%23003CA5' stroke-width='1.2' fill='none'/%3E%3C/svg%3E";
const defaultDown = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='1' stop-color='%23E7EEF4'/%3E%3C/linearGradient%3E%3C/defs%3E%3Ccircle cx='8' cy='8' r='7' fill='url(%23g)' stroke='%23AEB8DA'/%3E%3Cpath d='M4.5 6L8 8.5L11.5 6M4.5 9L8 11.5L11.5 9' stroke='%23003CA5' stroke-width='1.2' fill='none'/%3E%3C/svg%3E";

document.querySelectorAll(".explorer-panel-section-header").forEach(function (header) {
  header.addEventListener("click", function () {
    var section = header.closest(".explorer-panel-section");
    var toggle = header.querySelector(".toggle-icon");
    var isPrimary = header.classList.contains("primary");
    section.classList.toggle("collapsed");
    if (toggle) {
      var isCollapsed = section.classList.contains("collapsed");
      if (isPrimary) {
        toggle.src = isCollapsed ? primaryDown : primaryUp;
      } else {
        toggle.src = isCollapsed ? defaultDown : defaultUp;
      }
    }
  });
});

document.querySelectorAll(".desktop").forEach((desktop) => {
  const startMenuToggle = desktop.querySelector('input[name="start-menu-demo"]');

  if (!startMenuToggle) {
    return;
  }

  const startButton = desktop.querySelector(".start-button");

  const syncStartMenuDemo = () => {
    const isOpen = startMenuToggle.checked;

    desktop.dataset.startMenuOpen = String(isOpen);

    if (startButton) {
      startButton.classList.toggle("active", isOpen);
      startButton.setAttribute("aria-pressed", String(isOpen));
    }
  };

  startMenuToggle.addEventListener("change", syncStartMenuDemo);
  syncStartMenuDemo();
});
