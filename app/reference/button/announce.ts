/**
 * Announces a message to screen reader users through one polite live region,
 * shared by every component on the page.
 *
 * Screen readers only announce changes to a live region that's already in the
 * page, so components prepare it when they mount, long before anything is
 * announced. Each message is a new node, so repeating a message announces it again.
 */
let region: HTMLElement | undefined;

export function prepareAnnouncer(): HTMLElement {
  if (region?.isConnected) return region;
  region = document.createElement("div");
  region.setAttribute("role", "status");
  // Visually hidden, but not with display: none, which would take it out of the accessibility tree.
  region.style.cssText =
    "position:absolute;width:1px;height:1px;margin:-1px;overflow:hidden;clip-path:inset(50%);white-space:nowrap";
  document.body.append(region);
  return region;
}

export function announce(message: string) {
  const node = document.createElement("div");
  node.textContent = message;
  prepareAnnouncer().append(node);
  setTimeout(() => node.remove(), 5000);
}
