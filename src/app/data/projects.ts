import fs from 'fs/promises';
import path from 'path';

// Интерфейс для проекта
interface Project {
  id: number;        // Уникальный идентификатор
  image: string;     // Путь к изображению
  title: string;     // Заголовок проекта
  category: string;  // Категория проекта
  folder: string;    // Папка проекта
}

// Функция для получения списка проектов
export async function getProjects(): Promise<Project[]> {
  // Путь к директории с проектами
  const projectsDir = path.join(process.cwd(), 'public', 'projects');
  // Получаем список категорий (папок)
  const categories = await fs.readdir(projectsDir);
  
  let allProjects: Project[] = [];
  let idCounter = 1;

  // Проходим по каждой категории
  for (const category of categories) {
    const categoryPath = path.join(projectsDir, category);
    const stat = await fs.stat(categoryPath);
    
    // Проверяем, является ли элемент директорией
    if (stat.isDirectory()) {
      const files = await fs.readdir(categoryPath);
      // Фильтруем и преобразуем файлы в проекты
      const categoryProjects = files
        .filter(file => /\.(jpe?g|png|webp)$/i.test(file)) // Фильтруем по типам изображений
        .map(file => ({
          id: idCounter++,
          image: `/projects/${category}/${file}`,
          title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: category,
          folder: category
        }));

      // Добавляем проекты категории к общему списку
      allProjects = [...allProjects, ...categoryProjects];
    }
  }

  return allProjects;
}

// Функция для получения списка категорий
export async function getCategories(): Promise<string[]> {
  const projectsDir = path.join(process.cwd(), 'public', 'projects');
  const items = await fs.readdir(projectsDir);
  const categories = [];
  
  // Проходим по всем элементам и собираем только директории
  for (const item of items) {
    const itemPath = path.join(projectsDir, item);
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      categories.push(item);
    }
  }
  
  return categories;
}