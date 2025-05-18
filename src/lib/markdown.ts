import { remark } from 'remark';
import html from 'remark-html';
import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';
import remarkImages from 'remark-images';

const articlesDir = path.join(process.cwd(), 'content/articles');

interface Article {
  slug: string;
  meta: {
    title: string;
    date: string;
    excerpt: string;
    coverImage: string;
  };
  content: string;
}

export async function getAllArticles(): Promise<Article[]> {
  const filenames = await fs.readdir(articlesDir);
  
  return Promise.all(
    filenames.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '');
      return getArticleBySlug(slug);
    })
  );
}

export async function getArticleBySlug(slug: string): Promise<Article> {
  const filePath = path.join(articlesDir, `${slug}.md`);
  const fileContent = await fs.readFile(filePath, 'utf8');
  const { data, content } = matter(fileContent);

  // Обработка Markdown с изображениями
  const processedContent = await remark()
    .use(html)
    .use(remarkImages)
    .process(content);

  return {
    slug,
    meta: {
      title: data.title,
      date: data.date,
      excerpt: data.excerpt || '',
      coverImage: data.coverImage || `/images/articles/${slug}/cover.jpg`
    },
    content: processedContent.toString()
  };
}