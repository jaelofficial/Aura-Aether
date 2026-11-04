import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/auth";
import { prisma } from "@/lib/db";

const DEFAULTS: Record<string, string> = {
  // Brand identity and global styling
  brandName: "Aura & Aether Parfums",
  logoUrl: "/images/aura-aether-logo.svg",
  primaryColor: "#17110F",
  accentColor: "#B77F60",
  backgroundColor: "#FCFBF9",
  announcement: "Find your signature scent with Aura & Aether Parfums.",
  footerDescription: "Discover fragrances that feel like you. Find your signature scent, mark a moment, and leave a little magic wherever you go.",
  // Homepage hero
  heroTitle: "Aura & Aether",
  heroDescription: "Fragrance that says something about you. Find the scent that feels like yours.",
  motto: "Your scent. Your signature.",
  heroImageUrl: "/images/hero/coastal-aqua.jpeg",
  heroImageUrl2: "/images/hero/desert-amber.jpeg",
  heroImageUrl3: "/images/hero/emerald-noir.jpeg",
  heroImageUrl4: "/images/hero/city-sillage.jpeg",

  homeBestsellerImage1: "/images/bestsellers/foret.jpeg",
  homeBestsellerImage2: "/images/bestsellers/ambre-boise.jpeg",
  homeBestsellerImage3: "/images/bestsellers/noir-ambre.jpeg",
  homeCollectionImage1: "/images/collection/forest-green.jpeg",
  homeCollectionImage2: "/images/collection/rose-lamour.jpeg",
  homeCollectionImage3: "/images/collection/noir-ambre.jpeg",
  homeCollectionImage4: "/images/collection/ambre-boise.jpeg",
  homeBotanicalImage1: "/images/botanical-edit/esencia-foret.jpeg",
  homeBotanicalImage2: "/images/botanical-edit/nectar-terre.jpeg",
  homeBotanicalImage3: "/images/botanical-edit/bleue-rivage.jpeg",
  homeStepImage1: "/images/how-to-order/step-01.jpeg",
  homeStepImage2: "/images/how-to-order/step-02.jpeg",
  homeStepImage3: "/images/how-to-order/step-03.jpeg",
  homeStepImage4: "/images/how-to-order/step-04.jpeg",
  homeNotesImage1: "/images/hero/orange-amere.jpeg",
  homeNotesImage2: "/images/botanical-edit/bleue-rivage.jpeg",
  homeNotesImage3: "/images/hero/cassis-sauvage.jpeg",
  homeNotesImage4: "/images/botanical-edit/esencia-foret.jpeg",

  heroCtaLabel: "Explore the collection",
  heroCtaUrl: "/shop",
  heroCtaAlignment: "center",
  // Homepage sections
  homeFeaturedEyebrow: "OUR COLLECTION",
  homeFeaturedTitle: "Featured fragrances.",
  homeFeaturedCtaLabel: "View All Fragrances",
  homeFeaturedCtaUrl: "/shop",
  homePromoTitle: "Find your next signature",
  homePromoDescription: "Explore fragrances for every mood, moment, and version of you.",
  homePromoImageUrl: "/images/spring-peonies.svg",
  homeCollectionImage1: "/images/collection/forest-green.jpeg",
  homeCollectionImage2: "/images/collection/rose-lamour.jpeg",
  homeCollectionImage3: "/images/collection/noir-ambre.jpeg",
  homeCollectionImage4: "/images/collection/ambre-boise.jpeg",
  homeBotanicalImage1: "/images/botanical-edit/esencia-foret.jpeg",
  homeBotanicalImage2: "/images/botanical-edit/nectar-terre.jpeg",
  homeBotanicalImage3: "/images/botanical-edit/bleue-rivage.jpeg",
  homeHowToOrderImage1: "/images/how-to-order/step-01.jpeg",
  homeHowToOrderImage2: "/images/how-to-order/step-02.jpeg",
  homeHowToOrderImage3: "/images/how-to-order/step-03.jpeg",
  homeHowToOrderImage4: "/images/how-to-order/step-04.jpeg",
  homeNotesImage1: "/images/hero/orange-amere.jpeg",
  homeNotesImage2: "/images/botanical-edit/bleue-rivage.jpeg",
  homeNotesImage3: "/images/hero/cassis-sauvage.jpeg",
  homeNotesImage4: "/images/botanical-edit/esencia-foret.jpeg",
  homeBestsellerImage1: "/images/bestsellers/foret.jpeg",
  homeBestsellerImage2: "/images/bestsellers/ambre-boise.jpeg",
  homeBestsellerImage3: "/images/bestsellers/noir-ambre.jpeg",
  // About page
  aboutTitle: "Our story",
  aboutIntro: "Aura & Aether was created for the moments, moods, and memories that make you who you are.",
  aboutImageUrl: "",
  aboutStoryImage1: "/images/about-story/story-01-desktop.jpeg",
  aboutStoryImage2: "/images/about-story/story-02-desktop.jpeg",
  aboutStoryImage3: "/images/about-story/story-03-desktop.jpeg",
  aboutStoryImage4: "/images/about-story/story-04-desktop.jpeg",
  aboutFounderImage1: "/images/founder-fragrance-seller.jpeg",
  aboutFounderImage2: "/images/founder-experience.jpeg",
  aboutFounderImage3: "/images/founder-process.jpeg",
  aboutFounderImage4: "/images/founder-work-with-me.jpeg",
  // Shop page
  shopEyebrow: "THE COLLECTION",
  shopTitle: "Find your fragrance.",
  shopDescription: "Explore scents for every mood, moment, and personal signature.",
  // Gift sets page
  giftSetsEyebrow: "GIFT WITH MEANING",
  giftSetsTitle: "Gift Sets",
  giftSetsDescription: "Discover thoughtful fragrance gifts made for celebrations, everyday moments, and people you love.",
  // Contact page
  contactEyebrow: "WE ARE HERE TO HELP",
  contactTitle: "Contact Aura & Aether",
  contactDescription: "Questions about a fragrance or an order? We would love to hear from you.",
  contactEmail: "concierge@aura-aether.com",
  contactPhone: "+233 (0) 24 892 4110",
  contactAddress: "Suite 4B, The Meridian Galleria, Airport Residential Area, Accra, Ghana",
  contactImage1: "/images/hero/coastal-aqua.jpeg",
  contactImage2: "/images/hero/emerald-noir.jpeg",
  contactImage3: "/images/hero/city-sillage.jpeg",
  contactImage4: "/images/hero/desert-amber.jpeg",
  contactImage5: "/images/botanical-edit/nectar-terre.jpeg",
  // Delivery settings; fees are configured by the store owner in the admin editor.
  deliveryOrigin: "Adenta, Accra, Ghana",
  deliveryFreePromo: "false",
  deliveryRanges: "",
};

