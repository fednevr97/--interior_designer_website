import { getAllArticles } from '@/lib/markdown';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css'; 

export default async function ArticlesPage() {
  const articles = await getAllArticles();

  return (
<div className={styles.articlesPage}>
  <h1 className={styles.articlesTitle}>Полезные статьи</h1>
  
  <div className={styles.articlesGrid}>
    {articles.map((article) => (
      <article key={article.slug} className={styles.articleCard}>
        <Link href={`/articles/${article.slug}`} className={styles.articleLink}>
          <div className={styles.articleCardImageContainer}>
            <Image
              src={article.meta.coverImage}
              alt={article.meta.title}
              fill
              className={styles.articleCardImage}
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <h2 className={styles.articleCardTitle}>{article.meta.title}</h2>
          <p className={styles.articleCardExcerpt}>{article.meta.excerpt}</p>
          <time className={styles.articleCardDate}>
            {new Date(article.meta.date).toLocaleDateString()}
          </time>
        </Link>
      </article>
    ))}
  </div>
</div>
  );
}