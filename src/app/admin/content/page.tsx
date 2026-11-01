"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Save, Upload, House, Palette, ShoppingBag, Gift, Mail, Sparkles, Truck } from "lucide-react";
import ProductImageLibrary from "@/components/admin/ProductImageLibrary";

type Settings = Record<string, string>;
type AdminUser = { id: string; name: string; email: string; role: "ADMIN" };
type Field = { key: string; label: string; help?: string; multiline?: boolean; type?: string; image?: boolean; options?: { label: string; value: string }[] };
type EditorGroup = { title: string; description: string; fields: Field[] };

const initial: Settings = {
  brandName: "Aura & Aether Parfums",
  logoUrl: "/images/aura-aether-logo.svg",
  primaryColor: "#17110F",
  accentColor: "#B77F60",
  backgroundColor: "#FCFBF9",
  announcement: "Find your signature scent with Aura & Aether Parfums.",
  footerDescription: "Discover fragrances that feel like you. Find your signature scent, mark a moment, and leave a little magic wherever you go.",
  heroTitle: "Aura & Aether",
  heroDescription: "Fragrance that says something about you. Find the scent that feels like yours.",
  motto: "Your scent. Your signature.",
  heroImageUrl: "/images/hero-placeholder-1.svg",
  heroImageUrl2: "/images/hero-placeholder-2.svg",
  heroImageUrl3: "/images/hero-placeholder-3.svg",
  heroCtaLabel: "Explore the collection",
  heroCtaUrl: "/shop",
  heroCtaAlignment: "center",
  homeFeaturedCtaLabel: "View All Fragrances",
  homeFeaturedCtaUrl: "/shop",
  homeFeaturedEyebrow: "OUR COLLECTION",
  homeFeaturedTitle: "Featured fragrances.",
  homeGiftTitle: "Curated Gift Sets.",
  homeGiftDescription: "Thoughtfully chosen fragrances for meaningful moments and memorable gifts.",
  homePromoTitle: "Find your next signature",
  homePromoDescription: "Explore fragrances for every mood, moment, and version of you.",
  homePromoImageUrl: "/images/spring-peonies.svg",
  aboutTitle: "Our story",
  aboutIntro: "Aura & Aether was created for the moments, moods, and memories that make you who you are.",
  aboutImageUrl: "/images/hero-placeholder-1.svg",
  shopEyebrow: "THE COLLECTION",
  shopTitle: "Find your fragrance.",
  shopDescription: "Explore scents for every mood, moment, and personal signature.",
  giftSetsEyebrow: "GIFT WITH MEANING",
  giftSetsTitle: "Gift Sets",
  giftSetsDescription: "Discover thoughtful fragrance gifts made for celebrations, everyday moments, and people you love.",
  contactEyebrow: "WE ARE HERE TO HELP",
  contactTitle: "Contact Aura & Aether",
  contactDescription: "Questions about a fragrance or an order? We would love to hear from you.",
  contactEmail: "concierge@aura-aether.com",
  contactPhone: "+233 (0) 24 892 4110",
  contactAddress: "Accra, Ghana",
  deliveryOrigin: "Adenta, Accra, Ghana",
  deliveryFreePromo: "false",
  deliveryRanges: "",
};