async function isAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get("aura_admin_token")?.value;
  const payload = token ? await verifyToken(token) : null;
  return !!payload && payload.role === "ADMIN";
}

export async function GET() {
  try {
    const rows = await prisma.siteSetting.findMany();
    const settings = { ...DEFAULTS };
    const legacyHeroPlaceholders: Record<string, string> = {
      heroImageUrl: "/images/hero-placeholder-1.svg",
      heroImageUrl2: "/images/hero-placeholder-2.svg",
      heroImageUrl3: "/images/hero-placeholder-3.svg",
    };
    for (const row of rows) {
      if (!Object.prototype.hasOwnProperty.call(DEFAULTS, row.key)) continue;
      if (legacyHeroPlaceholders[row.key] === row.value) continue;
      settings[row.key] = row.key === "logoUrl" && (row.value === "/images/aura-aether-logo.png" || row.value === "/images/aura-aether-logo-light.png")
        ? "/images/aura-aether-logo.svg"
        : row.value;
    }
    return NextResponse.json({ settings }, { headers: { "Cache-Control": "private, max-age=10, must-revalidate" } });
  } catch (error) {
    console.error("Site settings GET error:", error);
    return NextResponse.json({ settings: DEFAULTS }, { headers: { "Cache-Control": "private, max-age=5, must-revalidate" } });
  }
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Admin authorization required" }, { status: 403 });
  }
  try {
    const body = await req.json();
    const entries = Object.entries(body.settings || {}).filter(
      ([key, value]) => Object.prototype.hasOwnProperty.call(DEFAULTS, key) && typeof value === "string"
    );
    await prisma.$transaction(
      entries.map(([key, value]) =>
        prisma.siteSetting.upsert({
          where: { key },
          create: { key, value: value as string },
          update: { value: value as string },
        })
      )
    );
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Site settings PUT error:", error);
    return NextResponse.json({ error: "Could not save site settings. Check that the database schema is up to date." }, { status: 500 });
  }
}
