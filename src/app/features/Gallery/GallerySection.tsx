'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import NavButton from '../../shared/components/ui/NavButton/NavButton';
import Image from 'next/image';
import Modal from '../Modal/Modal';
import styles from './GallerySection.module.css';
import { useRouter } from 'next/navigation';

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
  mobileItemHeight = 'calc(100svh - var(--header-height-mobile) - 20px)',
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
  const modalContentRef = useRef<HTMLDivElement>(null);
  const modalGalleryRef = useRef<HTMLDivElement>(null);
  const [modalCurrentIndex, setModalCurrentIndex] = useState(0);
  const [modalTranslateX, setModalTranslateX] = useState(0);
  const [isModalDragging, setIsModalDragging] = useState(false);
  const [modalStartX, setModalStartX] = useState(0);
  const router = useRouter();

  // Мемоизированный обработчик клика по заголовку
  const handleTitleClick = useCallback(() => {
    if (titleLink) {
      router.push(titleLink);
    }
  }, [titleLink, router]);

  // Мемоизированный обработчик ресайза
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

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Мемоизированные значения для навигации
  const canGoLeft = useMemo(() => currentIndex > 0, [currentIndex]);
  const canGoRight = useMemo(() => currentIndex < items.length - visibleItems, [currentIndex, items.length, visibleItems]);

  // Мемоизированные обработчики навигации
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

  // Мемоизированное вычисление transform
  const getTransform = useCallback(() => {
    if (isDragging) {
      return `translateX(calc(-${currentIndex * (100 / visibleItems + (gapPercent / visibleItems))}% + ${translateX}px))`;
    }
    const itemWidthPercent = 100 / visibleItems;
    const itemWithGap = itemWidthPercent + (gapPercent / visibleItems);
    return `translateX(-${currentIndex * itemWithGap}%)`;
  }, [isDragging, currentIndex, visibleItems, gapPercent, translateX]);

  // Мемоизированное вычисление sizes для Image
  const getSizes = useCallback(() => {
    switch(visibleItems) {
      case 1: return "100vw";
      case 2: return "(max-width: 768px) 100vw, 50vw";
      case 3: return "(max-width: 768px) 100vw, 33vw";
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";
    }
  }, [visibleItems]);

  // Мемоизированный обработчик клика по изображению
  const handleImageClick = useCallback((image: string, index: number) => {
    if (!isDragging) {
      setSelectedImage(image);
      setSelectedImageIndex(index);
      setModalCurrentIndex(index);
    }
  }, [isDragging]);

  // Мемоизированные обработчики навигации в модальном окне
  const handlePrevImage = useCallback(() => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(items[newIndex].image);
      setModalCurrentIndex(newIndex);
    }
  }, [selectedImageIndex, items]);

  const handleNextImage = useCallback(() => {
    if (selectedImageIndex < items.length - 1) {
      const newIndex = selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(items[newIndex].image);
      setModalCurrentIndex(newIndex);
    }
  }, [selectedImageIndex, items]);

  // Мемоизированные обработчики touch событий
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

  // Мемоизированные обработчики touch событий для модального окна
  const handleModalTouchStart = useCallback((e: React.TouchEvent) => {
    setIsModalDragging(true);
    setModalStartX(e.touches[0].clientX);
    setModalTranslateX(0);
  }, []);

  const handleModalTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isModalDragging) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - modalStartX;
    setModalTranslateX(diff);
  }, [isModalDragging, modalStartX]);

  const handleModalTouchEnd = useCallback(() => {
    if (!isModalDragging) return;
    setIsModalDragging(false);

    const threshold = 50;
    if (modalTranslateX > threshold) {
      handlePrevImage();
    } else if (modalTranslateX < -threshold) {
      handleNextImage();
    }
    setModalTranslateX(0);
  }, [isModalDragging, modalTranslateX, handlePrevImage, handleNextImage]);

  // Мемоизированный обработчик клика по модальному окну
  const handleModalClick = useCallback((e: React.MouseEvent) => {
    if (modalContentRef.current && !modalContentRef.current.contains(e.target as Node)) {
      setSelectedImage(null);
    }
  }, []);

  // Мемоизированное вычисление transform для модального окна
  const getModalTransform = useCallback(() => {
    if (isModalDragging) {
      return `translateX(calc(-${modalCurrentIndex * (100 / items.length)}% + ${modalTranslateX}px))`;
    }
    return `translateX(-${modalCurrentIndex * (100 / items.length)}%)`;
  }, [isModalDragging, modalCurrentIndex, items.length, modalTranslateX]);

  // Мемоизированный рендер элементов галереи
  const renderGalleryItems = useMemo(() => (
    items.map((item, index) => (
      <article 
        key={item.id} 
        className={styles['gallery-item']} 
        role="group"
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
            loading="lazy"
            fill  
            sizes={getSizes()}
          />
        </div>
        <h3>{item.title}</h3>
      </article>
    ))
  ), [items, visibleItems, mobileVisibleItems, mobileItemHeight, itemHeight, handleImageClick, getSizes]);

  // Мемоизированный рендер grid элементов
  const renderGridItems = useMemo(() => (
    items.map((item) => (
      <article 
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
      </article>
    ))
  ), [items, handleImageClick]);

  // Мемоизированный рендер модальных изображений
  const renderModalImages = useMemo(() => (
    items.map((item, index) => (
      <div 
        key={item.id}
        className={styles.modalImageWrapper}
        style={{
          width: `${100 / items.length}%`,
          opacity: selectedImageIndex === index ? 1 : 0.5,
          transition: 'opacity 0.3s ease',
          flexShrink: 0
        }}
      >
        <Image
          src={item.image}
          alt={item.title}
          width={1200}
          height={800}
          className={styles.modalImage}
          priority
          style={{
            maxWidth: '100%',
            maxHeight: '80dvh',
            width: 'auto',
            objectFit: 'contain'
          }}
        />
      </div>
    ))
  ), [items, selectedImageIndex]);

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
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        canGoPrev={selectedImageIndex > 0}
        canGoNext={selectedImageIndex < items.length - 1}
        onClick={handleModalClick}
      >
        <div 
          ref={modalContentRef}
          className={styles.modalContent}
        >
          <div 
            ref={modalGalleryRef}
            className={styles.modalGalleryContainer}
            onTouchStart={handleModalTouchStart}
            onTouchMove={handleModalTouchMove}
            onTouchEnd={handleModalTouchEnd}
            style={{
              transform: getModalTransform(),
              transition: isModalDragging ? 'none' : 'transform 0.3s ease',
              width: `${items.length * 100}%`,
              display: 'flex'
            }}
          >
            {renderModalImages}
          </div>
        </div>
      </Modal>
    </section>
  );
};

export default React.memo(GallerySection);