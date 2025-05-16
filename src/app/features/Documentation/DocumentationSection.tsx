'use client'

import React from 'react';
import GallerySection from '../Gallery/GallerySection';

interface Document {
  id: number;
  image: string;
  title: string;
}

interface DocumentationProps {
  id?: string;
}

const Documentation: React.FC<DocumentationProps> = ({ id = "docs"}) => {
  const documents: Document[] = [
    {
      id: 1,
      image: "/assets/Documentation/arhitecture.jpg",
      title: "Техническое задание"
    },
    {
      id: 2,
      image: "/assets/Documentation/Orlovka.pdf-image-000.jpg",
      title: "Коммерческое предложение"
    },
    {
      id: 3,
      image: "/assets/Documentation/Orlovka.pdf-image-002.jpg",
      title: "Договор"
    }
  ];

  return (
    <GallerySection
      id={id}
      title="Образцы проектной документации"
      items={documents}
      defaultVisibleItems={2}
      tabletVisibleItems={2}
      mobileVisibleItems={1}
      ariaLabelPrefix="документ"
      itemHeight="650px"
    />
  );
};

export default Documentation;