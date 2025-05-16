'use client'

import React, { useEffect, useState } from 'react';
import NavButton from '../../shared/components/ui/NavButton/NavButton';
import Image from 'next/image';
import Modal from '../Modal/Modal';
import styles from './GallerySection.module.css';

interface GalleryItem {
  id: number;
  image: string;
  title: string;
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
}

const GallerySection: React.FC<GallerySectionProps> = ({
  id,
  title,
  items,
  defaultVisibleItems = 4,
  tabletVisibleItems = 3,
  mobileVisibleItems = 1,
  ariaLabelPrefix = 'элемент',
  itemHeight = '650px',
  mobileItemHeight = 'calc(100vh - var(--header-height-mobile) - 20px',
  gapPercent = 2, // Значение по умолчанию 2% (как в портфолио)
}) => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [visibleItems, setVisibleItems] = useState<number>(defaultVisibleItems);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setVisibleItems(mobileVisibleItems);
      } else if (window.innerWidth <= 1023) {
        setVisibleItems(tabletVisibleItems);
      } else {
        setVisibleItems(defaultVisibleItems);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [defaultVisibleItems, tabletVisibleItems, mobileVisibleItems]);

  const canGoLeft = currentIndex > 0;
  const canGoRight = currentIndex < items.length - visibleItems;

  const goLeft = () => {
    if (canGoLeft) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goRight = () => {
    if (canGoRight) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const getTransform = () => {
    // Ширина одного элемента без учета gap
    const itemWidthPercent = 100 / visibleItems;
    // Общая ширина элемента с gap (но gap добавляется только между элементами)
    const itemWithGap = itemWidthPercent + (gapPercent / visibleItems);
    // Общее смещение
    return `translateX(-${currentIndex * itemWithGap}%)`;
  };

  const getSizes = () => {
    switch(visibleItems) {
      case 1: return "100vw";
      case 2: return "(max-width: 768px) 100vw, 50vw";
      case 3: return "(max-width: 768px) 100vw, 33vw";
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";
    }
  };

  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image);
    setSelectedImageIndex(index);
  };

  const handlePrevImage = () => {
    if (selectedImageIndex > 0) {
      const newIndex = selectedImageIndex - 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(items[newIndex].image);
    }
  };

  const handleNextImage = () => {
    if (selectedImageIndex < items.length - 1) {
      const newIndex = selectedImageIndex + 1;
      setSelectedImageIndex(newIndex);
      setSelectedImage(items[newIndex].image);
    }
  };

  return (
    <section id={id} className={styles['gallery-section']} aria-labelledby={`${id}-title`}>
      <div className={styles.container}>
        <h2 id={`${id}-title`} className={styles.galleryTitle}>{title}</h2>
        <div className={styles['gallery-wrapper']}>
          <NavButton 
            variant="arrow-left" 
            ariaLabel={`Предыдущий ${ariaLabelPrefix}`} 
            onClick={goLeft}
            disabled={!canGoLeft}
          />
          <div className={styles['gallery-container']}>
            <div 
              className={styles['gallery-base']} 
              role="list"
              style={{
                '--visible-items': visibleItems,
                transform: getTransform(),
                transition: 'transform 0.3s ease'
              } as React.CSSProperties}
            >
              {items.map((item, index) => (
                <article 
                  key={item.id} 
                  className={styles['gallery-item']} 
                  role="listitem"
                  style={{
                    height: visibleItems === mobileVisibleItems ? mobileItemHeight : itemHeight
                  }}
                >
                  <div className={styles.imageWrapper} onClick={() => handleImageClick(item.image, index)}>
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
              ))}
            </div>
          </div>
          <NavButton 
            variant="arrow-right" 
            ariaLabel={`Следующий ${ariaLabelPrefix}`} 
            onClick={goRight}
            disabled={!canGoRight}
          />
        </div>
      </div>

      <Modal 
        isOpen={!!selectedImage} 
        onClose={() => setSelectedImage(null)}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        canGoPrev={selectedImageIndex > 0}
        canGoNext={selectedImageIndex < items.length - 1}
      >
        {selectedImage && (
          <Image
            src={selectedImage}
            alt="Увеличенное изображение"
            width={1200}
            height={800}
            className={styles.modalImage}
            priority
          />
        )}
      </Modal>
    </section>
  );
};

export default GallerySection;