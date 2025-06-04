import GallerySection from '../Gallery/GallerySection';
import { getDocumentation } from '../../data/documentation';

export default async function DocumentationSection({ id = "docs" }: { id?: string }) {
  const projects = await getDocumentation();

  return (
    <GallerySection
      id={id}
      title="Обзор проектной документации"
      items={projects}
      defaultVisibleItems={2}
      tabletVisibleItems={2}
      mobileVisibleItems={1}
      ariaLabelPrefix="документ"
      titleLink="/documentation"
      itemHeight="650px"
    />
  );
}