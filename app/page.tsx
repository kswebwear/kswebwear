import { Hero } from "@/components/home/Hero";
import { FeaturedProducts } from "@/components/home/FeaturedProducts";
import { getSettings } from "@/lib/db";

export default async function Home() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const settings = await getSettings("store") as any;

  return (
    <main className="flex min-h-screen flex-col">
      <Hero settings={settings} />
      <FeaturedProducts />
    </main>
  );
}
