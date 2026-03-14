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

// Color picker canvas rendering
(function () {
  function hslToRgb(h, s, l) {
    h /= 360; s /= 100; l /= 100;
    var r, g, b;
    if (s === 0) { r = g = b = l; } else {
      var q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
      function f(p, q, t) { if (t < 0) t++; if (t > 1) t--; if (t < 1/6) return p+(q-p)*6*t; if (t < 1/2) return q; if (t < 2/3) return p+(q-p)*(2/3-t)*6; return p; }
      r = f(p, q, h+1/3); g = f(p, q, h); b = f(p, q, h-1/3);
    }
    return [Math.round(r*255), Math.round(g*255), Math.round(b*255)];
  }

  var specCanvas = document.getElementById("color-spectrum-canvas");
  if (specCanvas) {
    var ctx = specCanvas.getContext("2d");
    var SW = 190, SH = 181;
    var img = ctx.createImageData(SW, SH);
    for (var y = 0; y < SH; y++) {
      for (var x = 0; x < SW; x++) {
        var rgb = hslToRgb((x / SW) * 360, (1 - y / SH) * 100, 50);
        var i = (y * SW + x) * 4;
        img.data[i] = rgb[0]; img.data[i+1] = rgb[1]; img.data[i+2] = rgb[2]; img.data[i+3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  var lumCanvas = document.getElementById("color-luminance-canvas");
  if (lumCanvas) {
    var ctx2 = lumCanvas.getContext("2d");
    var LW = 10, LH = 181;
    for (var y2 = 0; y2 < LH; y2++) {
      var rgb2 = hslToRgb(160, 100, (1 - y2 / LH) * 100);
      ctx2.fillStyle = "rgb(" + rgb2[0] + "," + rgb2[1] + "," + rgb2[2] + ")";
      ctx2.fillRect(0, y2, LW, 1);
    }
  }
})();
