'use client'

// Импортируем необходимые компоненты и хуки
import React, { useEffect, useState } from 'react';
import GallerySection from '../Gallery/GallerySection';

// Интерфейс для проекта в портфолио
interface Project {
  id: number;      // Уникальный идентификатор проекта
  image: string;   // URL изображения проекта
  title: string;   // Название проекта
}

// Интерфейс пропсов для компонента Portfolio
interface PortfolioProps {
  id?: string;     // Опциональный идентификатор секции
}

// Компонент секции портфолио
const Portfolio: React.FC<PortfolioProps> = ({ id = "portfolio"}) => {
  // Состояние для хранения списка проектов
  const [projects, setProjects] = useState<Project[]>([]);
  // Состояние для отслеживания загрузки данных
  const [loading, setLoading] = useState(true);

  // Эффект для загрузки проектов при монтировании компонента
  useEffect(() => {
    // Асинхронная функция для получения данных о проектах
    const fetchProjects = async () => {
      try {
        // Запрос к API для получения списка проектов
        const response = await fetch('/api/projects');
        const data = await response.json();
        // Обновляем состояние с полученными данными
        setProjects(data);
      } catch (error) {
        // Обработка ошибок при загрузке
        console.error('Error fetching projects:', error);
      } finally {
        // В любом случае сбрасываем состояние загрузки
        setLoading(false);
      }
    };

    // Вызываем функцию загрузки
    fetchProjects();
  }, []); // Пустой массив зависимостей - эффект выполняется только при монтировании

  // Отображаем индикатор загрузки, пока данные загружаются
  if (loading) return <div>Loading...</div>;

  // Рендерим секцию галереи с проектами
  return (
    <GallerySection
      id={id}                           // Идентификатор секции
      title="Портфолио"                 // Заголовок секции
      items={projects}                  // Массив проектов
      defaultVisibleItems={4}           // Количество видимых элементов на десктопе
      tabletVisibleItems={3}            // Количество видимых элементов на планшете
      mobileVisibleItems={1}            // Количество видимых элементов на мобильном
      ariaLabelPrefix="проект"          // Префикс для ARIA-меток
      titleLink="/portfolio"            // Ссылка для заголовка
    />
  );
};

// Экспортируем компонент
export default Portfolio;