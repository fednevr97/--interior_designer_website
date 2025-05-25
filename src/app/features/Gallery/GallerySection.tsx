'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import NavButton from '../../shared/components/ui/NavButton/NavButton';
import Image from 'next/image';
import Modal from '../Modal/Modal';
import styles from './GallerySection.module.css';
import { useRouter } from 'next/navigation';

// Интерфейс для элемента галереи
export interface GalleryItem {
  id: number;
  image: string; // URL изображения
  title: string; // Заголовок элемента
  category?: string; // Опциональная категория
  folder?: string; // Опциональная папка
}

// Интерфейс для пропсов компонента GallerySection
interface GallerySectionProps {
  id: string; // Уникальный идентификатор секции
  title: string; // Заголовок галереи
  items: GalleryItem[]; // Массив элементов галереи
  defaultVisibleItems?: number; // Количество видимых элементов по умолчанию
  tabletVisibleItems?: number; // Количество на планшетах
  mobileVisibleItems?: number; // Количество на мобильных
  ariaLabelPrefix?: string; // Префикс для ARIA-меток
  itemHeight?: string; // Высота элементов
  mobileItemHeight?: string; // Высота на мобильных
  gapPercent?: number; // Процент промежутка между элементами
  titleLink?: string; // Ссылка в заголовке
  displayMode?: 'slider' | 'grid'; // Режим отображения
  gridColumns?: number; // Количество колонок в grid-режиме
}

const GallerySection: React.FC<GallerySectionProps> = ({
  id,
  title,
  items,
  titleLink,
  defaultVisibleItems = 4,
  tabletVisibleItems = 3,
  mobileVisibleItems = 1,
  ariaLabelPrefix = 'элемент',
  itemHeight = '650px',
  mobileItemHeight = 'calc(100vw * 16 / 9 - var(--header-height-mobile) - 20px)',
  gapPercent = 2,
  displayMode = 'slider',
  gridColumns = 3,
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(defaultVisibleItems);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);
  
  const galleryBaseRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

    // Обработчик клика по заголовку (переход по ссылке)
  const handleTitleClick = useCallback(() => {
    if (titleLink) {
      router.push(titleLink);
    }
  }, [titleLink, router]);

  // Обработчик изменения размера окна (адаптивность)
  const handleResize = useCallback(() => {
    if (window.innerWidth <= 768) {
      setVisibleItems(mobileVisibleItems);
    } else if (window.innerWidth <= 1023) {
      setVisibleItems(tabletVisibleItems);
    } else {
      setVisibleItems(defaultVisibleItems);
    }
    setCurrentIndex(0);
    setTranslateX(0);
  }, [defaultVisibleItems, tabletVisibleItems, mobileVisibleItems]);

  // Эффект для подписки на события изменения размера
  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

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

  const getTransform = useCallback(() => {
    if (isDragging) {
      return `translateX(calc(-${currentIndex * (100 / visibleItems + (gapPercent / visibleItems))}% + ${translateX}px))`;
    }
    const itemWidthPercent = 100 / visibleItems;
    const itemWithGap = itemWidthPercent + (gapPercent / visibleItems);
    return `translateX(-${currentIndex * itemWithGap}%)`;
  }, [isDragging, currentIndex, visibleItems, gapPercent, translateX]);

  const getSizes = useCallback(() => {
    switch(visibleItems) {
      case 1: return "100vw";
      case 2: return "(max-width: 768px) 100vw, 50vw";
      case 3: return "(max-width: 768px) 100vw, 33vw";
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";
    }
  }, [visibleItems]);

  const handleImageClick = useCallback((image: string, index: number) => {
    if (!isDragging) {
      setSelectedImage(image);
      setSelectedImageIndex(index);
    }
  }, [isDragging]);

    // Обработчики touch-событий для слайдера
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (visibleItems >= items.length) return;
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
    setTranslateX(0);
  }, [isDragging, visibleItems, items.length, translateX, canGoLeft, canGoRight, goLeft, goRight]);

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
              alt={item.title} 
              loading="eager"
              fill  
              sizes={getSizes()}
            />
          </div>
          <h3>{item.title}</h3>
        </li>
      ))}
    </ul>
  ), [items, visibleItems, mobileVisibleItems, mobileItemHeight, itemHeight, handleImageClick, getSizes]);

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
              alt={item.title}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={styles.gridImage}
            />
          </div>
          <h3>{item.title}</h3>
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
            <NavButton 
              variant="arrow-left" 
              ariaLabel={`Предыдущий ${ariaLabelPrefix}`} 
              onClick={goLeft}
              disabled={!canGoLeft}
            />
            
            <div className={styles['gallery-container']}>
              <div 
                ref={galleryBaseRef}
                className={styles['gallery-base']} 
                role="list"
                style={{
                  '--visible-items': visibleItems,
                  transform: getTransform(),
                  transition: isDragging ? 'none' : 'transform 0.3s ease'
                } as React.CSSProperties}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
                {renderGalleryItems}
              </div>
            </div>
            
            <NavButton 
              variant="arrow-right" 
              ariaLabel={`Следующий ${ariaLabelPrefix}`} 
              onClick={goRight}
              disabled={!canGoRight}
            />
          </div>
        ) : (
          <div className={styles.gridContainer} style={{ '--grid-columns': gridColumns } as React.CSSProperties}>
            {renderGridItems}
          </div>
        )}
      </div>

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