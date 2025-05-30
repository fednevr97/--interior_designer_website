import GallerySection from '../features/Gallery/GallerySection';
import styles from './page.module.css';
import { getProjects, getCategories } from '../data/projects';

export const revalidate = 3600; // Кэшировать на 1 час
// Асинхронный компонент страницы портфолио
export default async function PortfolioPage() {
// Добавить кэширование

// Оптимизировать запрос
const [projects, categories] = await Promise.all([
  getProjects().then(projects => {
    // Предварительная загрузка изображений
    return projects.map(project => ({
      ...project,
      image: project.image // Добавить предварительную загрузку
    }));
  }),
  getCategories()
]);
  return (
    <div className={styles.portfolioPage}>
      {/* Главный заголовок страницы */}
      <h1>Моё портфолио</h1>
      
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