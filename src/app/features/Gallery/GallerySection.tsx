'use client';

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
  image: string;
  title: string;
  category?: string;
  folder?: string;
}

// Пропсы компонента GallerySection
interface GallerySectionProps {
  id: string;    // уникальный id секции (например, для якоря и fancybox)
  title: string; // заголовок секции
  items: GalleryItem[]; // массив элементов галереи
  defaultVisibleItems?: number; // сколько элементов видно по умолчанию (десктоп)
  tabletVisibleItems?: number;  // сколько элементов видно на планшете
  mobileVisibleItems?: number;  // сколько элементов видно на мобильном
  ariaLabelPrefix?: string;     // префикс для aria-label навигации
  itemHeight?: string;          // высота элемента на десктопе/планшете
  mobileItemHeight?: string;    // высота элемента на мобильном
  gapPercent?: number;          // зазор между элементами в %
  titleLink?: string;           // ссылка по клику на заголовок
  displayMode?: 'slider' | 'grid'; // режим отображения: "слайдер" или "сетка"
  gridColumns?: number;         // число колонок в сетке
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
  // Индекс текущего первого видимого элемента (для слайдера)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  // Текущее число видимых элементов (зависит от ширины экрана)
  const [visibleItems, setVisibleItems] = useState<number>(defaultVisibleItems);

  // Состояния для drag-свайпов на мобильных
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [startX, setStartX] = useState<number>(0); // координата начала свайпа
  const [translateX, setTranslateX] = useState<number>(0); // смещение при свайпе

  // ref к базе слайдера (можно использовать для прокрутки или измерения)
  const galleryBaseRef = useRef<HTMLDivElement>(null);

  // Для перехода по ссылке из заголовка
  const router = useRouter();

  // data-fancybox атрибут (группа изображений для модального окна)
  const dataFancybox = `gallery-${id}`;

  // ----------------- Fancybox инициализация -----------------
  useEffect(() => {
    // Селектор для всех ссылок внутри этой галереи
    const selector = `[data-fancybox="${dataFancybox}"]`;

    // Проверяем мобильное устройство для некоторых опций fancybox
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Инициализация fancybox на найденных ссылках
    Fancybox.bind(selector, {
      Hash: false,
      dragToClose: isMobile,
      closeButton: "auto",
      Images: {
        zoom: !isMobile,
        zoomOpacity: "auto",
      },
      Toolbar: {
        display: {
          left: ["infobar"],
          middle: isMobile ? [] : [
            "zoomIn", "zoomOut", "toggle1to1",
            "rotateCCW", "rotateCW", "flipX", "flipY"
          ],
          right: ["close"],
        },
      },
    });

    // Очистка при размонтировании или смене группы
    return () => {
      Fancybox.unbind(selector);
    };
  }, [dataFancybox]);
  // ----------------------------------------------------------

  // Переход по ссылке при клике на заголовок, если titleLink задан
  const handleTitleClick = useCallback(() => {
    if (titleLink) {
      router.push(titleLink);
    }
  }, [titleLink, router]);

  // Для отслеживания предыдущего числа visibleItems (чтобы сбрасывать currentIndex только при изменении)
  const prevVisibleItems = useRef(visibleItems);

  // Обработчик ресайза окна: считает сколько элементов показывать и сбрасывает currentIndex только если реально изменилось
  const handleResize = useCallback(() => {
    let newVisibleItems = defaultVisibleItems;
    if (window.innerWidth <= 768) {
      newVisibleItems = mobileVisibleItems;
    } else if (window.innerWidth <= 1023) {
      newVisibleItems = tabletVisibleItems;
    }

    setVisibleItems(prev => {
      if (prev !== newVisibleItems) {
        setCurrentIndex(0); // сбрасываем только если изменилось число видимых
        setTranslateX(0);
      }
      return newVisibleItems;
    });
    prevVisibleItems.current = newVisibleItems;
  }, [defaultVisibleItems, tabletVisibleItems, mobileVisibleItems]);

  // useEffect для подписки на resize и выставления количества элементов при первом рендере
  useEffect(() => {
    handleResize(); // при первом рендере
    window.addEventListener('resize', handleResize); // слушаем resize
    return () => window.removeEventListener('resize', handleResize); // отписываемся при размонтировании
  }, [handleResize]);

  // Можно ли прокрутить влево
  const canGoLeft = useMemo(() => currentIndex > 0, [currentIndex]);
  // Можно ли прокрутить вправо
  const canGoRight = useMemo(
    () => currentIndex < items.length - visibleItems,
    [currentIndex, items.length, visibleItems]
  );

  // Прокрутка назад (влево)
  const goLeft = useCallback(() => {
    if (canGoLeft) setCurrentIndex(prev => prev - 1);
  }, [canGoLeft]);

  // Прокрутка вперёд (вправо)
  const goRight = useCallback(() => {
    if (canGoRight) setCurrentIndex(prev => prev + 1);
  }, [canGoRight]);

  // Вычисляем transform для слайдера (смещение ленты)
  const getTransform = useCallback(() => {
    if (isDragging) {
      // При свайпе добавляем translateX для плавного перетаскивания
      return `translateX(calc(-${currentIndex * (100 / visibleItems + (gapPercent / visibleItems))}% + ${translateX}px))`;
    }
    const itemWidthPercent = 100 / visibleItems;
    const itemWithGap = itemWidthPercent + (gapPercent / visibleItems);
    return `translateX(-${currentIndex * itemWithGap}%)`;
  }, [isDragging, currentIndex, visibleItems, gapPercent, translateX]);

  // sizes для <img> — нужен для правильной загрузки изображений разных размеров
  const getSizes = useCallback(() => {
    switch (visibleItems) {
      case 1: return "100vw";
      case 2: return "(max-width: 768px) 100vw, 50vw";
      case 3: return "(max-width: 768px) 100vw, 33vw";
      default: return "(max-width: 768px) 100vw, (max-width: 1024px) 33vw, 25vw";
    }
  }, [visibleItems]);

  // Свайп: начало тача
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (visibleItems >= items.length) return; // если все элементы видны — свайп не нужен
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  }, [visibleItems, items.length]);

  // Свайп: движение тача
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || visibleItems >= items.length) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  }, [isDragging, visibleItems, items.length, startX]);

  // Свайп: завершение тача
  const handleTouchEnd = useCallback(() => {
    if (!isDragging || visibleItems >= items.length) return;
    setIsDragging(false);
    const threshold = 50; // минимальное смещение для переключения слайда
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
            href={item.image}                  // ссылка на большое изображение
            data-fancybox={dataFancybox}       // группа fancybox
            data-type="image"                  // тип контента (изображение)
            className={styles.fancyboxItem}
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
  ), [items, visibleItems, mobileVisibleItems, mobileItemHeight, itemHeight, getSizes, dataFancybox]);

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
            data-fancybox={dataFancybox}
            data-type="image"
            className={styles.fancyboxItem}
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
  ), [items, dataFancybox]);

  // Основной рендер компонента
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
          // Слайдер с навигацией
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
          // Сетка (grid)
          <div className={styles.gridContainer} style={{ '--grid-columns': gridColumns } as React.CSSProperties}>
            {renderGridItems}
          </div>
        )}
      </div>
    </section>
  );
};

// Мемоизация для оптимизации (предотвращает лишние ререндеры при неизменных пропсах)
export default React.memo(GallerySection);