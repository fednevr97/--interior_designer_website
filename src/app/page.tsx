import HeroSection from "./features/Hero/HeroSection";
import AboutSection from "./features/About/AboutSection";
import Portfolio from "./features/Portfolio/PortfolioSection";
import ServicesSection from "./features/Services/ServicesSection";
import DocumentationSection from "./features/Documentation/DocumentationSection";
import { getProjects } from './data/projects';
import { getDocumentation } from './data/documentation';
import FancyboxGlobalProvider from "./features/Gallery/FancyboxGlobalProvider";

export default async function Home() {
  const projects = await getProjects();
  const documentation = await getDocumentation();
  return (
    <>
      <FancyboxGlobalProvider />
      <HeroSection id="home" imageSrc='/assets/5WbDAuO7qL.webp' />
      <AboutSection id="about" />
      <Portfolio id="portfolio" items={projects}  />
      <ServicesSection id="services" />
      <DocumentationSection id="documentation"items={documentation}  />
    </>
  );
}