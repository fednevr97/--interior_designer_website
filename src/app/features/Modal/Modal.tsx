'use client'

// Импортируем необходимые компоненты и хуки
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Modal.module.css';
import { GalleryItem } from '../Gallery/GallerySection';

// Интерфейс пропсов для модального окна
interface ModalProps {
  isOpen: boolean;         // Флаг открытия модального окна
  onClose: () => void;     // Функция закрытия модального окна
  items: {                // Массив элементов для отображения
    id: number;          // Уникальный идентификатор
    image: string;       // URL изображения
    title: string;       // Заголовок изображения
  }[];
  initialIndex: number;   // Начальный индекс отображаемого элемента
}

// В начале файла добавим интерфейс для Image
interface ImageConstructor {
  new(): HTMLImageElement;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  items,
  initialIndex,
}) => {
  // Состояния компонента
  const [currentIndex, setCurrentIndex] = useState(initialIndex); // Текущий индекс
  const [isClosing, setIsClosing] = useState(false); // Флаг анимации закрытия
  const [scale, setScale] = useState(1); // Масштаб изображения
  const [position, setPosition] = useState({ x: 0, y: 0 }); // Позиция для свайпа
  const [dragOffset, setDragOffset] = useState(0); // Смещение при перетаскивании
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 }); // Позиция изображения
  const [slideDirection, setSlideDirection] = useState<'left'|'right'|null>(null); // Направление слайда
  const [isAnimating, setIsAnimating] = useState(false); // Флаг анимации

  // Рефы для DOM-элементов
  const overlayRef = useRef<HTMLDivElement>(null); // Оверлей модального окна
  const contentRef = useRef<HTMLDivElement>(null); // Контент модального окна
  const imageRef = useRef<HTMLImageElement>(null); // Изображение

  // Рефы для обработки жестов
  const touchStartPos = useRef({ x: 0, y: 0 }); // Начальная позиция касания
  const touchStartDistance = useRef(0); // Начальное расстояние между пальцами
  const touchStartTime = useRef(0); // Время начала касания
  const touchStartImagePos = useRef({ x: 0, y: 0 }); // Начальная позиция изображения
  const isDragging = useRef(false); // Флаг перетаскивания
  const isZooming = useRef(false); // Флаг масштабирования
  const isHorizontalSwipe = useRef(false); // Флаг горизонтального свайпа
  const isImageDragging = useRef(false); // Флаг перетаскивания изображения

  // Константы для обработки жестов
  const SWIPE_THRESHOLD = 50; // Порог для определения свайпа
  const CLOSE_THRESHOLD = 100; // Порог для закрытия модального окна
  const ZOOM_SENSITIVITY = 0.01; // Чувствительность зума
  const IMAGE_DRAG_THRESHOLD = 20; // Порог для перетаскивания изображения

  // Обработчик окончания касания
  const [lastTap, setLastTap] = useState<{ time: number; x: number; y: number } | null>(null);
  const doubleTapTimeout = useRef<NodeJS.Timeout | null>(null);

  // Вынесем preloadImages за пределы условных операторов
  const preloadImages = useCallback((items: GalleryItem[], currentIndex: number) => {
    // Предзагрузка предыдущего и следующего изображения
    const prevIndex = currentIndex - 1;
    const nextIndex = currentIndex + 1;
      
    if (prevIndex >= 0) {
      const img = new (window.Image as ImageConstructor)();
      img.src = items[prevIndex].image;
    }
      
    if (nextIndex < items.length) {
      const img = new (window.Image as ImageConstructor)();
      img.src = items[nextIndex].image;
    }
  }, []);
  
  // Вынесем useEffect за пределы условных операторов
  useEffect(() => {
    let isSubscribed = true;
    
    if (isOpen && isSubscribed) {
      preloadImages(items, currentIndex);
    }
    
    return () => {
      isSubscribed = false;
    };
  }, [isOpen, currentIndex, items, preloadImages]);

  // Эффект для установки начального индекса при изменении initialIndex
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex);
    }
  }, [isOpen, initialIndex]);

  // Обработчик двойного клика для зума на десктопе
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (scale === 1) {
      // Увеличиваем если текущий масштаб 1
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      setScale(2);
      setImagePosition({
        x: (rect.width/2 - x) * 0.5,
        y: (rect.height/2 - y) * 0.5
      });
    } else {
      // Сбрасываем если увеличен
      setScale(1);
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale]);

  // Обработчик закрытия модального окна с анимацией
  // const handleClose = useCallback(() => {
  //   setIsClosing(true); // Запускаем анимацию закрытия
  //   setDragOffset(0); // Сбрасываем перед закрытием
  //   setTimeout(() => {
  //     onClose(); // Закрываем модальное окно
  //     setIsClosing(false); // Сбрасываем флаг закрытия
  //     setScale(1); // Сбрасываем масштаб
  //     setPosition({ x: 0, y: 0 }); // Сбрасываем позицию
  //     setImagePosition({ x: 0, y: 0 }); // Сбрасываем позицию изображения
  //   }, 300); // Задержка для завершения анимации
  // }, [onClose]);
  const handleClose = useCallback(() => {
    if (isClosing) return; // Предотвращаем множественные вызовы
    setIsClosing(true);
    setDragOffset(0);
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setImagePosition({ x: 0, y: 0 });
    setSlideDirection(null);
    setIsAnimating(false);
    
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      
      // Дополнительный сброс на случай "залипания"
      requestAnimationFrame(() => {
        setDragOffset(0);
        setPosition({ x: 0, y: 0 });
      });
    }, 300);
  }, [onClose, isClosing]);

  // Обработчик клика по оверлею для закрытия
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose(); // Закрываем модальное окно при клике на оверлей
    }
  }, [handleClose]);

  // Проверка возможности перехода к предыдущему/следующему изображению
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < items.length - 1;

  // Обработчик перехода к предыдущему изображению
  const handlePrev = useCallback(() => {
    if (scale === 1 && canGoPrev && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection('right');
    
      // Сначала меняем индекс
      setCurrentIndex(prev => prev - 1);
    
      // Затем запускаем анимацию
      setTimeout(() => {
        setSlideDirection(null);
        setIsAnimating(false);
      }, 300);

      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoPrev, isAnimating]);

  // Обработчик перехода к следующему изображению
  const handleNext = useCallback(() => {
    if (scale === 1 && canGoNext && !isAnimating) {
      setIsAnimating(true);
      setSlideDirection('left');
      
      // Сначала меняем индекс
      setCurrentIndex(prev => prev + 1);
      
      // Затем запускаем анимацию
      setTimeout(() => {
        setSlideDirection(null);
        setIsAnimating(false);
      }, 300);
  
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoNext, isAnimating]);

  // Эффект для обработки клавиатурных событий
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose(); // Закрытие по Escape
      if (e.key === 'ArrowLeft' && canGoPrev) handlePrev(); // Переход по стрелке влево
      if (e.key === 'ArrowRight' && canGoNext) handleNext(); // Переход по стрелке вправо
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // document.body.style.position = 'fixed'; // Для iOS
      document.body.style.width = '100%';// Блокируем скролл страницы
      window.addEventListener('keydown', handleKeyDown); // Добавляем обработчик
    }
    return () => {
      document.body.style.overflow = '';
      // document.body.style.position = '';
      document.body.style.width = ''; // Восстанавливаем скролл
      window.removeEventListener('keydown', handleKeyDown); // Удаляем обработчик
    };
  }, [isOpen, handleClose, canGoPrev, canGoNext, handlePrev, handleNext]);

  // Обработчик начала касания
  const handleTouchStart = useCallback((e: React.TouchEvent) => {

    if (isClosing) return; // Игнорируем если закрываемся

    if (e.touches.length === 2) { // Обработка мультитача (зум)
      isHorizontalSwipe.current = false;
      isZooming.current = true;
      isDragging.current = false;
      isImageDragging.current = false;
      // Вычисляем расстояние между пальцами
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      return;
    }

    // Обработка одинарного касания (свайп/перетаскивание)
    isDragging.current = true;
    isImageDragging.current = scale > 1; // Перетаскивание только при увеличении
    isHorizontalSwipe.current = false;
    // Запоминаем начальную позицию
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    touchStartImagePos.current = { ...imagePosition };
    touchStartTime.current = Date.now();
  }, [scale, imagePosition, isClosing]);

  // Функция ограничения позиции изображения
  const constrainImagePosition = useCallback((newPos: { x: number; y: number }, currentScale: number) => {
    if (!imageRef.current || !contentRef.current) return newPos;

    const container = contentRef.current;
    const containerRect = container.getBoundingClientRect();
    const img = imageRef.current;
    
    // Используем offsetWidth/offsetHeight вместо naturalWidth/naturalHeight
    const imgWidth = img.offsetWidth * currentScale;
    const imgHeight = img.offsetHeight * currentScale;
    
    // Рассчитываем максимальные смещения
    const maxX = Math.max(0, (imgWidth - containerRect.width) / 2);
    const maxY = Math.max(0, (imgHeight - containerRect.height) / 2);

    return {
      x: Math.max(-maxX, Math.min(maxX, newPos.x)),
      y: Math.max(-maxY, Math.min(maxY, newPos.y))
    };
  }, []);

  // Обработчик движения при касании
  const handleTouchMove = useCallback((e: React.TouchEvent) => {

    if (e.touches.length === 2 && isZooming.current) {
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const newScale = Math.max(1, Math.min(5, 
        scale + (currentDistance - touchStartDistance.current) * ZOOM_SENSITIVITY
      ));
      
      // Применяем ограничения сразу при изменении масштаба
      const constrainedPos = constrainImagePosition(imagePosition, newScale);
      setImagePosition(constrainedPos);
      setScale(newScale);
      touchStartDistance.current = currentDistance;
      return;
    }

    if (isDragging.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;

      if (isImageDragging.current && scale > 1) {
        const newPos = {
          x: touchStartImagePos.current.x + deltaX,
          y: touchStartImagePos.current.y + deltaY
        };
        
        // Применяем ограничения при перемещении
        const constrainedPos = constrainImagePosition(newPos, scale);
        setImagePosition(constrainedPos);
        return;
      }

      // Определяем направление свайпа
      if (!isHorizontalSwipe.current && Math.abs(deltaX) > IMAGE_DRAG_THRESHOLD) {
        isHorizontalSwipe.current = true;
      }

      if (scale === 1) { // Обработка только при масштабе 1
        if (isHorizontalSwipe.current) { // Горизонтальный свайп
          setPosition({ x: deltaX, y: 0 });
        } else { // Вертикальный свайп
          setDragOffset(deltaY);
        }
      }
    }
  }, [scale, imagePosition, constrainImagePosition]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isClosing) return; // Добавьте эту строку

        // Очищаем таймаут двойного тапа
    if (doubleTapTimeout.current) {
      clearTimeout(doubleTapTimeout.current);
      doubleTapTimeout.current = null;
    }

    if (isZooming.current) {
      isZooming.current = false;
      return;
    }
  
    // Обработка свайпов и перетаскивания
    if (isDragging.current) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;
      const velocity = Math.abs(deltaY) / (Date.now() - touchStartTime.current);
  
      isDragging.current = false;
      isHorizontalSwipe.current = false;
      isImageDragging.current = false;

          // Быстрый свайп вверх (даже если не достигнут порог, но высокая скорость)
    if ((Math.abs(deltaY) > CLOSE_THRESHOLD || velocity > 0.5)) {
      if (deltaY < 0) { // Свайп вверх
        handleClose();
        return;
      }
    }
  
      if (scale === 1) {
        if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
          if (deltaX > 0 && canGoPrev) handlePrev();
          if (deltaX < 0 && canGoNext) handleNext();
        } else if (Math.abs(deltaY) > CLOSE_THRESHOLD) {
          handleClose();
        }else {
          // Добавляем анимацию возврата, если свайп недостаточный
          setPosition({ x: 0, y: 0 });
          setDragOffset(0);
        }
      }

          // Быстрый свайп вниз (даже если не достигнут порог, но высокая скорость)
    if ((Math.abs(deltaY) > CLOSE_THRESHOLD || velocity > 0.5)) {
      if (deltaY > 0) { // Свайп вниз
        handleClose();
        return;
      }
    }

    if (scale === 1) {
      if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0 && canGoPrev) handlePrev();
        if (deltaX < 0 && canGoNext) handleNext();
      } else {
        // Плавно возвращаем в исходное положение
        setPosition({ x: 0, y: 0 });
        setDragOffset(0);
      }
    }
    
      
      setPosition({ x: 0, y: 0 });
      return;
    }
  
    // Обработка двойного тапа
    const currentTouch = e.changedTouches[0];
    const currentTime = Date.now();
    const tapPosition = { 
      x: currentTouch.clientX, 
      y: currentTouch.clientY 
    };
  
    if (lastTap && doubleTapTimeout.current) {
      // Проверяем был ли предыдущий тап недавно и близко по позиции
      const isDoubleTap = (
        currentTime - lastTap.time < 300 &&
        Math.abs(tapPosition.x - lastTap.x) < 30 &&
        Math.abs(tapPosition.y - lastTap.y) < 30
      );
  
      if (isDoubleTap) {
        clearTimeout(doubleTapTimeout.current);
        doubleTapTimeout.current = null;
        
        const rect = contentRef.current?.getBoundingClientRect();
        if (rect) {
          const x = tapPosition.x - rect.left;
          const y = tapPosition.y - rect.top;
          
          if (scale === 1) {
            // Увеличиваем
            setScale(2);
            setImagePosition({
              x: (rect.width/2 - x) * 0.5,
              y: (rect.height/2 - y) * 0.5
            });
          } else {
            // Уменьшаем
            setScale(1);
            setImagePosition({ x: 0, y: 0 });
          }
        }
        setLastTap(null);
        return;
      }
    }
  
    // Запоминаем текущий тап
    setLastTap({
      time: currentTime,
      ...tapPosition
    });
  
    // Устанавливаем таймаут для сброса двойного тапа
    doubleTapTimeout.current = setTimeout(() => {
      setLastTap(null);
      doubleTapTimeout.current = null;
    }, 300);
  }, [scale, canGoPrev, canGoNext, handlePrev, handleNext, handleClose, lastTap, isClosing]);


