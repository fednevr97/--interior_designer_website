'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import NavButton from '../../shared/components/ui/NavButton/NavButton';
import MemoizedImage from '../../shared/components/MemoizedImage/MemoizedImage';
import styles from './GallerySection.module.css';
import { useRouter } from 'next/navigation';

import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Thumbnails from "yet-another-react-lightbox/plugins/thumbnails";
import "yet-another-react-lightbox/plugins/thumbnails.css";

// Интерфейс для одного элемента галереи
export interface GalleryItem {
  id: number;
  image: string;
  title: string;
  category?: string;
  folder?: string;
}

// Пропсы компонента галереи
interface GallerySectionProps {
  id: string;
  title: string;
  items: GalleryItem[];
  defaultVisibleItems?: number; // сколько слайдов показывать на десктопе
  tabletVisibleItems?: number;  // не используется сейчас, но можно добавить адаптивность
  mobileVisibleItems?: number;  // сколько слайдов на мобильном
  ariaLabelPrefix?: string;
  itemHeight?: string;
  mobileItemHeight?: string;
  gapPercent?: number;
  titleLink?: string;
  displayMode?: 'slider' | 'grid'; // режим отображения: слайдер или сетка
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
  displayMode = 'slider',
  gridColumns = 3,
}) => {
  
  const router = useRouter();

  // Embla carousel ref и api
  const [emblaRef, emblaApi] = useEmblaCarousel({
    slidesToScroll: 1,
    align: "start",
    containScroll: "trimSnaps",
    dragFree: false,
    loop: false,
  });

  // Состояние для открытия/закрытия модального окна (Lightbox)
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  // Навигация стрелками: назад и вперёд
  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);
  const canGoLeft = emblaApi ? emblaApi.canScrollPrev() : false; // можно ли листать влево
  const canGoRight = emblaApi ? emblaApi.canScrollNext() : false; // можно ли листать вправо

  const [visibleItems, setVisibleItems] = useState(defaultVisibleItems);
  const [gap, setGap] = useState(20);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth <= 768) {
        setVisibleItems(mobileVisibleItems);
        setGap(8);
      } else if (window.innerWidth <= 1023) {
        setVisibleItems(tabletVisibleItems ?? defaultVisibleItems);
        setGap(12);
      } else {
        setVisibleItems(defaultVisibleItems);
        setGap(20);
      }
    }
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [defaultVisibleItems, tabletVisibleItems, mobileVisibleItems]);

  // Открытие модального окна по клику на изображение
  const handleGalleryItemClick = useCallback((idx: number) => {
    setLightboxIndex(idx);
    setLightboxOpen(true);
  }, []);

  // Обработка клика по заголовку (переход по ссылке, если задана)
  const handleTitleClick = useCallback(() => {
    if (titleLink) router.push(titleLink);
  }, [titleLink, router]);

  // sizes для адаптивных изображений
  const getSizes = useCallback(() => {
    // embla не управляет количеством visibleItems напрямую, используем defaultVisibleItems
    switch (defaultVisibleItems) {
      case 1: return "100vw";
      case 2: return "(max-width: 768px) 100vw, 50vw";
      case 3: return "(max-width: 768px) 100vw, 33vw";
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";
    }
  }, [defaultVisibleItems]);

  // Lightbox-модалка со слайдами
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

  // Рендер элементов в режиме слайдера через Embla
  const renderGalleryItems = useMemo(() => (
    <div className={styles['embla']} ref={emblaRef}>
      <div className={styles['embla__container']} style={{ gap: `${gap}px` }}>
        {items.map((item, idx) => (
          <div
            key={item.id}
            className={styles['embla__slide']}
            style={{
              height: visibleItems === mobileVisibleItems ? mobileItemHeight : itemHeight,
              minWidth: `calc((100% - ${(visibleItems - 1) * gap}px) / ${visibleItems})`
            }}
          >
            <div
              className={styles.imageWrapper}
              tabIndex={0}
              role="button"
              onClick={() => handleGalleryItemClick(idx)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleGalleryItemClick(idx); }}
              aria-label={`Открыть ${ariaLabelPrefix} ${item.title}`}
              style={{ cursor: 'pointer' }}
            >
              <MemoizedImage
                src={item.image}
                alt={item.title}
                fill
                sizes={getSizes()}
                style={{
                  objectFit:"cover",
                }}
                quality={75}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  ), [items, emblaRef, handleGalleryItemClick, visibleItems, mobileVisibleItems, mobileItemHeight, itemHeight, gap, ariaLabelPrefix, getSizes]);

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
            className={styles.imageWrapper}
            tabIndex={0}
            role="button"
            onClick={() => handleGalleryItemClick(idx)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') handleGalleryItemClick(idx); }}
            aria-label={`Открыть ${ariaLabelPrefix} ${item.title}`}
            style={{ cursor: 'pointer' }}
          >
            <MemoizedImage
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 768px) 50vw, 33vw"
              className={styles.gridImage}
              quality={75}
            />
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
            {/* Кнопка "назад" */}
            <NavButton
              variant="arrow-left"
              ariaLabel={`Предыдущий ${ariaLabelPrefix}`}
              onClick={scrollPrev}
              disabled={!canGoLeft}
            />
            <div className={styles['gallery-container']}>
              {/* EMBLA SLIDER */}
              {renderGalleryItems}
            </div>
            {/* Кнопка "вперёд" */}
            <NavButton
              variant="arrow-right"
              ariaLabel={`Следующий ${ariaLabelPrefix}`}
              onClick={scrollNext}
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