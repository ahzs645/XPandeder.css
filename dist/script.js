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
