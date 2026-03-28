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

// Table sorting
document.querySelectorAll("table thead th").forEach((th) => {
  th.style.cursor = "pointer";

  // Add sort arrow span to each header
  const arrow = document.createElement("span");
  arrow.className = "sort-arrow";
  th.appendChild(arrow);

  th.addEventListener("click", () => {
    const table = th.closest("table");
    const tbody = table.querySelector("tbody");
    const index = Array.from(th.parentNode.children).indexOf(th);
    const rows = Array.from(tbody.querySelectorAll("tr"));

    const currentSort = th.getAttribute("aria-sort");
    const ascending = currentSort !== "ascending";

    // Reset all headers
    th.parentNode.querySelectorAll("th").forEach((h) => h.removeAttribute("aria-sort"));
    th.setAttribute("aria-sort", ascending ? "ascending" : "descending");

    rows.sort((a, b) => {
      const aText = a.children[index].textContent.trim();
      const bText = b.children[index].textContent.trim();

      // Try date parsing (DD/MM/YYYY HH:MM)
      const dateRegex = /^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2})$/;
      const aMatch = aText.match(dateRegex);
      const bMatch = bText.match(dateRegex);
      if (aMatch && bMatch) {
        const aDate = new Date(aMatch[3], aMatch[2] - 1, aMatch[1], aMatch[4], aMatch[5]);
        const bDate = new Date(bMatch[3], bMatch[2] - 1, bMatch[1], bMatch[4], bMatch[5]);
        return ascending ? aDate - bDate : bDate - aDate;
      }

      return ascending
        ? aText.localeCompare(bText)
        : bText.localeCompare(aText);
    });

    rows.forEach((row) => tbody.appendChild(row));
  });
});
