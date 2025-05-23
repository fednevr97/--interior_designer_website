import { getArticle, getArticles } from '@/lib/articles';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';


// Динамический импорт для тяжелого контента
const ArticleContent = dynamic(
  () => import('../../../components/articles/ArticleContent'),
  { 
    loading: () => <div>Loading article...</div>,
    ssr: false 
  }
);

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
  // Распаковываем Promise с параметрами
  const { slug } = await params;
  const article = await getArticle(slug);
  
  if (!article) notFound();

  return <ArticleContent article={article} />;
}