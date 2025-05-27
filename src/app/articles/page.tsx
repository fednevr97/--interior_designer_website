import { getArticles } from '@/lib/articles';
import ArticleCard from '../../components/articles/ArticleCard';
import styles from './page.module.css';

// Компонент страницы со списком статей
export default async function ArticlesPage() {
  // Получаем список статей с сервера
  const articles = await getArticles();

  return (
    <main className={styles.container}>
      {/* Заголовок страницы */}
      <h1 className={styles.title}>Полезные статьи</h1>
      
      {/* Сетка для отображения карточек статей */}
      <div className={styles.grid}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </main>
  );
}

// Настройка ревалидации страницы каждый час
export const revalidate = 3600;