'use client'

import React, { useEffect, useState } from 'react';
import GallerySection from '../Gallery/GallerySection';

// Интерфейс для документа
interface Document {
  id: number;        // Уникальный идентификатор
  image: string;     // Путь к изображению
  title: string;     // Заголовок документа
}

// Интерфейс для пропсов компонента
interface DocumentationProps {
  id?: string;       // Опциональный идентификатор секции
}

// Компонент секции документации
const Documentation: React.FC<DocumentationProps> = ({ id = "docs"}) => {
  // Состояние для хранения списка документов
  const [projects, setProjects] = useState<Document[]>([]);
  // Состояние загрузки
  const [loading, setLoading] = useState(true);

  // Эффект для загрузки документов при монтировании компонента
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Запрос к API для получения списка документов
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

  // Отображение состояния загрузки
  if (loading) return <div>Loading...</div>;

  // Рендер секции галереи с документами
  return (
    <GallerySection
      id={id}
      title="Обзор проектной документации"
      items={projects}
      defaultVisibleItems={2}      // Количество видимых элементов по умолчанию
      tabletVisibleItems={2}       // Количество видимых элементов на планшете
      mobileVisibleItems={1}       // Количество видимых элементов на мобильном
      ariaLabelPrefix="документ"   // Префикс для ARIA-меток
      titleLink="/documentation"   // Ссылка на страницу документации
      itemHeight="650px"          // Высота элементов галереи
    />
  );
};

export default Documentation;