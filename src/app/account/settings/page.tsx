"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, AlertCircle, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type AccountForm = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  currentPassword: string;
  newPassword: string;
};

const emptyForm: AccountForm = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  currentPassword: "",
  newPassword: "",
};

export default function AccountSettingsPage() {
  const router = useRouter();
  const { user, isLoading, refreshUser } = useAuth();
  const [form, setForm] = useState<AccountForm>(emptyForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.replace("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (!user) return;
    queueMicrotask(() => {
      setForm((current) => ({
        ...current,
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        address: user.address || "",
        city: user.city || "",
      }));
    });
  }, [user]);

  const updateField = (key: keyof AccountForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
    setMessage("");
    setError("");
  };

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch("/api/account/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save your settings.");
      await refreshUser();
      setForm((current) => ({ ...current, currentPassword: "", newPassword: "" }));
      setMessage("Your account settings have been updated.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save your settings.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || !user) {
    return <div className="flex min-h-[60vh] items-center justify-center text-sm text-[#78716C]">Loading account settings…</div>;
  }

  const inputClass = "w-full rounded-xl border border-[#DDD6CD] bg-[#FAF7F4] px-4 py-3 text-sm text-[#1C1917] outline-none focus:border-[#B77F60]";

  return (
    <div className="min-h-screen bg-[#FCFBF9] px-4 py-12 sm:py-16">
      <div className="mx-auto max-w-3xl">
        <Link href="/account" className="mb-7 inline-flex items-center gap-2 text-xs text-[#78716C] hover:text-[#1C1917]">
          <ArrowLeft className="h-4 w-4" /> Back to my account
        </Link>
        <div className="rounded-3xl border border-[#ECE5DD] bg-white p-6 shadow-sm sm:p-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#8C827A]">Your account</p>
          <h1 className="mt-2 font-serif-luxury text-3xl text-[#1C1917] sm:text-4xl">Account <span className="italic">Settings.</span></h1>
          <p className="mt-3 text-sm leading-6 text-[#78716C]">Update your details whenever you need to. Your current password is required when changing your email address or password.</p>

          {error && <div role="alert" className="mt-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />{error}</div>}
          {message && <div role="status" className="mt-6 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />{message}</div>}

          <form onSubmit={handleSubmit} className="mt-7 space-y-7">
            <section className="space-y-4">
              <h2 className="border-b border-[#EFE9E2] pb-3 font-serif-luxury text-xl text-[#1C1917]">Personal details</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-semibold text-[#4A443F]">Full name<input className={inputClass + " mt-2"} required value={form.name} onChange={(e) => updateField("name", e.target.value)} /></label>
                <label className="block text-xs font-semibold text-[#4A443F]">Email address<input className={inputClass + " mt-2"} type="email" required value={form.email} onChange={(e) => updateField("email", e.target.value)} /></label>
                <label className="block text-xs font-semibold text-[#4A443F]">Phone number<input className={inputClass + " mt-2"} type="tel" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} /></label>
                <label className="block text-xs font-semibold text-[#4A443F]">City / region<input className={inputClass + " mt-2"} value={form.city} onChange={(e) => updateField("city", e.target.value)} /></label>
              </div>
              <label className="block text-xs font-semibold text-[#4A443F]">Default address (optional)<input className={inputClass + " mt-2"} value={form.address} onChange={(e) => updateField("address", e.target.value)} /></label>
            </section>

            <section className="space-y-4">
              <h2 className="border-b border-[#EFE9E2] pb-3 font-serif-luxury text-xl text-[#1C1917]">Login details</h2>
              <label className="block text-xs font-semibold text-[#4A443F]">Current password <span className="font-normal text-[#8C827A]">(required to change email or password)</span><input className={inputClass + " mt-2"} type="password" autoComplete="current-password" value={form.currentPassword} onChange={(e) => updateField("currentPassword", e.target.value)} /></label>
              <label className="block text-xs font-semibold text-[#4A443F]">New password <span className="font-normal text-[#8C827A]">(leave blank to keep your current password)</span><input className={inputClass + " mt-2"} type="password" autoComplete="new-password" minLength={8} value={form.newPassword} onChange={(e) => updateField("newPassword", e.target.value)} /></label>
              <p className="text-[11px] leading-5 text-[#8C827A]">Use at least 8 characters for a new password. If you only update your name, phone number, or address, you do not need to enter your current password.</p>
            </section>

            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[#1C1917] px-6 py-4 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-[#38332E] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto">
              <Save className="h-4 w-4" /> {saving ? "Saving changes…" : "Save account settings"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
