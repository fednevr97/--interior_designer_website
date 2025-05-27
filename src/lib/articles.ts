import fs from 'fs/promises'; // Для асинхронной работы с файловой системой
import path from 'path'; // Для работы с путями файлов
import matter from 'gray-matter'; // Для парсинга markdown файлов с метаданными
import { cache } from 'react'; // Для кэширования результатов запросов

// Интерфейс для метаданных статьи
export interface ArticleMeta {
  title: string; // Заголовок статьи
  date: string; // Дата публикации в формате ISO
  excerpt: string; // Краткое описание статьи
  coverImage: string; // Путь к обложке статьи
  tags?: string[]; // Опциональный массив тегов
}

// Интерфейс для полной статьи
export interface Article {
  meta: ArticleMeta; // Метаданные статьи
  content: string; // Содержимое статьи в markdown
  slug: string; // Уникальный идентификатор статьи (название файла без расширения)
}

// Путь к директории с статьями (относительно корня проекта)
const articlesDir = path.join(process.cwd(), 'src/content/articles');

/**
 * Получает все статьи из директории
 * Использует кэширование для оптимизации повторных запросов
 * @returns {Promise<Article[]>} Массив статей, отсортированный по дате (новые сначала)
 */
export const getArticles = cache(async (): Promise<Article[]> => {
  try {
    // Читаем список файлов в директории статей
    const files = await fs.readdir(articlesDir);
    
    // Обрабатываем все файлы параллельно
    const articles = await Promise.all(
      files.map(async (filename) => {
        // Получаем slug (уникальный идентификатор) из имени файла
        const slug = filename.replace(/\.md$/, '');
        // Формируем полный путь к файлу
        const filePath = path.join(articlesDir, filename);
        // Читаем содержимое файла
        const fileContent = await fs.readFile(filePath, 'utf8');
        // Парсим markdown с метаданными (разделяет на data и content)
        const { data, content } = matter(fileContent);

        // Возвращаем структурированные данные статьи
        return {
          meta: {
            title: data.title || 'Без названия', // Значение по умолчанию
            date: data.date || new Date().toISOString(), // Текущая дата, если не указана
            excerpt: data.excerpt || '', // Пустая строка, если нет описания
            coverImage: data.coverImage || '/images/default-cover.jpg', // Дефолтная обложка
            tags: data.tags || [], // Пустой массив, если нет тегов
          },
          content, // Содержимое markdown
          slug, // Уникальный идентификатор
        };
      })
    );

    // Сортируем статьи по дате (новые сначала)
    return articles.sort((a, b) => 
      new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
    );
  } catch (error) {
    console.error('Error loading articles:', error);
    return []; // Возвращаем пустой массив в случае ошибки
  }
});

/**
 * Получает конкретную статью по slug
 * Использует кэширование для оптимизации повторных запросов
 * @param {string} slug - Идентификатор статьи (название файла без .md)
 * @returns {Promise<Article | null>} Объект статьи или null, если статья не найдена
 */
export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  try {
    // Формируем путь к файлу статьи
    const filePath = path.join(articlesDir, `${slug}.md`);
    // Читаем содержимое файла
    const fileContent = await fs.readFile(filePath, 'utf8');
    // Парсим markdown с метаданными
    const { data, content } = matter(fileContent);

    // Возвращаем структурированные данные статьи
    return {
      meta: {
        title: data.title || 'Без названия',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '/images/default-cover.jpg',
        tags: data.tags || [],
      },
      content, // Содержимое markdown
      slug, // Уникальный идентификатор
    };
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    return null; // Возвращаем null в случае ошибки
  }
});