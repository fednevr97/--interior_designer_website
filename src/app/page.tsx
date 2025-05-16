import HeroSection from "./features/Hero/HeroSection";
import Header from "./features/Header/Header";
import AboutSection from "./features/About/AboutSection";
import Portfolio from "./features/Portfolio/PortfolioSection";
import ServicesSection from "./features/Services/ServicesSection";
import DocumentationSection from "./features/Documentation/DocumentationSection";
import Footer from "./features/Footer/Footer";

export default function Home() {
  return (
    <div>
      <Header/>
      <HeroSection id="home" imageSrc='/assets/5WbDAuO7qL.png' />
      <AboutSection id="about" />
      <Portfolio id="portfolio" />
      <ServicesSection id="services" />
      <DocumentationSection id="documentation" />
      <Footer/>
    </div>
  );
}
