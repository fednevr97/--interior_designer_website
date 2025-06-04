'use client';

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import NavButton from '../../shared/components/ui/NavButton/NavButton';
import MemoizedImage from '../../shared/components/MemoizedImage/MemoizedImage';
import styles from './GallerySection.module.css';
import { useRouter } from 'next/navigation';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

export interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category?: string;
  folder?: string;
}

interface GallerySectionProps {
  id: string;
  title: string;
  items: GalleryItem[];
  defaultVisibleItems?: number;
  tabletVisibleItems?: number;
  mobileVisibleItems?: number;
  ariaLabelPrefix?: string;
  itemHeight?: string;
  mobileItemHeight?: string;
  gapPercent?: number;
  titleLink?: string;
  displayMode?: 'slider' | 'grid';
  gridColumns?: number;
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

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0);
  const [translateX, setTranslateX] = useState<number>(0);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  const galleryBaseRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const handleTitleClick = useCallback(() => {
    if (titleLink) router.push(titleLink);
  }, [titleLink, router]);

  const prevVisibleItems = useRef(visibleItems);

  // handleResize
  const handleResize = useCallback(() => {
    let newVisibleItems = defaultVisibleItems;
    if (window.innerWidth <= 768) {
      newVisibleItems = mobileVisibleItems;
    } else if (window.innerWidth <= 1023) {
      newVisibleItems = tabletVisibleItems;
    }

    setVisibleItems(prev => {
      if (prev !== newVisibleItems) {
        setCurrentIndex(0);
        setTranslateX(0);
      }
      return newVisibleItems;
    });
    prevVisibleItems.current = newVisibleItems;
  }, [defaultVisibleItems, tabletVisibleItems, mobileVisibleItems]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const canGoLeft = useMemo(() => currentIndex > 0, [currentIndex]);
  const canGoRight = useMemo(
    () => currentIndex < items.length - visibleItems,
    [currentIndex, items.length, visibleItems]
  );

  const goLeft = useCallback(() => {
    if (canGoLeft) setCurrentIndex(prev => prev - 1);
  }, [canGoLeft]);

  const goRight = useCallback(() => {
    if (canGoRight) setCurrentIndex(prev => prev + 1);
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
    switch (visibleItems) {
      case 1: return "100vw";
      case 2: return "(max-width: 768px) 100vw, 50vw";
      case 3: return "(max-width: 768px) 100vw, 33vw";
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";
    }
  }, [visibleItems]);

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
    const threshold = 50;
    if (translateX > threshold && canGoLeft) {
      goLeft();
    } else if (translateX < -threshold && canGoRight) {
      goRight();
    }
    setTranslateX(0);
  }, [isDragging, visibleItems, items.length, translateX, canGoLeft, canGoRight, goLeft, goRight]);

  // Открытие модального окна по клику
  const handleGalleryItemClick = useCallback((idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }, []);

    // Исправленный рендер Lightbox
    const renderLightbox = useMemo(() => (
      <Lightbox
        open={lightboxOpen}
        close={() => setLightboxOpen(false)}
        slides={items.map(item => ({ src: item.image, alt: item.title }))}
        index={lightboxIndex}
        on={{ view: ({ index }) => setLightboxIndex(index) }}
        plugins={[Zoom, Thumbnails]}
        carousel={{
          finite: items.length <= 5,
        }}
      />
    ), [lightboxOpen, lightboxIndex, items]);

  // Рендер элементов в режиме слайдера
  const renderGalleryItems = useMemo(() => (
    <ul className={styles['gallery-list']} role="list">
      {items.map((item, idx) => (
        <li
          key={item.id}
          className={styles['gallery-item']}
          role="listitem"
          style={{
            height: visibleItems === mobileVisibleItems ? mobileItemHeight : itemHeight
          }}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={() => handleGalleryItemClick(idx)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleGalleryItemClick(idx); }}
            aria-label={`Открыть ${ariaLabelPrefix} ${item.title}`}
            className={styles.fancyboxItem}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.imageWrapper}>
              <MemoizedImage
                src={item.image}
                alt={item.title}
                loading="eager"
                fill
                sizes={getSizes()}
                quality={75}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  ), [items, visibleItems, mobileVisibleItems, mobileItemHeight, itemHeight, getSizes, handleGalleryItemClick, ariaLabelPrefix]);

  // Рендер элементов в режиме сетки
  const renderGridItems = useMemo(() => (
    <ul className={styles.gridList} role="list">
      {items.map((item, idx) => (
        <li
          role="listitem"
          key={item.id}
          className={styles.gridItem}
        >
          <div
            tabIndex={0}
            role="button"
            onClick={() => handleGalleryItemClick(idx)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleGalleryItemClick(idx); }}
            aria-label={`Открыть ${ariaLabelPrefix} ${item.title}`}
            className={styles.fancyboxItem}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.imageWrapper}>
              <MemoizedImage
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className={styles.gridImage}
                loading="lazy"
                quality={75}
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  ), [items, handleGalleryItemClick, ariaLabelPrefix]);

  return (
    <section id={id} className={styles['gallery-section']} aria-labelledby={`${id}-title`}>
      <div className={styles.container}>
        {/* Заголовок секции, может вести по ссылке */}
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
                  transition: isDragging ? 'none' : 'transform 0.3s ease',
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
        {/* --- модальное окно lightbox --- */}
        {renderLightbox}
        {/* --- конец модального окна --- */}
      </div>
    </section>
  );
};

export default React.memo(GallerySection);