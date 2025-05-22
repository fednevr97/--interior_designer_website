import { getArticles } from '@/lib/articles';
import ArticleCard from '../../components/articles/ArticleCard';
import styles from './page.module.css';

export default async function ArticlesPage() {
  const articles = await getArticles();

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Полезные статьи</h1>
      
      <div className={styles.grid}>
        {articles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </div>
    </main>
  );
}

export const revalidate = 3600;