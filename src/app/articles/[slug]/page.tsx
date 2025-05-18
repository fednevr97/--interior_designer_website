import { getArticleBySlug, getAllArticles } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import styles from './page.module.css';
import Image from 'next/image';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const article = await getArticleBySlug(params.slug);
  if (!article) return {};

  return {
    title: `${article.meta.title} | Полезные статьи`,
    description: article.meta.excerpt,
    openGraph: {
      images: [article.meta.coverImage],
    },
  };
}

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((article) => ({ slug: article.slug }));
}

export default async function ArticlePage({
  params,
}: {
  params: { slug: string };
}) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return notFound();

  return (
    <article className={styles.articleContainer}>
      <div className={styles.articleContent}>
        <div className={styles.articleImageContainer}>
         <Image
            src={article.meta.coverImage}
            alt={article.meta.title}
            fill
            className={styles.articleImage}
            priority
          />
        </div>
        
        <header className={styles.articleHeader}>
        <h1 className={styles.articleTitle}>{article.meta.title}</h1>
          <time className={styles.articleDate}>
            {new Date(article.meta.date).toLocaleDateString()}
          </time>
        </header>

        <div 
          className={styles.articleBody}
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </div>
    </article>
  );
}