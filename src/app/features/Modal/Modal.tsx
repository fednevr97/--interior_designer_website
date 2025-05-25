'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Modal.module.css';

// Интерфейс пропсов модального окна
interface ModalProps {
  isOpen: boolean;        // Флаг открытия модального окна
  onClose: () => void;    // Функция закрытия
  items: {                // Массив изображений
    id: number;          // Уникальный идентификатор
    image: string;       // URL изображения
    title: string;       // Заголовок изображения
  }[];
  initialIndex: number;   // Начальный индекс изображения
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  items,
  initialIndex,
}) => {
  // Состояния для управления модальным окном
  const [currentIndex, setCurrentIndex] = useState(initialIndex);  // Текущий индекс изображения
  const [isClosing, setIsClosing] = useState(false);              // Флаг анимации закрытия
  const [scale, setScale] = useState(1);                          // Масштаб изображения
  const [position, setPosition] = useState({ x: 0, y: 0 });       // Позиция для свайпов
  const [dragOffset, setDragOffset] = useState(0);                // Смещение при перетаскивании
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 }); // Позиция изображения при зуме

  // Рефы для DOM-элементов
  const overlayRef = useRef<HTMLDivElement>(null);    // Реф для оверлея
  const contentRef = useRef<HTMLDivElement>(null);    // Реф для контента
  const imageRef = useRef<HTMLImageElement>(null);    // Реф для изображения

  // Рефы для обработки жестов
  const touchStartPos = useRef({ x: 0, y: 0 });       // Начальная позиция касания
  const touchStartDistance = useRef(0);               // Начальное расстояние для зума
  const touchStartTime = useRef(0);                   // Время начала касания
  const touchStartImagePos = useRef({ x: 0, y: 0 });  // Начальная позиция изображения
  const isDragging = useRef(false);                   // Флаг перетаскивания
  const isZooming = useRef(false);                    // Флаг масштабирования
  const isHorizontalSwipe = useRef(false);           // Флаг горизонтального свайпа
  const isImageDragging = useRef(false);             // Флаг перетаскивания изображения

  // Константы для пороговых значений
  const SWIPE_THRESHOLD = 50;              // Порог для определения свайпа
  const CLOSE_THRESHOLD = 100;             // Порог для закрытия
  const ZOOM_SENSITIVITY = 0.01;           // Чувствительность зума
  const IMAGE_DRAG_THRESHOLD = 10;         // Порог для определения перетаскивания

  // Эффект для обновления текущего индекса при изменении начального
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Обработчик закрытия модального окна
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }, 300);
  }, [onClose]);

  // Обработчик клика по оверлею
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  }, [handleClose]);

  // Эффект для обработки клавиатурных событий
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
      if (e.key === 'ArrowLeft' && canGoPrev) handlePrev();
      if (e.key === 'ArrowRight' && canGoNext) handleNext();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleClose, currentIndex, items.length]);

  // Флаги доступности навигации
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < items.length - 1;

  // Обработчик перехода к предыдущему изображению
  const handlePrev = useCallback(() => {
    if (scale === 1 && canGoPrev) {
      setCurrentIndex(prev => prev - 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoPrev]);

  // Обработчик перехода к следующему изображению
  const handleNext = useCallback(() => {
    if (scale === 1 && canGoNext) {
      setCurrentIndex(prev => prev + 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoNext]);

  // Обработчик начала касания
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Инициализация зума
      // Сброс всех флагов при новом касании
      isHorizontalSwipe.current = false;
      isZooming.current = true;
      isDragging.current = false;
      isImageDragging.current = false;
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      touchStartDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      return;
    }

    // Инициализация свайпа/перетаскивания
    isDragging.current = true;
    isImageDragging.current = scale > 1;
    isHorizontalSwipe.current = false;
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
    touchStartImagePos.current = { ...imagePosition };
    touchStartTime.current = Date.now();
  }, [scale, imagePosition]);

  // Обработчик движения при касании
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isZooming.current) {
      // Обработка зума двумя пальцами
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const newScale = Math.max(1, Math.min(3, 
        scale + (currentDistance - touchStartDistance.current) * ZOOM_SENSITIVITY
      ));
      setScale(newScale);
      touchStartDistance.current = currentDistance;
      return;
    }

    if (isDragging.current && e.touches.length === 1) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;

      if (isImageDragging.current) {
        // Перемещение увеличенного изображения
        e.preventDefault();
        const newX = touchStartImagePos.current.x + deltaX;
        const newY = touchStartImagePos.current.y + deltaY;
        setImagePosition({ x: newX, y: newY });
        return;
      }

      // Определение направления свайпа
      if (!isHorizontalSwipe.current && Math.abs(deltaX) > IMAGE_DRAG_THRESHOLD) {
        isHorizontalSwipe.current = true;
      }

      if (scale === 1) {
        if (isHorizontalSwipe.current) {
          // Горизонтальный свайп для навигации
          setPosition({ x: deltaX, y: 0 });
        } else {
          // Вертикальный свайп для закрытия
          setDragOffset(deltaY);
        }
      }
    }
  }, [scale]);

  // Обработчик окончания касания
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isZooming.current) {
      isZooming.current = false;
      return;
    }
  
    if (isDragging.current) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;
  
      // Сброс состояний перед обработкой
      isDragging.current = false;
      isHorizontalSwipe.current = false;
      isImageDragging.current = false;
      
  
      if (isImageDragging.current) {
        // Если было перетаскивание изображения - ничего не делаем
        return;
      }
  
      if (scale === 1) {
        // Определяем основное направление свайпа
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        
        if (isHorizontal) {
          // Обрабатываем только один раз за свайп
          if (deltaX > SWIPE_THRESHOLD && canGoPrev) {
            console.log('Swiping left to right - prev');
            handlePrev();
          } else if (deltaX < -SWIPE_THRESHOLD && canGoNext) {
            console.log('Swiping right to left - next');
            handleNext();
          }
        } else if (Math.abs(deltaY) > CLOSE_THRESHOLD) {
          // Вертикальный свайп для закрытия
          handleClose();
        }
      }
  
      // Сброс позиций
      setPosition({ x: 0, y: 0 });
      setDragOffset(0);
    }
  }, [scale, canGoPrev, canGoNext, handlePrev, handleNext, handleClose]);

  // Функция для получения стилей контента
  const getContentStyle = () => {
    return {
      transform: `translate(${position.x}px, ${position.y + dragOffset}px)`,
      transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 1)'
    };
  };

  // Функция для получения стилей изображения
  const getImageStyle = () => {
    return {
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      touchAction: scale > 1 ? 'none' : 'pan-y'
    };
  };

    // Функция для получения стилей контейнера
  const getContainerStyle = () => {
    return {
      transform: `scale(${scale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
      transformOrigin: 'center center',
      transition: isDragging.current || isZooming.current ? 'none' : 'transform 0.2s ease-out',
    };
  };

  // Функция для получения прозрачности оверлея
  const getOverlayOpacity = () => {
    return 1 - Math.min(Math.abs(dragOffset) / 300, 0.5);
  };

  if (!isOpen) return null;

  // Рендер модального окна
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
      
      {/* Кнопки навигации */}
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

      {/* Контейнер контента */}
      <div 
        ref={contentRef}
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        style={getContentStyle()}
      >
        {/* Контейнер изображения */}
        <div className={styles.imageContainer}
          style={getContainerStyle()}>
          <Image
            src={items[currentIndex].image}
            alt={items[currentIndex].title}
            width={1200}
            height={800}
            ref={imageRef}
            className={styles.modalImage}
            loading="eager"
            style={{
              ...getImageStyle(),
              maxWidth: '100%',
              maxHeight: '100dvh',
              width: 'auto',
              height: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Modal;