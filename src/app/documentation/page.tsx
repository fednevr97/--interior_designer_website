import GallerySection from '../features/Gallery/GallerySection';
import styles from './page.module.css';
import { getDocumentation } from '../data/documentation'; // Импортируем функцию для получения документов

// Компонент страницы документации
export default async function DocumentationPage() {
  const documents = await getDocumentation(); // Получаем все документы

  return (
    <div className={styles.documentationPage}>
      {/* Секция галереи для отображения документов */}
      <GallerySection
        id="documentation"
        title="Образцы проектной документации"
        items={documents} // Передаем все документы
        displayMode="grid"
        gridColumns={3}
      />
    </div>
  );
}