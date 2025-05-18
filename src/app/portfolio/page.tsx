import GallerySection from '../features/Gallery/GallerySection';
import styles from './page.module.css';
import { getProjects, getCategories } from '../data/projects';

export default async function PortfolioPage() {
  const [projects, categories] = await Promise.all([
    getProjects(),
    getCategories()
  ]);

  return (
    <div className={styles.portfolioPage}>
      <h1>Наше портфолио</h1>
      
      {categories.map(category => (
        <section key={category} className={styles.categorySection}>
          <h2 className={styles.categoryTitle}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </h2>
          <GallerySection
            id={`category-${category}`}
            title=""
            items={projects.filter(p => p.folder === category)}
            displayMode="grid"
            gridColumns={3}
          />
        </section>
      ))}
    </div>
  );
}