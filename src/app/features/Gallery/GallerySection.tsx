'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import NavButton from '../../shared/components/ui/NavButton/NavButton';
import Image from 'next/image';
import Modal from '../Modal/Modal';
import styles from './GallerySection.module.css';
import { useRouter } from 'next/navigation';

// Интерфейс для элемента галереи
export interface GalleryItem {
  id: number;        // Уникальный идентификатор элемента
  image: string;     // URL изображения
  title: string;     // Заголовок элемента
  category?: string; // Опциональная категория для фильтрации
  folder?: string;   // Опциональная папка для группировки
}

// Интерфейс для пропсов компонента GallerySection
interface GallerySectionProps {
  id: string;                    // Уникальный идентификатор секции
  title: string;                 // Заголовок галереи
  items: GalleryItem[];          // Массив элементов галереи
  defaultVisibleItems?: number;  // Количество видимых элементов по умолчанию
  tabletVisibleItems?: number;   // Количество видимых элементов на планшетах
  mobileVisibleItems?: number;   // Количество видимых элементов на мобильных
  ariaLabelPrefix?: string;      // Префикс для ARIA-меток (для доступности)
  itemHeight?: string;           // Высота элементов галереи
  mobileItemHeight?: string;     // Высота элементов на мобильных устройствах
  gapPercent?: number;           // Процент промежутка между элементами
  titleLink?: string;            // Ссылка в заголовке (для навигации)
  displayMode?: 'slider' | 'grid'; // Режим отображения: слайдер или сетка
  gridColumns?: number;          // Количество колонок в режиме сетки
}

