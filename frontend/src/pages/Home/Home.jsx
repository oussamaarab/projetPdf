import { useState } from "react";
import Categories from "../../components/Categories/Categories";
import PopularTools from "../../components/PopularTools/PopularTools";
import Features from "../../components/Features/Features";
import HowItWorks from "../../components/Sections/HowItWorks";
import Testimonials from "../../components/Sections/Testimonials";
import FAQ from "../../components/Sections/FAQ";
import CTA from "../../components/CTA/CTA";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");

  return (
    <>
      <Categories onSelectCategory={setActiveCategory} />
      <PopularTools activeCategory={activeCategory} onSelectCategory={setActiveCategory} />
      <Features />
      <HowItWorks />
      <Testimonials />
      <FAQ />
      <CTA />
    </>
  );
}
