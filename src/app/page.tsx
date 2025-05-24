import HeroSection from "./features/Hero/HeroSection";
import AboutSection from "./features/About/AboutSection";
import Portfolio from "./features/Portfolio/PortfolioSection";
import ServicesSection from "./features/Services/ServicesSection";
import DocumentationSection from "./features/Documentation/DocumentationSection";

export default function Home() {
  return (
    <>
      <HeroSection id="home" imageSrc='/assets/5WbDAuO7qL.webp' />
      <AboutSection id="about" />
      <Portfolio id="portfolio" />
      <ServicesSection id="services" />
      <DocumentationSection id="documentation" />
    </>
  );
}