const groups: Record<string, EditorGroup[]> = {
  home: [
    { title: "Hero content", description: "Change the main headline, description and call-to-action.", fields: [
      { key: "heroTitle", label: "Main heading" },
      { key: "heroDescription", label: "Description", multiline: true },
      { key: "motto", label: "Tagline" },
      { key: "heroCtaLabel", label: "Button label" },
      { key: "heroCtaUrl", label: "Button destination", help: "Use a site path such as /shop or /gift-sets." },
      { key: "heroCtaAlignment", label: "Button placement", options: [{ label: "Left", value: "left" }, { label: "Centre", value: "center" }, { label: "Right", value: "right" }] },
    ]},
    { title: "Homepage sections", description: "The copy shown around featured fragrances and promotions.", fields: [
      { key: "homeFeaturedEyebrow", label: "Featured eyebrow" },
      { key: "homeFeaturedTitle", label: "Featured heading" },
      { key: "homeFeaturedCtaLabel", label: "Featured section button label" },
      { key: "homeFeaturedCtaUrl", label: "Featured section button destination", help: "Use a site path such as /shop." },
      { key: "homePromoTitle", label: "Promotion heading" },
      { key: "homePromoDescription", label: "Promotion description", multiline: true },
      { key: "homePromoImageUrl", label: "Promotion image", image: true },
    ]},
  ],
  brand: [{ title: "Brand, navigation & footer", description: "Shared identity and site-wide presentation.", fields: [
    { key: "brandName", label: "Brand name" },
    { key: "logoUrl", label: "Logo image", image: true },
    { key: "primaryColor", label: "Primary colour (hex)" },
    { key: "accentColor", label: "Accent colour (hex)" },
    { key: "backgroundColor", label: "Background colour (hex)" },
    { key: "announcement", label: "Announcement bar message", multiline: true },
    { key: "footerDescription", label: "Footer description", multiline: true },
  ]}],
  shop: [{ title: "Shop page", description: "Edit the text at the top of the shop catalogue.", fields: [
    { key: "shopEyebrow", label: "Small heading" },
    { key: "shopTitle", label: "Page heading" },
    { key: "shopDescription", label: "Page description", multiline: true },
  ]}],
  gifts: [{ title: "Gift Sets page", description: "Edit the heading and introduction above your gift collection.", fields: [
    { key: "giftSetsEyebrow", label: "Small heading" },
    { key: "giftSetsTitle", label: "Page heading" },
    { key: "giftSetsDescription", label: "Page description", multiline: true },
  ]}],
  about: [{ title: "About page", description: "Edit your public brand story introduction.", fields: [
    { key: "aboutTitle", label: "Page heading" },
    { key: "aboutIntro", label: "Introduction", multiline: true },
    { key: "aboutImageUrl", label: "About page image", image: true, help: "Upload a replacement image for the “Your scent. Your signature.” section." },
  ]}],
  contact: [{ title: "Contact page", description: "Customer-facing contact details and introductory copy.", fields: [
    { key: "contactEyebrow", label: "Small heading" },
    { key: "contactTitle", label: "Page heading" },
    { key: "contactDescription", label: "Page description", multiline: true },
    { key: "contactEmail", label: "Contact email", type: "email" },
    { key: "contactPhone", label: "Contact phone" },
    { key: "contactAddress", label: "Contact address", multiline: true },
  ]}],
  delivery: [{ title: "Delivery pricing & promotions", description: "Set your delivery starting point, delivery fee ranges and an optional store-wide free-delivery promotion.", fields: [
    { key: "deliveryOrigin", label: "Delivery starting point", help: "Current starting point: Adenta, Accra, Ghana." },
    { key: "deliveryFreePromo", label: "Free delivery for all orders", options: [{ label: "Off — use normal delivery rates", value: "false" }, { label: "On — all orders have free delivery", value: "true" }] },
    { key: "deliveryRanges", label: "Delivery ranges and fees", multiline: true, help: "One range per line, in this format: Range label|Fee in GH₵. Example: 0–5 km|20. Customers choose the range that applies to their location. Enter your own ranges and prices, then save." },
  ]}],
};

const pages = [
  { id: "home", label: "Homepage", description: "Hero slides, featured products and promotion", icon: House },
  { id: "brand", label: "Brand & navigation", description: "Logo, colours, announcement and footer", icon: Palette },
  { id: "shop", label: "Shop", description: "Shop page introduction", icon: ShoppingBag },
  { id: "gifts", label: "Gift Sets", description: "Gift collection introduction", icon: Gift },
  { id: "about", label: "About", description: "Brand story introduction", icon: Sparkles },
  { id: "contact", label: "Contact", description: "Contact details and copy", icon: Mail },
  { id: "delivery", label: "Delivery", description: "Delivery ranges, fees and free-delivery promotions", icon: Truck },
];

