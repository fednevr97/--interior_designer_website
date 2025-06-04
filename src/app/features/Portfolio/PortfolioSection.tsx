'use client';
import GallerySection, { GalleryItem } from '../Gallery/GallerySection';

interface PortfolioProps {
  items: GalleryItem[];
  id?: string;
}

export default function Portfolio({ items, id = "documentation" }: PortfolioProps) {
  return (
    <GallerySection
      id={id}
      title="Портфолио"
      items={items}
      defaultVisibleItems={4}
      tabletVisibleItems={3}
      mobileVisibleItems={1}
      ariaLabelPrefix="проект"
      titleLink="/portfolio"
    />
  );
}