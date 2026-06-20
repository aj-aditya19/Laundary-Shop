import Navbar from '../components/common/Navbar';
import HeroSection from '../components/hero/HeroSection';
import ServicesSection from '../components/sections/ServicesSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import TrackingPreviewSection from '../components/sections/TrackingPreviewSection';
import {
  GarmentSafetySection,
  FeaturesSection,
  TestimonialsSection,
  FAQSection,
  ContactSection,
  Footer,
} from '../components/sections/OtherSections';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-navy-950">
      <Navbar />
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <GarmentSafetySection />
      <TrackingPreviewSection />
      <FeaturesSection />
      <TestimonialsSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
