'use client';
import GallerySection, { GalleryItem } from '../Gallery/GallerySection';

interface DocumentationSectionProps {
  items: GalleryItem[];
  id?: string;
}

export default function DocumentationSection({ items, id = "documentation" }: DocumentationSectionProps) {
  return (
    <GallerySection
      id={id}
      title="Обзор проектной документации"
      items={items}
      defaultVisibleItems={2}
      tabletVisibleItems={2}
      mobileVisibleItems={1}
      ariaLabelPrefix="документ"
      titleLink="/documentation"
      itemHeight="650px"
    />
  );
}