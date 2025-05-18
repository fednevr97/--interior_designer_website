'use client'

import React, { useEffect, useState } from 'react';
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
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/projects');
        const data = await response.json();
        setProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (loading) return <div>Loading...</div>;

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
};

export default Portfolio;