import { getArticle, getArticles } from '@/lib/articles';
import { notFound } from 'next/navigation';
import ArticleContent from '../../../components/articles/ArticleContent';

export async function generateStaticParams() {
  const articles = await getArticles();
  return articles.map(article => ({ slug: article.slug }));
}

export const dynamicParams = false; // Отключаем динамические параметры

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) notFound();

  return <ArticleContent article={article} />;
}