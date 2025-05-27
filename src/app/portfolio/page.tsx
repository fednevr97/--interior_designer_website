import GallerySection from '../features/Gallery/GallerySection';
import styles from './page.module.css';
import { getProjects, getCategories } from '../data/projects';

// Асинхронный компонент страницы портфолио
export default async function PortfolioPage() {
  // Параллельная загрузка проектов и категорий
  const [projects, categories] = await Promise.all([
    getProjects(),  // Получение всех проектов
    getCategories() // Получение списка категорий
  ]);

  return (
    <div className={styles.portfolioPage}>
      {/* Главный заголовок страницы */}
      <h1>Наше портфолио</h1>
      
      {/* Маппинг по категориям для создания секций */}
      {categories.map(category => (
        <section key={category} className={styles.categorySection}>
          {/* Заголовок категории с форматированием первой буквы */}
          <h2 className={styles.categoryTitle}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          {/* Компонент галереи для отображения проектов категории */}
          <GallerySection
            id={`category-${category}`}  // Уникальный идентификатор для каждой категории
            title=""                     // Пустой заголовок, так как используется categoryTitle
            items={projects.filter(p => p.folder === category)}  // Фильтрация проектов по категории
            displayMode="grid"           // Режим отображения в виде сетки
            gridColumns={3}              // Количество колонок в сетке
          />
        </section>
      ))}
    </div>
  );
}