const GallerySection: React.FC<GallerySectionProps> = ({
  id,
  title,
  items,
  titleLink,
  defaultVisibleItems = 4,      // По умолчанию показываем 4 элемента
  tabletVisibleItems = 3,       // На планшетах - 3 элемента
  mobileVisibleItems = 1,       // На мобильных - 1 элемент
  ariaLabelPrefix = 'элемент',  // Префикс для ARIA-меток
  itemHeight = '650px',         // Стандартная высота элемента
  mobileItemHeight = 'calc(100vw * 16 / 9 - var(--header-height-mobile) - 20px)', // Адаптивная высота для мобильных
  gapPercent = 2,               // Процент промежутка между элементами
  displayMode = 'slider',       // Режим отображения по умолчанию - слайдер
  gridColumns = 3,              // Количество колонок в сетке по умолчанию
}) => {
  // Состояния компонента
  const [currentIndex, setCurrentIndex] = useState<number>(0);           // Текущий индекс слайда
  const [visibleItems, setVisibleItems] = useState<number>(defaultVisibleItems); // Количество видимых элементов
  const [selectedImage, setSelectedImage] = useState<string | null>(null); // Выбранное изображение для модалки
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0); // Индекс выбранного изображения
  const [isDragging, setIsDragging] = useState<boolean>(false);         // Флаг перетаскивания
  const [startX, setStartX] = useState<number>(0);                      // Начальная позиция X при перетаскивании
  const [translateX, setTranslateX] = useState<number>(0);              // Смещение при перетаскивании
  
  const galleryBaseRef = useRef<HTMLDivElement>(null);                  // Реф на контейнер галереи
  const router = useRouter();                                          // Хук для навигации   

  // Обработчик клика по заголовку (переход по ссылке)
  const handleTitleClick = useCallback(() => {
    if (titleLink) {
      router.push(titleLink);
    }
  }, [titleLink, router]);

  // Обработчик изменения размера окна (адаптивность)
  const handleResize = useCallback(() => {
    if (window.innerWidth <= 768) {
      setVisibleItems(mobileVisibleItems);      // Мобильная версия
    } else if (window.innerWidth <= 1023) {
      setVisibleItems(tabletVisibleItems);      // Планшетная версия
    } else {
      setVisibleItems(defaultVisibleItems);     // Десктопная версия
    }
    setCurrentIndex(0);                         // Сброс индекса при изменении размера
    setTranslateX(0);                           // Сброс смещения
  }, [defaultVisibleItems, tabletVisibleItems, mobileVisibleItems]);

  // Эффект для подписки на события изменения размера
  useEffect(() => {
    handleResize();                             // Инициализация при монтировании
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Проверка возможности навигации
  const canGoLeft = useMemo(() => currentIndex > 0, [currentIndex]);
  const canGoRight = useMemo(() => currentIndex < items.length - visibleItems, [currentIndex, items.length, visibleItems]);

  // Обработчики навигации
  const goLeft = useCallback(() => {
    if (canGoLeft) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canGoLeft]);

  const goRight = useCallback(() => {
    if (canGoRight) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canGoRight]);

  // Расчет transform стиля для слайдера
  const getTransform = useCallback(() => {
    if (isDragging) {
      // При перетаскивании учитываем текущее смещение
      return `translateX(calc(-${currentIndex * (100 / visibleItems + (gapPercent / visibleItems))}% + ${translateX}px))`;
    }
    // Стандартное смещение для анимации
    const itemWidthPercent = 100 / visibleItems;
    const itemWithGap = itemWidthPercent + (gapPercent / visibleItems);
    return `translateX(-${currentIndex * itemWithGap}%)`;
  }, [isDragging, currentIndex, visibleItems, gapPercent, translateX]);

  // Определение sizes для Image в зависимости от количества видимых элементов
  const getSizes = useCallback(() => {
    switch(visibleItems) {
      case 1: return "100vw";                    // Один элемент на всю ширину
      case 2: return "(max-width: 768px) 100vw, 50vw"; // Два элемента
      case 3: return "(max-width: 768px) 100vw, 33vw"; // Три элемента
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw"; // Четыре элемента
    }
  }, [visibleItems]);

  // Обработчик клика по изображению (открытие модалки)
  const handleImageClick = useCallback((image: string, index: number) => {
    if (!isDragging) {
      // 1. Сначала устанавливаем индекс
      setSelectedImageIndex(index);
      
      // 2. Затем, в следующем цикле рендеринга, открываем модалку с этим изображением
      // Используем setTimeout с 0 для отложенного выполнения
      const timer = setTimeout(() => {
        setSelectedImage(image);
      }, 300);
  
      return () => clearTimeout(timer);
    }
  }, [isDragging]);

  // Обработчики touch-событий для слайдера
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (visibleItems >= items.length) return; // Не обрабатываем если все элементы видны
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  }, [visibleItems, items.length]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || visibleItems >= items.length) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  }, [isDragging, visibleItems, items.length, startX]);

  const handleTouchEnd = useCallback(() => {
    if (!isDragging || visibleItems >= items.length) return;
    setIsDragging(false);

    const threshold = 50; // Порог для срабатывания навигации
    if (translateX > threshold && canGoLeft) {
      goLeft();
    } else if (translateX < -threshold && canGoRight) {
      goRight();
    }
    setTranslateX(0); // Сброс смещения
  }, [isDragging, visibleItems, items.length, translateX, canGoLeft, canGoRight, goLeft, goRight]);

  // Рендер элементов галереи (режим слайдера)
  const renderGalleryItems = useMemo(() => (
    <ul className={styles['gallery-list']} role="list">
      {items.map((item, index) => (
        <li 
          key={item.id} 
          className={styles['gallery-item']} 
          role="listitem"
          style={{
            height: visibleItems === mobileVisibleItems ? mobileItemHeight : itemHeight
          }}
        >
          <div 
            className={styles.imageWrapper} 
            onClick={() => handleImageClick(item.image, index)}
          >
            <Image 
              src={item.image} 
              alt="Фото галереи" 
              loading="eager"
              fill  
              sizes={getSizes()}
              quality={75} // Оптимизация качества (по умолчанию 75)
            />
          </div>
        </li>
      ))}
    </ul>
  ), [items, visibleItems, mobileVisibleItems, mobileItemHeight, itemHeight, handleImageClick, getSizes]);

  // Рендер элементов галереи (режим сетки)
  const renderGridItems = useMemo(() => (
    <ul className={styles.gridList} role="list">
      {items.map((item) => (
        <li
          role="listitem"
          key={item.id}
          className={styles.gridItem}
          onClick={() => handleImageClick(item.image, items.findIndex(i => i.id === item.id))}
        >
          <div className={styles.imageWrapper}>
            <Image 
              src={item.image}
              alt="Фото галереи" 
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={styles.gridImage}
              loading="lazy"
              quality={75} // Оптимизация качества (по умолчанию 75)
            />
          </div>
        </li>
      ))}
    </ul>
  ), [items, handleImageClick]);

  return (
    <section id={id} className={styles['gallery-section']} aria-labelledby={`${id}-title`}>
      <div className={styles.container}>
        <h2 
          id={`${id}-title`}
          className={styles.galleryTitle}
          onClick={titleLink ? handleTitleClick : undefined}
          style={{ 
            cursor: titleLink ? 'pointer' : 'default',
          }}
        >
          {title}
        </h2>
        
        {displayMode === 'slider' ? (
          <div className={styles['gallery-wrapper']}>
            {/* Кнопка навигации влево */}
            <NavButton 
              variant="arrow-left" 
              ariaLabel={`Предыдущий ${ariaLabelPrefix}`} 
              onClick={goLeft}
              disabled={!canGoLeft}
            />
            
            {/* Контейнер слайдера */}
            <div className={styles['gallery-container']}>
              <div 
                ref={galleryBaseRef}
                className={styles['gallery-base']} 
                role="list"
                style={{
                  '--visible-items': visibleItems,
                  transform: getTransform(),
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
                } as React.CSSProperties}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {renderGalleryItems}
              </div>
            </div>
            
            {/* Кнопка навигации вправо */}
            <NavButton 
              variant="arrow-right" 
              ariaLabel={`Следующий ${ariaLabelPrefix}`} 
              onClick={goRight}
              disabled={!canGoRight}
            />
          </div>
        ) : (
          /* Режим сетки */
          <div className={styles.gridContainer} style={{ '--grid-columns': gridColumns } as React.CSSProperties}>
            {renderGridItems}
          </div>
        )}
      </div>

      {/* Модальное окно для просмотра изображений */}
      <Modal 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)}
        items={items}
        initialIndex={selectedImageIndex}
      />
    </section>
  );
};

export default React.memo(GallerySection);