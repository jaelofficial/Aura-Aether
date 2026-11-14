import StoryHero from "@/components/about/StoryHero";
import Founder from "@/components/about/Founder";
import Testimonials from "@/components/about/Testimonials";

export const metadata = {
  title: "Our Story | Aura & Aether Parfums",
  description: "Get to know Aura & Aether Parfums — fragrance, feeling, and the signature you leave behind.",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FCFBF9] text-[#17110F]">
      <StoryHero />
      <Founder />
      <Testimonials />
    </div>
  );
}
