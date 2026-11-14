let cachedSettings: Promise<Record<string, string>> | null = null;
let cacheExpiresAt = 0;

export function getClientSiteSettings(): Promise<Record<string, string>> {
  if (cachedSettings && Date.now() < cacheExpiresAt) return cachedSettings;
  cacheExpiresAt = Date.now() + 15_000;
  cachedSettings = fetch("/api/site-settings", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Could not load site settings");
      const data = await response.json();
      return (data?.settings && typeof data.settings === "object" ? data.settings : {}) as Record<string, string>;
    })
    .catch(() => ({}));
  return cachedSettings;
}

export function invalidateClientSiteSettings(): void {
  cachedSettings = null;
  cacheExpiresAt = 0;
}
