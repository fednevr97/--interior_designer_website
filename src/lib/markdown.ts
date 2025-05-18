import { promises as fs } from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

// Правильный путь к статьям
const articlesDirectory = path.join(process.cwd(), 'content/articles');

interface ArticleMeta {
  title: string;
  excerpt: string;
  coverImage: string;
  date: string;
}

interface Article {
  meta: ArticleMeta;
  content: string;
  slug: string;
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  try {
    const fullPath = path.join(articlesDirectory, `${slug}.md`);
    const fileContents = await fs.readFile(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    const processedContent = await remark()
      .use(html)
      .process(content);

    return {
      meta: {
        title: data.title || 'Без названия',
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '/images/default-cover.jpg',
        date: data.date || new Date().toISOString(),
      },
      content: processedContent.toString(),
      slug,
    };
  } catch (error) {
    console.error(`Error loading article ${slug}:`, error);
    return null;
  }
}

export async function getAllArticles(): Promise<{ meta: ArticleMeta; slug: string }[]> {
  try {
    const files = await fs.readdir(articlesDirectory);
    const articles = await Promise.all(
      files
        .filter((file) => file.endsWith('.md'))
        .map(async (file) => {
          const slug = file.replace(/\.md$/, '');
          const article = await getArticleBySlug(slug);
          if (!article) {
            throw new Error(`Article ${slug} is broken`);
          }
          return {
            meta: article.meta,
            slug: article.slug,
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
}