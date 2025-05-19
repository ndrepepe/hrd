import HeroSection from "@/components/HeroSection";
import ProductSection from "@/components/ProductSection";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="flex flex-col items-center pt-16"> {/* pt-16 for navbar */}
      <HeroSection />
      <ProductSection />
      <AboutSection />
      <ContactSection />
      {/* Add a simple footer */}
      <footer className="w-full text-center py-8 text-gray-600 text-sm">
        <p>&copy; {new Date().getFullYear()} PepeNio. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;