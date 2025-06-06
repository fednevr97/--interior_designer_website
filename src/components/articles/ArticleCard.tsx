import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/lib/articles';
import styles from './ArticleCard.module.css';

// Компонент карточки статьи
export default function ArticleCard({ article }: { article: Article }) {
  return (
    // Ссылка на полную статью
    <Link href={`/articles/${article.slug}`} className={styles.card}>
      {/* Контейнер для изображения */}
      <div className={styles.imageContainer}>
        <Image
          src={article.meta.coverImage}  // Путь к изображению
          alt="Фото статьи"        // Альтернативный текст
          fill                            // Заполнение контейнера
          className={styles.image}
          sizes="(max-width: 768px) 100vw, 33vw"  // Адаптивные размеры
          quality={75} // Оптимизация качества (по умолчанию 75)
        />
      </div>
      {/* Контейнер для контента */}
      <div className={styles.content}>
        {/* Заголовок статьи */}
        <h2 className={styles.title}>{article.meta.title}</h2>
        {/* Отрывок текста */}
        <p className={styles.excerpt}>{article.meta.excerpt}</p>
                {/* Секция с тегами */}
                <div className={styles.tags}>
          {article.meta.tags?.map(tag => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>
        {/* Дата публикации */}
        <time className={styles.date}>
          {new Date(article.meta.date).toLocaleDateString('ru-RU')}
        </time>
      </div>
    </Link>
  );
}