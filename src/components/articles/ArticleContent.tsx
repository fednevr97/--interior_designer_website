'use client';

import { Article } from '@/lib/articles';
import Image from 'next/image';
import styles from './ArticleContent.module.css';

export default function ArticleContent({ article }: { article: Article }) {
  return (
    <article className={styles.container}>
      <header className={styles.header}>
        <div className={styles.imageContainer}>
          <Image
            src={article.meta.coverImage}
            alt={article.meta.title}
            fill
            className={styles.image}
            priority
          />
        </div>
        
        <div className={styles.tags}>
          {article.meta.tags?.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        
        <h1 className={styles.title}>{article.meta.title}</h1>
        <time className={styles.date}>
          {new Date(article.meta.date).toLocaleDateString('ru-RU')}
        </time>
      </header>

      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
    </article>
  );
}