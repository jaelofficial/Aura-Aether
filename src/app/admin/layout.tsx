"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { LayoutDashboard, PanelsTopLeft, Package, Sparkles, LogOut } from "lucide-react";

type AdminUser = { id: string; name: string; email: string; role: "ADMIN" };

const navigation = [
  { label: "Overview & orders", href: "/admin?tab=orders#admin-tabs", icon: LayoutDashboard },
  { label: "Website editor", href: "/admin/content?section=home", icon: PanelsTopLeft },
  { label: "Product catalogue", href: "/admin?tab=products#admin-tabs", icon: Package },
  { label: "Add a fragrance", href: "/admin?tab=new-product#admin-tabs", icon: Sparkles },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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

  if (isLoading) return <div className="grid min-h-screen place-items-center bg-[#F6F7F9] text-sm text-[#747B87]">Loading admin workspace…</div>;
  if (!user || user.role !== "ADMIN") return <div className="grid min-h-screen place-items-center bg-[#F6F7F9] p-6 text-center"><div className="max-w-md rounded-2xl border border-[#E5E7EB] bg-white p-8"><h1 className="text-2xl font-bold text-[#20242B]">Admin access required</h1><p className="mt-2 text-sm leading-6 text-[#747B87]">Sign in with an administrator account to open the store management portal.</p><Link href="/login" className="mt-5 inline-flex rounded-lg bg-[#20242B] px-4 py-2.5 text-sm font-semibold text-white">Go to sign in</Link></div></div>;

  return (
    <div className="admin-shell min-h-screen bg-[#F6F7F9] text-[#20242B]">
      <aside className="admin-sidebar fixed inset-y-0 left-0 z-40 hidden w-[258px] flex-col border-r border-[#E7E9EE] bg-white lg:flex">
        <Link href="/admin" className="flex h-[86px] items-center gap-3 border-b border-[#ECEEF2] px-6">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#20242B] text-white"><Sparkles size={19} /></span>
          <span>
            <span className="block text-sm font-bold tracking-tight">Aura &amp; Aether</span>
            <span className="mt-0.5 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[#858B96]">Store management</span>
          </span>
        </Link>
        <div className="px-4 pt-7">
          <p className="px-3 pb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#9AA0AA]">Workspace</p>
          <nav className="space-y-1">
            {navigation.map((item) => {
              const active = item.href.startsWith("/admin/content")
                ? pathname.startsWith("/admin/content")
                : pathname === "/admin" && item.label === "Overview & orders";
              const Icon = item.icon;
              return (
                <a key={item.label} href={item.href} className={`admin-nav-link flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all duration-200 ${active ? "bg-[#F0F2F6] text-[#20242B]" : "text-[#747B87] hover:bg-[#F7F8FA] hover:text-[#20242B]"}`}>
                  <Icon size={17} strokeWidth={1.8} />
                  {item.label}
                  {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B77F60]" />}
                </a>
              );
            })}
          </nav>
        </div>
      </aside>

      <div className="lg:pl-[258px]">
        <header className="sticky top-0 z-30 flex min-h-[72px] items-center justify-between border-b border-[#E7E9EE] bg-white/90 px-5 backdrop-blur-md sm:px-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9AA0AA]">Aura &amp; Aether / Admin</p>
            <p className="mt-1 text-sm font-bold">{pathname.startsWith("/admin/content") ? "Website editor" : "Store management"}</p>
          </div>
          <button type="button" onClick={async () => { await fetch("/api/auth/admin-logout", { method: "POST" }); window.location.href = "/login"; }} className="inline-flex items-center gap-2 rounded-full bg-[#20242B] px-4 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[#424852]"><LogOut size={14} /> Log out</button>
        </header>
        <nav className="flex gap-2 overflow-x-auto border-b border-[#E7E9EE] bg-white px-4 py-3 lg:hidden">
          {navigation.map((item) => <a key={item.label} href={item.href} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${pathname.startsWith("/admin/content") === item.href.startsWith("/admin/content") ? "bg-[#20242B] text-white" : "bg-[#F3F4F6] text-[#626976]"}`}>{item.label}</a>)}
        </nav>
        <div className="min-h-[calc(100vh-72px)] p-4 sm:p-7 lg:p-9">{children}</div>
      </div>
    </div>
  );
}
