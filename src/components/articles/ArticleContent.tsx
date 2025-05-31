'use client';

import { Article } from '@/lib/articles';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import styles from './ArticleContent.module.css';

  // Функция для получения стилей изображения
  const getImageStyle = (): React.CSSProperties => {
    // Применяем ограничения перед рендерингом
    
    return {
      objectFit: 'contain',
      transformOrigin: 'center center',
      height:'100%',
      width:'100%'
    };
  };

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
            width={1200}
            height={800}
            loading="lazy"
            style={getImageStyle()}
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
        <h2 className={styles.title}>{article.meta.title}</h2>
        {/* Дата публикации */}
        <time className={styles.date}>
          {new Date(article.meta.date).toLocaleDateString('ru-RU')}
        </time>
      </header>

      {/* Основной контент статьи */}

      <div className={styles.content}>
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </div>
    </article>
  );
}