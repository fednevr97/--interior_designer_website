import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { cache } from 'react';

export interface ArticleMeta {
  title: string;
  date: string;
  excerpt: string;
  coverImage: string;
  tags?: string[];
}

export interface Article {
  meta: ArticleMeta;
  content: string;
  slug: string;
}

const articlesDir = path.join(process.cwd(), 'src/content/articles');

export const getArticles = cache(async (): Promise<Article[]> => {
  try {
    const files = await fs.readdir(articlesDir);
    
    const articles = await Promise.all(
      files.map(async (filename) => {
        const slug = filename.replace(/\.md$/, '');
        const filePath = path.join(articlesDir, filename);
        const fileContent = await fs.readFile(filePath, 'utf8');
        const { data, content } = matter(fileContent);

        return {
          meta: {
            title: data.title || 'Без названия',
            date: data.date || new Date().toISOString(),
            excerpt: data.excerpt || '',
            coverImage: data.coverImage || '/images/default-cover.jpg',
            tags: data.tags || [],
          },
          content,
          slug,
        };
      })
    );

    return articles.sort((a, b) => 
      new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
    );
  } catch (error) {
    console.error('Error loading articles:', error);
    return [];
  }
});

export const getArticle = cache(async (slug: string): Promise<Article | null> => {
  try {
    const filePath = path.join(articlesDir, `${slug}.md`);
    const fileContent = await fs.readFile(filePath, 'utf8');
    const { data, content } = matter(fileContent);

    return {
      meta: {
        title: data.title || 'Без названия',
        date: data.date || new Date().toISOString(),
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '/images/default-cover.jpg',
        tags: data.tags || [],
      },
      content,
      slug,
    };
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    return null;
  }
});