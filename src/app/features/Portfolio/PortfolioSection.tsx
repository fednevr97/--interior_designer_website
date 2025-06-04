import GallerySection from '../Gallery/GallerySection';
import { getProjects } from '../../data/projects';

export default async function PortfolioSection({ id = "portfolio" }: { id?: string }) {
  const projects = await getProjects();

  return (
    <GallerySection
      id={id}
      title="Портфолио"
      items={projects}
      defaultVisibleItems={4}
      tabletVisibleItems={3}
      mobileVisibleItems={1}
      ariaLabelPrefix="проект"
      titleLink="/portfolio"
    />
  );
}