export default function StorefrontContentPage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<Settings>(initial);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [activeSection, setActiveSection] = useState("home");
  const [uploadingKey, setUploadingKey] = useState("");

  useEffect(() => {
    let active = true;
    fetch("/api/auth/admin-me")
      .then(async (res) => {
        const data = await res.json().catch(() => ({}));
        if (!active) return;
        setUser(res.ok && data.user?.role === "ADMIN" ? data.user : null);
      })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const section = new URLSearchParams(window.location.search).get("section");
    if (section && pages.some((page) => page.id === section)) setActiveSection(section);
  }, []);

  useEffect(() => {
    fetch("/api/site-settings")
      .then(async (res) => {
        if (!res.ok) throw new Error("Could not load saved settings.");
        const data = await res.json();
        setSettings({ ...initial, ...data.settings });
      })
      .catch((error) => setMessage(error instanceof Error ? error.message : "Could not load saved settings."))
      .finally(() => setLoading(false));
  }, []);

  async function uploadImage(key: string, file?: File) {
    if (!file) return;
    setUploadingKey(key);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/media", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Image upload failed");
      setSettings((current) => ({ ...current, [key]: data.url }));
      setMessage("Upload complete. Select Save changes to publish this image.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Image upload failed.");
    } finally {
      setUploadingKey("");
    }
  }

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await fetch("/api/site-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setMessage("Changes saved successfully.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save changes.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || loading) return <div className="mx-auto max-w-4xl p-10 text-sm text-[#747B87]">Loading editor…</div>;
  if (!user || user.role !== "ADMIN") return <div className="mx-auto max-w-xl rounded-2xl border border-[#E5E7EB] bg-white p-8 text-center"><h1 className="text-2xl font-bold">Admin access required</h1><p className="mt-2 text-sm text-[#747B87]">Sign in with an administrator account to manage the store.</p><a href="/login" className="mt-5 inline-flex rounded-lg bg-[#20242B] px-4 py-2 text-sm font-semibold text-white">Go to sign in</a></div>;

  const selectedPage = pages.find((page) => page.id === activeSection) || pages[0];
  const SelectedIcon = selectedPage.icon;

  return (
    <div className="mx-auto max-w-[1450px] space-y-7 font-sans-clean">
      <div className="flex flex-col justify-between gap-4 border-b border-[#E5E7EB] pb-6 md:flex-row md:items-end">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8B5D45]">Storefront control centre</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-[#20242B] sm:text-4xl">Website editor</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#747B87]">Choose a page, update its content, preview every editable image and save your changes.</p>
        </div>
        
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {pages.map((page) => {
          const Icon = page.icon;
          const active = activeSection === page.id;
          return <button key={page.id} type="button" onClick={() => { setActiveSection(page.id); window.history.replaceState(null, "", "/admin/content?section=" + page.id); }} className={`group rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${active ? "border-[#B77F60] bg-[#FFF9F5] shadow-sm" : "border-[#E5E7EB] bg-white hover:border-[#D5C0B2]"}`}>
            <span className={`grid h-10 w-10 place-items-center rounded-xl transition-colors ${active ? "bg-[#20242B] text-white" : "bg-[#F1F3F6] text-[#68707D] group-hover:bg-[#F7EAE1] group-hover:text-[#8B5D45]"}`}><Icon size={18} /></span>
            <span className="mt-4 block text-sm font-bold text-[#20242B]">{page.label}</span>
            <span className="mt-1 block text-xs leading-5 text-[#858B96]">{page.description}</span>
          </button>;
        })}
      </div>

      {activeSection === "home" && (
        <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
            <div><h2 className="text-lg font-bold text-[#20242B]">Homepage image gallery</h2><p className="mt-1 text-xs leading-5 text-[#858B96]">These are the rotating hero images. Upload your own image to replace any placeholder.</p></div>
            <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#8B5D45]">3 hero slides</span>
          </div>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { key: "heroImageUrl", label: "Hero slide 01" },
              { key: "heroImageUrl2", label: "Hero slide 02" },
              { key: "heroImageUrl3", label: "Hero slide 03" },
            ].map((item, index) => <div key={item.key} className="overflow-hidden rounded-xl border border-[#E8EAEE] bg-[#F8F9FB]">
              <div className="relative aspect-[16/10] overflow-hidden bg-[#E7E1DC]">
                <img src={settings[item.key] || "/images/hero-placeholder-1.svg"} alt={item.label + " preview"} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                <span className="absolute left-3 top-3 rounded-lg bg-white/90 px-2.5 py-1 text-[10px] font-bold text-[#424852]">{item.label}</span>
              </div>
              <div className="space-y-3 p-4">
                <p className="break-all text-[11px] text-[#858B96]">{settings[item.key]}</p>
                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#20242B] px-3 py-2.5 text-xs font-bold text-white transition-all hover:bg-[#424852]">
                  <Upload size={14} /> {uploadingKey === item.key ? "Uploading…" : "Replace image"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={uploadingKey === item.key} className="hidden" onChange={(e) => { void uploadImage(item.key, e.target.files?.[0]); e.currentTarget.value = ""; }} />
                </label>
              </div>
            </div>)}
          </div>
        </section>
      )}

      <form onSubmit={saveSettings} className="space-y-5">
        {groups[activeSection].map((group) => <section key={group.title} className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-7">
          <div className="mb-6 flex items-start gap-3 border-b border-[#F0F1F4] pb-5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#F1F3F6] text-[#6D7480]"><SelectedIcon size={17} /></span>
            <div><h2 className="text-base font-bold text-[#20242B]">{group.title}</h2><p className="mt-1 text-xs leading-5 text-[#858B96]">{group.description}</p></div>
          </div>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {group.fields.map((field) => <label key={field.key} className={`block ${field.multiline || field.image ? "md:col-span-2" : ""}`}>
              <span className="block text-xs font-bold text-[#454C57]">{field.label}</span>
              {field.help && <span className="mt-1 block text-xs text-[#858B96]">{field.help}</span>}
              {field.image ? <div className="mt-3 grid grid-cols-1 gap-4 rounded-xl border border-[#E8EAEE] bg-[#FAFBFC] p-3 sm:grid-cols-[180px_1fr]">
                <div className="aspect-[4/3] overflow-hidden rounded-lg bg-[#E7E1DC]"><img src={settings[field.key] || "/images/hero-placeholder-1.svg"} alt={field.label + " preview"} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" /></div>
                <div className="flex flex-col justify-center gap-3">
                  <input value={settings[field.key] || ""} onChange={(e) => setSettings((current) => ({ ...current, [field.key]: e.target.value }))} className="w-full rounded-lg border border-[#E0E3E8] bg-white px-3 py-2.5 text-sm outline-none transition focus:border-[#B77F60] focus:ring-2 focus:ring-[#B77F60]/10" placeholder="Image URL or public path" />
                  <label className="inline-flex w-fit cursor-pointer items-center gap-2 rounded-lg border border-[#DDE1E7] bg-white px-3 py-2 text-xs font-bold text-[#4F5662] transition hover:border-[#B77F60] hover:text-[#8B5D45]"><Upload size={14} /> {uploadingKey === field.key ? "Uploading…" : "Upload replacement"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={uploadingKey === field.key} className="hidden" onChange={(e) => { void uploadImage(field.key, e.target.files?.[0]); e.currentTarget.value = ""; }} /></label>
                  <p className="text-[10px] leading-4 text-[#858B96]">JPG, PNG, WebP, GIF or AVIF · max 10 MB</p>
                </div>
              </div> : field.options ? <select value={settings[field.key] || ""} onChange={(e) => setSettings((current) => ({ ...current, [field.key]: e.target.value }))} className="mt-2 w-full rounded-xl border border-[#E0E3E8] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#B77F60] focus:ring-2 focus:ring-[#B77F60]/10">{field.options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select> : field.multiline ? <textarea rows={4} value={settings[field.key] || ""} onChange={(e) => setSettings((current) => ({ ...current, [field.key]: e.target.value }))} className="mt-2 w-full rounded-xl border border-[#E0E3E8] bg-white px-3.5 py-3 text-sm leading-6 outline-none transition focus:border-[#B77F60] focus:ring-2 focus:ring-[#B77F60]/10" /> : <input type={field.type || "text"} value={settings[field.key] || ""} onChange={(e) => setSettings((current) => ({ ...current, [field.key]: e.target.value }))} className="mt-2 w-full rounded-xl border border-[#E0E3E8] bg-white px-3.5 py-3 text-sm outline-none transition focus:border-[#B77F60] focus:ring-2 focus:ring-[#B77F60]/10" />}
            </label>)}
          </div>
        </section>)}

        {message && <div role="status" className={`flex items-start gap-2 rounded-xl border p-4 text-sm ${message.toLowerCase().includes("could not") || message.toLowerCase().includes("failed") ? "border-red-200 bg-red-50 text-red-700" : "border-emerald-200 bg-emerald-50 text-emerald-800"}`}><CheckCircle2 size={17} className="mt-0.5 shrink-0" /><span>{message}</span></div>}
        <div className="sticky bottom-4 z-20 flex flex-col justify-between gap-3 rounded-2xl border border-[#E5E7EB] bg-white/95 p-3 shadow-lg backdrop-blur sm:flex-row sm:items-center sm:px-5">
          <p className="text-xs text-[#858B96]">Editing: <strong className="text-[#454C57]">{selectedPage.label}</strong></p>
          <button disabled={saving || !!uploadingKey} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#20242B] px-5 py-3 text-xs font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-[#424852] disabled:opacity-50"><Save size={15} /> {saving ? "Saving changes…" : "Save changes"}</button>
        </div>
      </form>

      <ProductImageLibrary />
      <p className="text-xs leading-5 text-[#858B96]">Persistent image uploads require Cloudinary settings in the server environment. If those credentials are not configured yet, the editor will show a clear upload error rather than pretending the file was saved.</p>
    </div>
  );
}
