"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Eye, Image as ImageIcon, Link2, Monitor, Save, Smartphone, Type, Upload } from "lucide-react";

type Edit = { selector: string; type: "text" | "image" | "link"; value: string };
type SavedEdits = { items: Edit[]; order: string[] };
type Selection = { selector: string; type: Edit["type"]; value: string; label: string } | null;

function selectorFor(main: HTMLElement, element: Element): string {
  const parts: string[] = [];
  let current: Element | null = element;
  while (current && current !== main) {
    const tag = current.tagName.toLowerCase();
    const siblings = current.parentElement ? Array.from(current.parentElement.children).filter((node) => node.tagName === current!.tagName) : [];
    const index = siblings.indexOf(current) + 1;
    parts.unshift(`${tag}:nth-of-type(${index})`);
    current = current.parentElement;
  }
  return parts.join(" > ");
}

function readValue(element: Element, type: Edit["type"]) {
  if (type === "image" && element.tagName === "IMG") { const image = element as HTMLImageElement; return image.currentSrc || image.src; }
  if (type === "link" && element.tagName === "A") return element.getAttribute("href") || "";
  return element.textContent?.trim() || "";
}

export default function VisualEditorPage() {
  const frame = useRef<HTMLIFrameElement>(null);
  const [path, setPath] = useState("/");
  const [items, setItems] = useState<Edit[]>([]);
  const [order, setOrder] = useState<string[]>([]);
  const [selection, setSelection] = useState<Selection>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");

  const previewWidth = device === "desktop" ? "100%" : "390px";

  useEffect(() => {
    let active = true;
    fetch(`/api/visual-edits?path=${encodeURIComponent(path)}`, { cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { if (active) { setItems(Array.isArray(data.items) ? data.items : []); setOrder(Array.isArray(data.order) ? data.order : []); } })
      .catch(() => undefined);
    return () => { active = false; };
  }, [path]);

  function getMain() {
    return frame.current?.contentDocument?.querySelector("main") as HTMLElement | null;
  }

  function attachEditor() {
    const doc = frame.current?.contentDocument;
    const main = getMain();
    if (!doc || !main) return;
    doc.querySelectorAll("[data-aa-editor-outline]").forEach((node) => node.removeAttribute("data-aa-editor-outline"));
    const style = doc.getElementById("aa-visual-editor-style") || doc.createElement("style");
    style.id = "aa-visual-editor-style";
    style.textContent = "[data-aa-editor-outline]{outline:2px solid #B77F60!important;outline-offset:3px;cursor:pointer!important}[data-aa-editor-hover]{outline:2px dashed #20242B!important;outline-offset:3px;cursor:pointer!important}";
    doc.head.appendChild(style);

    const onClick = (event: Event) => {
      const target = event.target;
      if (!target || typeof (target as Element).closest !== "function") return;
      const element = (target as Element).closest("img,a,h1,h2,h3,h4,p,span,button") as HTMLElement | null;
      if (!element || !main.contains(element)) return;
      if (element.closest("form,input,select,textarea")) return;
      event.preventDefault();
      event.stopPropagation();
      const type: Edit["type"] = element.tagName === "IMG" ? "image" : element.tagName === "A" ? "link" : "text";
      const selector = selectorFor(main, element);
      const value = readValue(element, type);
      setSelection({ selector, type, value, label: element.tagName.toLowerCase() });
      doc.querySelectorAll("[data-aa-editor-outline]").forEach((node) => node.removeAttribute("data-aa-editor-outline"));
      element.setAttribute("data-aa-editor-outline", "true");
    };
    const onOver = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const element = target.closest("img,a,h1,h2,h3,h4,p,span,button");
      if (element && main.contains(element)) {
        doc.querySelectorAll("[data-aa-editor-hover]").forEach((node) => node.removeAttribute("data-aa-editor-hover"));
        element.setAttribute("data-aa-editor-hover", "true");
      }
    };
    doc.addEventListener("click", onClick, true);
    doc.addEventListener("mouseover", onOver, true);
    const children = Array.from(main.children);
    children.forEach((child, index) => {
      (child as HTMLElement).draggable = true;
      if (!child.hasAttribute("data-aa-section-id")) child.setAttribute("data-aa-section-id", String(index));
      child.addEventListener("dragstart", (event: Event) => (event as DragEvent).dataTransfer?.setData("text/plain", child.getAttribute("data-aa-section-id") || String(index)));
      child.addEventListener("dragover", (event) => event.preventDefault());
      child.addEventListener("drop", (event: Event) => {
        event.preventDefault();
        const fromId = (event as DragEvent).dataTransfer?.getData("text/plain");
        const nodes = Array.from(main.children);
        const moving = nodes.find((node) => node.getAttribute("data-aa-section-id") === fromId);
        const from = moving ? nodes.indexOf(moving) : -1;
        const to = nodes.indexOf(child);
        if (!moving || from < 0 || from === to) return;
        if (from < to) main.insertBefore(moving, child.nextSibling);
        else main.insertBefore(moving, child);
        setOrder(Array.from(main.children).map((node) => node.getAttribute("data-aa-section-id") || ""));
        setMessage("Section order changed. Save to keep it.");
      });
    });
    return () => {
      doc.removeEventListener("click", onClick, true);
      doc.removeEventListener("mouseover", onOver, true);
    };
  }

  function updateSelection(value: string) {
    if (!selection) return;
    const next = { ...selection, value };
    setSelection(next);
    const main = getMain();
    const element = main?.querySelector(selection.selector);
    if (!element) return;
    if (selection.type === "text") element.textContent = value;
    if (selection.type === "image" && element.tagName === "IMG") (element as HTMLImageElement).src = value;
    if (selection.type === "link" && element.tagName === "A") (element as HTMLAnchorElement).href = value;
    setItems((current) => {
      const rest = current.filter((item) => !(item.selector === selection.selector && item.type === selection.type));
      return [...rest, { selector: selection.selector, type: selection.type, value }];
    });
  }

  async function uploadSelected(file?: File) {
    if (!file || !selection || selection.type !== "image") return;
    setUploading(true);
    setMessage("");
    try {
      const body = new FormData();
      body.append("file", file);
      const response = await fetch("/api/admin/media", { method: "POST", body });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Upload failed.");
      updateSelection(data.url);
      setMessage("Image uploaded. Save your changes to publish it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/visual-edits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path, items, order }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save.");
      setMessage("Saved. Your published page will use these changes.");
      frame.current?.contentWindow?.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  const pageOptions = useMemo(() => [
    { label: "Homepage", path: "/" },
    { label: "About", path: "/about" },
    { label: "Shop", path: "/shop" },
    { label: "Gift Sets", path: "/gift-sets" },
    { label: "Contact", path: "/contact" },
  ], []);

  return (
    <div className="mx-auto max-w-[1600px] space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/admin/content?section=home" className="inline-flex items-center gap-2 text-xs font-semibold text-[#747B87] hover:text-[#20242B]"><ArrowLeft size={14} /> Back to Website Editor</Link>
          <h1 className="mt-2 text-2xl font-bold text-[#20242B] sm:text-3xl">Visual website editor</h1>
          <p className="mt-1 text-sm text-[#747B87]">Select text, images or links on the page. Drag the main sections to rearrange them.</p>
        </div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 bg-[#20242B] px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"><Save size={16} /> {saving ? "Saving…" : "Save changes"}</button>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
        <label className="text-xs font-semibold text-[#68707D]">Page</label>
        <select value={path} onChange={(event) => { setPath(event.target.value); setSelection(null); }} className="rounded-lg border border-[#E5E7EB] px-3 py-2 text-sm">
          {pageOptions.map((option) => <option key={option.path} value={option.path}>{option.label}</option>)}
        </select>
        <span className="mx-1 hidden h-6 border-l border-[#E5E7EB] sm:block" />
        <button onClick={() => setDevice("desktop")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${device === "desktop" ? "bg-[#20242B] text-white" : "bg-[#F3F4F6] text-[#68707D]"}`}><Monitor size={15} /> Desktop</button>
        <button onClick={() => setDevice("mobile")} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${device === "mobile" ? "bg-[#20242B] text-white" : "bg-[#F3F4F6] text-[#68707D]"}`}><Smartphone size={15} /> Mobile</button>
        <button onClick={() => frame.current?.contentWindow?.location.reload()} className="ml-auto inline-flex items-center gap-2 rounded-lg bg-[#F3F4F6] px-3 py-2 text-xs font-semibold text-[#68707D]"><Eye size={15} /> Refresh preview</button>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-[70vh] overflow-auto rounded-xl border border-[#D9DDE4] bg-[#E9EBEF] p-3">
          <div className="mx-auto overflow-hidden bg-white shadow-lg transition-all" style={{ width: previewWidth, maxWidth: "100%" }}>
            <iframe ref={frame} title="Live website preview" src={path} onLoad={() => { attachEditor(); setSelection(null); }} className="block h-[78vh] w-full border-0" />
          </div>
        </div>
        <aside className="h-fit rounded-xl border border-[#E5E7EB] bg-white p-4">
          <h2 className="text-sm font-bold text-[#20242B]">Selected element</h2>
          {!selection ? (
            <p className="mt-3 text-xs leading-5 text-[#747B87]">Click a heading, paragraph, image or link in the preview to edit it. Drag a homepage section to change its order.</p>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#8B5D45]">
                {selection.type === "text" ? <Type size={14} /> : selection.type === "image" ? <ImageIcon size={14} /> : <Link2 size={14} />}
                {selection.type} · {selection.label}
              </div>
              {selection.type === "image" && <img src={selection.value} alt="Selected preview" className="max-h-36 w-full object-contain bg-[#F6F7F9]" />}
              <label className="block text-xs font-semibold text-[#68707D]">{selection.type === "text" ? "Text content" : selection.type === "image" ? "Image URL" : "Link destination"}
                <textarea value={selection.value} onChange={(event) => updateSelection(event.target.value)} rows={selection.type === "text" ? 5 : 3} className="mt-2 w-full rounded-lg border border-[#DDE1E7] p-3 text-sm font-normal text-[#20242B] outline-none focus:border-[#B77F60]" />
              </label>
              {selection.type === "image" && <label className="flex cursor-pointer items-center justify-center gap-2 border border-dashed border-[#C9CDD5] px-3 py-3 text-xs font-semibold text-[#68707D] hover:border-[#B77F60]"><Upload size={15} /> {uploading ? "Uploading…" : "Upload replacement image"}<input type="file" accept="image/*" className="hidden" disabled={uploading} onChange={(event) => uploadSelected(event.target.files?.[0])} /></label>}
              <button onClick={() => { setItems((current) => current.filter((item) => item.selector !== selection.selector)); setSelection(null); }} className="text-xs font-semibold text-red-600">Clear saved edit for this element</button>
            </div>
          )}
          {message && <p role="status" className="mt-4 border-t border-[#ECEEF2] pt-3 text-xs leading-5 text-[#68707D]">{message}</p>}
          <div className="mt-5 border-t border-[#ECEEF2] pt-4">
            <p className="flex items-center gap-2 text-xs font-bold text-[#20242B]"><Check size={14} /> Changes are drafts until saved</p>
            <p className="mt-1 text-[11px] leading-5 text-[#858B96]">Text, image and link changes are stored separately from your products and checkout settings.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
