import { NextResponse } from 'next/server'; // Для создания HTTP-ответов API
import fs from 'fs/promises'; // Для асинхронных операций с файловой системой
import path from 'path'; // Для работы с путями файловой системы

// Интерфейс, описывающий структуру объекта проекта
interface Project {
  id: number;      // Уникальный идентификатор проекта
  image: string;   // Путь к изображению проекта
  title: string;   // Название проекта
}

// Обработчик GET-запросов для API-роута
export async function GET() {
  try {
    // Формируем абсолютный путь к директории с проектами
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    
    // Получаем список категорий (поддиректорий) в директории проектов
    const categories = await fs.readdir(projectsDir);
    
    // Инициализируем массив для хранения всех проектов
    let allProjects: Project[] = [];
    // Счетчик для генерации уникальных ID
    let idCounter = 1;

    // Перебираем все категории (поддиректории)
    for (const category of categories) {
      // Формируем полный путь к категории
      const categoryPath = path.join(projectsDir, category);
      // Получаем информацию о файле/директории
      const stat = await fs.stat(categoryPath);
      
      // Проверяем, является ли элемент директорией
      if (stat.isDirectory()) {
        // Получаем список файлов в категории
        const files = await fs.readdir(categoryPath);
        
        // Преобразуем файлы в массив проектов
        const categoryProjects: Project[] = files
          // Фильтруем только изображения (jpg, jpeg, png, webp)
          .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
          // Создаем объекты Project для каждого изображения
          .map(file => ({
            id: idCounter++, // Назначаем уникальный ID
            // Формируем относительный путь к изображению
            image: `/projects/${category}/${file}`,
            // Генерируем читаемое название из имени файла:
            title: file
              .replace(/\.[^/.]+$/, '') // Удаляем расширение файла
              .replace(/[-_]/g, ' ')    // Заменяем подчеркивания и дефисы на пробелы
          }));

        // Добавляем проекты текущей категории в общий массив
        allProjects = [...allProjects, ...categoryProjects];
      }
    }

    // Возвращаем успешный ответ с массивом всех проектов
    return NextResponse.json(allProjects);
  } catch (error) {
    // Обработка ошибок:
    console.error('Error fetching projects:', error); // Логирование ошибки
    
    // Возвращаем ответ с ошибкой сервера (500)
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}