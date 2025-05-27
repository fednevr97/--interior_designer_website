import { getArticle, getArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import ArticleContent from '../../../components/articles/ArticleContent';

// Функция для генерации статических параметров страниц
export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map(article => ({ slug: article.slug }));
}

// Отключаем динамические параметры для оптимизации
export const dynamicParams = false;

// Компонент страницы статьи
export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  // Если статья не найдена, показываем 404
  if (!article) notFound();

  return <ArticleContent article={article} />;
}