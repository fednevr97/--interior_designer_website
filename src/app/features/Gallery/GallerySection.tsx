'use client'

import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import NavButton from '../../shared/components/ui/NavButton/NavButton';
import MemoizedImage from '../../shared/components/MemoizedImage/MemoizedImage';
import styles from './GallerySection.module.css';
import { useRouter } from 'next/navigation';
import { Fancybox } from "@fancyapps/ui";
import "@fancyapps/ui/dist/fancybox/fancybox.css";

// Интерфейс для элемента галереи
export interface GalleryItem {
  id: number;
  image: string; // URL изображения
  title: string; // Заголовок изображения
  category?: string; // Опциональная категория
  folder?: string; // Опциональная папка
}

// Пропсы компонента GallerySection
interface GallerySectionProps {
  id: string; // Уникальный идентификатор секции
  title: string; // Заголовок секции
  items: GalleryItem[]; // Массив элементов галереи
  defaultVisibleItems?: number; // Количество видимых элементов по умолчанию
  tabletVisibleItems?: number; // Количество видимых элементов на планшетах
  mobileVisibleItems?: number; // Количество видимых элементов на мобильных
  ariaLabelPrefix?: string; // Префикс для ARIA-меток
  itemHeight?: string; // Высота элементов
  mobileItemHeight?: string; // Высота элементов на мобильных
  gapPercent?: number; // Процент отступа между элементами
  titleLink?: string; // Ссылка для заголовка (опционально)
  displayMode?: 'slider' | 'grid'; // Режим отображения (слайдер или сетка)
  gridColumns?: number; // Количество колонок в режиме сетки
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
  // Состояние для текущего индекса слайда
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Состояние для количества видимых элементов
  const [visibleItems, setVisibleItems] = useState<number>(defaultVisibleItems);
  // Состояние для отслеживания перетаскивания
  const [isDragging, setIsDragging] = useState<boolean>(false);
  // Начальная позиция X при перетаскивании
  const [startX, setStartX] = useState<number>(0);
  // Текущее смещение при перетаскивании
  const [translateX, setTranslateX] = useState<number>(0);
  
  // Реф для базового элемента галереи
  const galleryBaseRef = useRef<HTMLDivElement>(null);
  // Хук для роутинга
  const router = useRouter();

  // Интерфейсы для работы с Fancybox
  interface FancyboxSlide {
    $image?: {
      style: {
        transform: string;
      };
    };
  }

  interface FancyboxInstance {
    container: HTMLElement;
    plugins: {
      Image: {
        zoomTo: (slide: FancyboxSlide, scale: string) => void;
      };
    };
    close: () => void;
  }

  // Эффект для инициализации Fancybox
  useEffect(() => {
    const initFancybox = () => {
      // Проверка мобильного устройства
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      // Инициализация Fancybox с настройками
      Fancybox.bind(document.body, "[data-fancybox]", {
        dragToClose: isMobile, // Закрытие перетаскиванием на мобильных
        closeButton: "auto", // Автоматическое отображение кнопки закрытия
        Images: {
          zoom: !isMobile, // Отключение зума на мобильных
          zoomOpacity: "auto",
        },
        // Настройки тулбара
        Toolbar: {
          display: {
            left: ["infobar"],
            middle: isMobile ? [] : ["zoomIn", "zoomOut", "toggle1to1", "rotateCCW", "rotateCW", "flipX", "flipY"],
            right: ["close"],
          },
        },
        // Обработчики событий
        on: {
          ready: (fancybox: unknown) => {
            const instance = fancybox as FancyboxInstance;
            
            // Добавление обработчиков для мобильных устройств
            if (isMobile) {
              let startY = 0;
              let isSwiping = false;
              
              // Обработчик начала касания
              instance.container.addEventListener('touchstart', (e: TouchEvent) => {
                startY = e.touches[0].clientY;
                isSwiping = true;
              }, { passive: true });
              
              // Обработчик перемещения пальца
              instance.container.addEventListener('touchmove', (e: TouchEvent) => {
                if (!isSwiping) return;
                
                const currentY = e.touches[0].clientY;
                const diffY = Math.abs(currentY - startY);
                const diffX = Math.abs(e.touches[0].clientX - startY);
                
                // Закрытие при свайпе вниз
                if (diffY > 50 && diffY > diffX) {
                  instance.close();
                  isSwiping = false;
                }
              }, { passive: true });
              
              // Обработчик окончания касания
              instance.container.addEventListener('touchend', () => {
                isSwiping = false;
              }, { passive: true });
            }
          },
          // Переинициализация после закрытия
          destroy: () => {
            setTimeout(() => {
              initFancybox();
            }, 100);
          }
        }
      });
    };

    initFancybox();

    // Очистка при размонтировании компонента
    return () => {
      Fancybox.destroy();
    };
  }, []);

