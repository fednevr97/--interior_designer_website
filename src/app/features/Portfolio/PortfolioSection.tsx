'use client'

import React from 'react';
import GallerySection from '../Gallery/GallerySection';

interface Project {
  id: number;
  image: string;
  title: string;
}

interface PortfolioProps {
  id?: string;
}

const Portfolio: React.FC<PortfolioProps> = ({ id = "portfolio"}) => {
  const projects: Project[] = [
    { id: 1, image: "/assets/Project/1_CShading_LightMix.jpg", title: "Проект с шейдингом 1" },
    { id: 2, image: "/assets/Project/1.jpg", title: "Проект 1" },
    { id: 3, image: "/assets/Project/2_CShading_LightMix.jpg", title: "Проект с шейдингом 2" },
    { id: 4, image: "/assets/Project/2.jpg", title: "Проект 2" },
    { id: 5, image: "/assets/Project/3_CShading_LightMix.jpg", title: "Проект с шейдингом 3" },
    { id: 6, image: "/assets/Project/3.jpg", title: "Проект 3" },
    { id: 7, image: "/assets/Project/4_CShading_LightMix.jpg", title: "Проект с шейдингом 4" },
    { id: 8, image: "/assets/Project/5.jpg", title: "Проект 5" },
    { id: 9, image: "/assets/Project/6.jpg", title: "Проект 6" },
    { id: 10, image: "/assets/Project/15_CShading_LightMix.jpg", title: "Проект с шейдингом 15" },
    { id: 11, image: "/assets/Project/16_CShading_LightMix.jpg", title: "Проект с шейдингом 16" },
    { id: 12, image: "/assets/Project/18_CShading_LightMix.jpg", title: "Проект с шейдингом 18" },
    { id: 13, image: "/assets/Project/19_CShading_LightMix.jpg", title: "Проект с шейдингом 19" }
  ];

  return (
    <GallerySection
      id={id}
      title="Портфолио"
      items={projects}
      defaultVisibleItems={4}
      tabletVisibleItems={3}
      mobileVisibleItems={1}
      ariaLabelPrefix="проект"
    />
  );
};

export default Portfolio;