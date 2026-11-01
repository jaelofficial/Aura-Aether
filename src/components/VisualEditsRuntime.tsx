"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type Edit = { selector: string; type: "text" | "image" | "link"; value: string };
type SavedEdits = { items?: Edit[]; order?: string[] };

function applyEdits(data: SavedEdits) {
  const main = document.querySelector("main");
  if (!main) return;
  for (const edit of data.items || []) {
    let element: Element | null = null;
    try { element = main.querySelector(edit.selector); } catch { continue; }
    if (!element) continue;
    if (edit.type === "text") element.textContent = edit.value;
    if (edit.type === "image" && element instanceof HTMLImageElement) element.src = edit.value;
    if (edit.type === "link" && element instanceof HTMLAnchorElement) element.href = edit.value;
  }
  if (data.order?.length) {
    const children = Array.from(main.children);
    const byId = new Map<string, Element>();
    children.forEach((child, index) => {
      if (!child.hasAttribute("data-aa-section-id")) child.setAttribute("data-aa-section-id", String(index));
      const id = child.getAttribute("data-aa-section-id");
      if (id !== null) byId.set(id, child);
    });
    const ordered = data.order.map((id) => byId.get(id)).filter((node): node is Element => !!node);
    if (ordered.length === children.length) ordered.forEach((node) => main.appendChild(node));
  }
}

export default function VisualEditsRuntime() {
  const pathname = usePathname();
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/visual-edits?path=${encodeURIComponent(pathname || "/")}`, { cache: "no-store" })
      .then((res) => res.ok ? res.json() : null)
      .then((data: SavedEdits | null) => { if (!cancelled && data) applyEdits(data); })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, [pathname]);
  return null;
}