useEffect(() => {
  let isMounted = true;
  
  const preload = () => {
    if (isMounted && isOpen) {
      preloadImages(items, currentIndex);
    }
  };
  
  preload();
  
  return () => {
    isMounted = false;
  };
}, [isOpen, currentIndex, items, preloadImages]);
  
  // Очистка таймеров при размонтировании
  useEffect(() => {
    const timeout = doubleTapTimeout.current;
    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, []);

  // Функция для получения стилей контента
  const getContentStyle = (): React.CSSProperties => {
    return {
      transform: `translate(${position.x}px, ${position.y + dragOffset}px)`,
      transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 1)'
    };
  };

  // Функция для получения стилей изображения
  const getImageStyle = (): React.CSSProperties => {
    // Применяем ограничения перед рендерингом
    const constrainedPos = scale > 1 ? constrainImagePosition(imagePosition, scale) : { x: 0, y: 0 };
    
    return {
      objectFit: 'contain',
      touchAction: scale > 1 ? 'none' : 'pan-y',
      transform: `scale(${scale}) translate(${constrainedPos.x}px, ${constrainedPos.y}px)`,
      transformOrigin: 'center center',
      transition: isDragging.current || isZooming.current ? 'none' : 'transform 0.2s ease-out',
      height:'100%',
      width:'100%'
    };
  };

  // Функция для вычисления прозрачности оверлея
  const getOverlayOpacity = () => {
    return 1 - Math.min(Math.abs(dragOffset) / 300, 0.5);
  };

  // Не рендерим если модальное окно закрыто
  if (!isOpen) return null;

  // Определяем индексы предыдущего и следующего изображений
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
  const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : null;



  // Рендерим модальное окно
  return (
    <div 
      ref={overlayRef}
      className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={handleOverlayClick}
      style={{
        opacity: getOverlayOpacity(),
        transition: dragOffset === 0 ? 'opacity 0.3s ease' : 'none',
        touchAction: 'none'
      }}
    >
      {/* Кнопка закрытия */}
      <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2"/>
        </svg>
      </button>
      
      {/* Кнопки навигации (если есть несколько изображений) */}
      {items.length > 1 && (
        <>
          <button 
            className={`${styles.navButton} ${styles.prevButton}`} 
            onClick={handlePrev}
            disabled={!canGoPrev}
            aria-label="Предыдущее изображение"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2"/>
            </svg>
          </button>
          <button 
            className={`${styles.navButton} ${styles.nextButton}`} 
            onClick={handleNext}
            disabled={!canGoNext}
            aria-label="Следующее изображение"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2"/>
            </svg>
          </button>
        </>
      )}

      {/* Основной контент модального окна */}
      <div 
        ref={contentRef}
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        style={getContentStyle()}
      >
        {/* Контейнер слайдера */}
        <div className={styles.sliderContainer}>
          {/* Предыдущий слайд (если есть) */}
          {prevIndex !== null && (
            <div 
              className={`${styles.slideItem} ${styles.prevSlide}`}
              style={{
                transform: slideDirection === 'right' ? 'translateX(500%)' : 'translateX(-500%)',
                opacity: slideDirection === 'right' ? 1 : 0
              }}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={items[prevIndex].image}
                  alt="Фото галереи" 
                  width={1200}
                  height={800}
                  loading="lazy"
                  style={getImageStyle()}
                  quality={75} // Оптимизация качества (по умолчанию 75)
                />
              </div>
            </div>
          )}

          {/* Текущий слайд */}
          <div 
            className={`${styles.slideItem} ${styles.currentSlide} ${
              slideDirection === 'left' ? styles.slideLeft : 
              slideDirection === 'right' ? styles.slideRight : ''
            }`}
          >
            <div className={styles.imageContainer}>
              <Image
                src={items[currentIndex].image}
                alt="Фото галереи" 
                width={1200}
                height={800}
                ref={imageRef}
                loading="lazy"
                style={getImageStyle()}
                onDoubleClick={handleDoubleClick}
                quality={75} // Оптимизация качества (по умолчанию 75)
              />
            </div>
          </div>

          {/* Следующий слайд (если есть) */}
          {nextIndex !== null && (
            <div 
              className={`${styles.slideItem} ${styles.nextSlide}`}
              style={{
                transform: slideDirection === 'left' ? 'translateX(-500%)' : 'translateX(500%)',
                opacity: slideDirection === 'left' ? 1 : 0
              }}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={items[nextIndex].image}
                  alt="Фото галереи" 
                  width={1200}
                  height={800}
                  loading="lazy"
                  style={getImageStyle()}
                  quality={75} // Оптимизация качества (по умолчанию 75)
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;