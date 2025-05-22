import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/articles';
import styles from './ArticleCard.module.css';

export default function ArticleCard({ article }: { article: Article }) {
  return (
    <Link href={`/articles/${article.slug}`} className={styles.card}>
      <div className={styles.imageContainer}>
        <Image
          src={article.meta.coverImage}
          alt={article.meta.title}
          fill
          className={styles.image}
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className={styles.content}>
        <div className={styles.tags}>
          {article.meta.tags?.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        <h2 className={styles.title}>{article.meta.title}</h2>
        <p className={styles.excerpt}>{article.meta.excerpt}</p>
        <time className={styles.date}>
          {new Date(article.meta.date).toLocaleDateString('ru-RU')}
        </time>
      </div>
    </Link>
  );
}