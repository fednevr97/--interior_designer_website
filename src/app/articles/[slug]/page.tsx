import { getArticleBySlug, getAllArticles } from '@/lib/markdown';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map(article => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  
  return {
    title: `${article.meta.title} | Полезные статьи`,
    description: article.meta.excerpt,
    openGraph: {
      images: [article.meta.coverImage],
    },
  };
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticleBySlug(params.slug);
  if (!article) return notFound();

  return (

    // В компоненте ArticlePage:
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