  // Обработчик клика по заголовку
  const handleTitleClick = useCallback(() => {
    if (titleLink) {
      router.push(titleLink);
    }
  }, [titleLink, router]);

  // Обработчик изменения размера окна
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

  // Проверка возможности прокрутки влево
  const canGoLeft = useMemo(() => currentIndex > 0, [currentIndex]);
  // Проверка возможности прокрутки вправо
  const canGoRight = useMemo(() => currentIndex < items.length - visibleItems, [currentIndex, items.length, visibleItems]);

  // Переход к предыдущему слайду
  const goLeft = useCallback(() => {
    if (canGoLeft) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [canGoLeft]);

  // Переход к следующему слайду
  const goRight = useCallback(() => {
    if (canGoRight) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [canGoRight]);

  // Расчет трансформации для слайдов
  const getTransform = useCallback(() => {
    if (isDragging) {
      return `translateX(calc(-${currentIndex * (100 / visibleItems + (gapPercent / visibleItems))}% + ${translateX}px))`;
    }
    const itemWidthPercent = 100 / visibleItems;
    const itemWithGap = itemWidthPercent + (gapPercent / visibleItems);
    return `translateX(-${currentIndex * itemWithGap}%)`;
  }, [isDragging, currentIndex, visibleItems, gapPercent, translateX]);

  // Определение размеров изображений в зависимости от устройства
  const getSizes = useCallback(() => {
    switch(visibleItems) {
      case 1: return "100vw";
      case 2: return "(max-width: 768px) 100vw, 50vw";
      case 3: return "(max-width: 768px) 100vw, 33vw";
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";
    }
  }, [visibleItems]);

  // Обработчики событий касания для слайдера
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (visibleItems >= items.length) return;
    if ((e.target as HTMLElement).closest('[data-fancybox]')) {
      return;
    }
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

  // Рендер элементов в режиме слайдера
  const renderGalleryItems = useMemo(() => (
    <ul className={styles['gallery-list']} role="list">
      {items.map((item) => (
        <li 
          key={item.id} 
          className={styles['gallery-item']} 
          role="listitem"
          style={{
            height: visibleItems === mobileVisibleItems ? mobileItemHeight : itemHeight
          }}
        >
          <a
            href={item.image}
            data-fancybox="gallery"
            data-type="image"
            className={styles.fancyboxItem}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => e.preventDefault()}
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
          </a>
        </li>
      ))}
    </ul>
  ), [items, visibleItems, mobileVisibleItems, mobileItemHeight, itemHeight, getSizes]);
  
  // Рендер элементов в режиме сетки
  const renderGridItems = useMemo(() => (
    <ul className={styles.gridList} role="list">
      {items.map((item) => (
        <li
          role="listitem"
          key={item.id}
          className={styles.gridItem}
        >
          <a
            href={item.image}
            data-fancybox="gallery"
            data-type="image"
            className={styles.fancyboxItem}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            onTouchStart={(e) => e.preventDefault()}
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
          </a>
        </li>
      ))}
    </ul>
  ), [items]);

  // Основной рендер компонента
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
      </div>
    </section>
  );
};

export default React.memo(GallerySection);