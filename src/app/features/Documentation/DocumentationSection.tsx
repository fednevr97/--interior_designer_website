'use client'

import React, { useEffect, useState } from 'react';
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
  const [projects, setProjects] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch('/api/documentation');
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
};

export default Documentation;