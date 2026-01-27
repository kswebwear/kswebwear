import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { getSettings } from "@/lib/db";

export default async function Home() {
  const settings = await getSettings("store") as any;

  return (
    <main className="flex min-h-screen flex-col">
      <Hero settings={settings} />
      <FeaturedProducts />
    </main>
  );
}
