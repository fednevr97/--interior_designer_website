'use client';

import { Article } from '@/lib/articles';
import Image from 'next/image';
import styles from './ArticleContent.module.css';

// Компонент для отображения содержимого статьи
export default function ArticleContent({ article }: { article: Article }) {
  return (
    // Основной контейнер статьи
    <article className={styles.container}>
      {/* Шапка статьи */}
      <header className={styles.header}>
        {/* Контейнер для обложки */}
        <div className={styles.imageContainer}>
          <Image
            src={article.meta.coverImage}  // Путь к изображению
            alt="Фото статьи"        // Альтернативный текст
            fill                            // Заполнение контейнера
            className={styles.image}
            quality={75} // Оптимизация качества (по умолчанию 75)
          />
        </div>
        
        {/* Секция с тегами */}
        <div className={styles.tags}>
          {article.meta.tags?.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        
        {/* Заголовок статьи */}
        <h1 className={styles.title}>{article.meta.title}</h1>
        {/* Дата публикации */}
        <time className={styles.date}>
          {new Date(article.meta.date).toLocaleDateString('ru-RU')}
        </time>
      </header>

      {/* Основной контент статьи */}
      <div 
        className={styles.content}
        dangerouslySetInnerHTML={{ __html: article.content }}  // Вставка HTML-контента
      />
    </article>
  );
}