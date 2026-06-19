/*!
 * XP.css — Start Menu flyout positioning (optional enhancement)
 *
 * The Start Menu styles need NO JavaScript: submenus open on
 * :hover / :focus-within / .is-open through CSS alone. This module is an
 * OPTIONAL layer that keeps cascading flyouts inside the viewport — nudging
 * them up/down or flipping them to the left of their anchor when they would
 * run off a screen edge, the way real Windows menus do.
 *
 * Bundler / framework usage:
 *   import { positionFlyout, initStartMenu } from "xp.css/dist/xp-start-menu.js";
 *   // Call positionFlyout(submenuEl, anchorEl) whenever you reveal a submenu
 *   // (e.g. from a React layout effect), or call initStartMenu(rootEl) once to
 *   // auto-manage every hover/focus flyout under rootEl.
 *
 * Vanilla usage (ES module):
 *   <script type="module">
 *     import { initStartMenu } from "./xp-start-menu.js";
 *     initStartMenu(document);
 *   </script>
 *
 * The module also assigns window.XP = { positionFlyout, initStartMenu } for
 * non-bundler consumers.
 */

const FLIP_LEFT = "start-menu-submenu--flip-left";

function viewport() {
  return {
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight
  };
}

/**
 * Keep a flyout submenu inside the viewport. Measures the submenu at its
 * natural CSS position, then applies a vertical translate to clear the
 * top/bottom edge and/or flips it to the left to clear the right edge.
 * Position-agnostic: works for menus anchored top:0 or bottom:0, at any
 * cascade depth.
 *
 * @param {HTMLElement} submenu  The .start-menu-submenu being shown.
 * @param {HTMLElement} [anchor] The item it cascades from (reserved; unused).
 * @param {{padding?: number}} [options] Min gap from the viewport edge (px).
 */
export function positionFlyout(submenu, anchor, options) {
  if (!submenu) return;
  const padding = options && options.padding != null ? options.padding : 8;
  const vp = viewport();

  // Reset prior adjustments so we measure the natural position.
  submenu.style.transform = "";
  submenu.classList.remove(FLIP_LEFT);

  let rect = submenu.getBoundingClientRect();

  // Horizontal: if it spills past the right edge, cascade to the left.
  if (rect.right + padding > vp.width) {
    submenu.classList.add(FLIP_LEFT);
    rect = submenu.getBoundingClientRect();
  }

  // Vertical: clamp into [padding, viewportHeight - padding].
  let dy = 0;
  if (rect.bottom + padding > vp.height) {
    dy = vp.height - padding - rect.bottom;
  }
  if (rect.top + dy < padding) {
    dy = padding - rect.top;
  }
  if (dy) {
    submenu.style.transform = "translateY(" + Math.round(dy) + "px)";
  }
}

function childFlyout(trigger) {
  const children = trigger.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.classList && child.classList.contains("start-menu-submenu")) {
      return child;
    }
  }
  return null;
}

/**
 * Auto-manage every hover/focus flyout under `root`: reposition each
 * cascading submenu the instant it is revealed, and clear the adjustment
 * when it closes. Triggers are elements with aria-haspopup="true" that own
 * a direct-child .start-menu-submenu.
 *
 * @param {Document|HTMLElement} [root=document]
 * @param {{padding?: number}} [options]
 * @returns {() => void} teardown function that removes all listeners.
 */
export function initStartMenu(root, options) {
  root = root || document;
  const triggers = root.querySelectorAll('[aria-haspopup="true"]');
  const bound = [];

  function open(trigger) {
    const flyout = childFlyout(trigger);
    if (!flyout) return;
    // Wait a frame so the revealed submenu is laid out before measuring.
    window.requestAnimationFrame(function () {
      positionFlyout(flyout, trigger, options);
    });
  }

  function close(trigger) {
    const flyout = childFlyout(trigger);
    if (!flyout) return;
    flyout.style.transform = "";
    flyout.classList.remove(FLIP_LEFT);
  }

  triggers.forEach(function (trigger) {
    const onOpen = function () { open(trigger); };
    const onClose = function () { close(trigger); };
    trigger.addEventListener("mouseenter", onOpen);
    trigger.addEventListener("focusin", onOpen);
    trigger.addEventListener("mouseleave", onClose);
    trigger.addEventListener("focusout", onClose);
    bound.push([trigger, onOpen, onClose]);
  });

  return function teardown() {
    bound.forEach(function (entry) {
      const trigger = entry[0];
      trigger.removeEventListener("mouseenter", entry[1]);
      trigger.removeEventListener("focusin", entry[1]);
      trigger.removeEventListener("mouseleave", entry[2]);
      trigger.removeEventListener("focusout", entry[2]);
    });
    bound.length = 0;
  };
}

if (typeof window !== "undefined") {
  window.XP = Object.assign(window.XP || {}, { positionFlyout, initStartMenu });
}
