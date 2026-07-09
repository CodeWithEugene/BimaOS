import { Navbar } from "@/components/landing/Navbar";
import { Hero } from "@/components/landing/Hero";
import { Features } from "@/components/landing/Features";
import { Products } from "@/components/landing/Products";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { ForInsurers } from "@/components/landing/ForInsurers";
import { Stats } from "@/components/landing/Stats";
import { Footer } from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Products />
        <HowItWorks />
        <Stats />
        <ForInsurers />
      </main>
      <Footer />
    </>
  );
}
