'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Modal.module.css';

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
  const IMAGE_DRAG_THRESHOLD = 10; // Порог для перетаскивания изображения

  // Эффект для установки начального индекса
  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

  // Обработчик закрытия модального окна
  const handleClose = useCallback(() => {
    setIsClosing(true); // Запускаем анимацию закрытия
    setTimeout(() => {
      onClose(); // Закрываем модальное окно
      setIsClosing(false); // Сбрасываем флаг закрытия
      setScale(1); // Сбрасываем масштаб
      setPosition({ x: 0, y: 0 }); // Сбрасываем позицию
      setImagePosition({ x: 0, y: 0 }); // Сбрасываем позицию изображения
    }, 300); // Задержка для завершения анимации
  }, [onClose]);

  // Обработчик клика по оверлею
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
    if (scale === 1 && canGoPrev) { // Переход только при масштабе 1 и наличии предыдущего изображения
      setSlideDirection('right'); // Устанавливаем направление анимации
      setTimeout(() => {
        setCurrentIndex(prev => prev - 1); // Изменяем индекс
        setSlideDirection(null); // Сбрасываем направление
      }, 300); // Время анимации
      // Сбрасываем все параметры
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoPrev]);

  // Обработчик перехода к следующему изображению
  const handleNext = useCallback(() => {
    if (scale === 1 && canGoNext) { // Переход только при масштабе 1 и наличии следующего изображения
      setSlideDirection('left'); // Устанавливаем направление анимации
      setTimeout(() => {
        setCurrentIndex(prev => prev + 1); // Изменяем индекс
        setSlideDirection(null); // Сбрасываем направление
      }, 300); // Время анимации
      // Сбрасываем все параметры
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoNext]);

  // Эффект для обработки клавиатурных событий
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose(); // Закрытие по Escape
      if (e.key === 'ArrowLeft' && canGoPrev) handlePrev(); // Переход по стрелке влево
      if (e.key === 'ArrowRight' && canGoNext) handleNext(); // Переход по стрелке вправо
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
      window.addEventListener('keydown', handleKeyDown); // Добавляем обработчик
    }
    return () => {
      document.body.style.overflow = 'unset'; // Восстанавливаем скролл
      window.removeEventListener('keydown', handleKeyDown); // Удаляем обработчик
    };
  }, [isOpen, handleClose, canGoPrev, canGoNext, handlePrev, handleNext]);

  // Обработчик начала касания
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
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
  }, [scale, imagePosition]);

  // Обработчик движения при касании
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isZooming.current) { // Обработка зума
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      // Вычисляем текущее расстояние между пальцами
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Вычисляем новый масштаб с ограничениями
      const newScale = Math.max(1, Math.min(3, 
        scale + (currentDistance - touchStartDistance.current) * ZOOM_SENSITIVITY
      ));
      setScale(newScale);
      touchStartDistance.current = currentDistance;
      return;
    }

    if (isDragging.current && e.touches.length === 1) { // Обработка свайпа/перетаскивания
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;

      if (isImageDragging.current) { // Перетаскивание увеличенного изображения
        e.preventDefault();
        const newX = touchStartImagePos.current.x + deltaX;
        const newY = touchStartImagePos.current.y + deltaY;
        setImagePosition({ x: newX, y: newY });
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
  }, [scale]);

  // Обработчик окончания касания
  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isZooming.current) { // Завершение зума
      isZooming.current = false;
      return;
    }
  
    if (isDragging.current) { // Завершение свайпа/перетаскивания
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;
  
      // Сбрасываем флаги
      isDragging.current = false;
      isHorizontalSwipe.current = false;
      isImageDragging.current = false;
  
      if (isImageDragging.current) {
        return;
      }
  
      if (scale === 1) {
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
        
        if (isHorizontal) { // Обработка горизонтального свайпа
          if (deltaX > SWIPE_THRESHOLD && canGoPrev) {
            handlePrev(); // Переход к предыдущему
          } else if (deltaX < -SWIPE_THRESHOLD && canGoNext) {
            handleNext(); // Переход к следующему
          }
        } else if (Math.abs(deltaY) > CLOSE_THRESHOLD) { // Вертикальный свайп для закрытия
          handleClose();
        }
      }
  
      // Сбрасываем позиции
      setPosition({ x: 0, y: 0 });
      setDragOffset(0);
    }
  }, [scale, canGoPrev, canGoNext, handlePrev, handleNext, handleClose]);

  // Функция для получения стилей контента
  const getContentStyle = (): React.CSSProperties => {
    return {
      transform: `translate(${position.x}px, ${position.y + dragOffset}px)`,
      transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 1)'
    };
  };

  // Функция для получения стилей изображения
  const getImageStyle = (): React.CSSProperties => {
    return {
      objectFit: 'contain' as const, // Сохраняем пропорции
      touchAction: scale > 1 ? 'none' : 'pan-y', // Управление touch-событиями
      transform: `scale(${scale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`, // Трансформации
      transformOrigin: 'center center', // Центр трансформации
      transition: isDragging.current || isZooming.current ? 'none' : 'transform 0.2s ease-out', // Анимация
    };
  };

  // Функция для вычисления прозрачности оверлея
  const getOverlayOpacity = () => {
    return 1 - Math.min(Math.abs(dragOffset) / 300, 0.5);
  };

  if (!isOpen) return null; // Не рендерим если модальное окно закрыто

  // Определяем индексы предыдущего и следующего изображений
  const prevIndex = currentIndex > 0 ? currentIndex - 1 : null;
  const nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : null;

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
                transform: slideDirection === 'right' ? 'translateX(100%)' : 'translateX(-100%)',
                opacity: slideDirection === 'right' ? 1 : 0
              }}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={items[prevIndex].image}
                  alt={items[prevIndex].title}
                  width={1200}  // Явно заданные размеры
                  height={800}
                  loading="eager"
                  style={getImageStyle()}
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
                alt={items[currentIndex].title}
                width={1200}  // Явно заданные размеры
                height={800}
                ref={imageRef}
                loading="eager"
                style={getImageStyle()}
              />
            </div>
          </div>

          {/* Следующий слайд (если есть) */}
          {nextIndex !== null && (
            <div 
              className={`${styles.slideItem} ${styles.nextSlide}`}
              style={{
                transform: slideDirection === 'left' ? 'translateX(-100%)' : 'translateX(100%)',
                opacity: slideDirection === 'left' ? 1 : 0
              }}
            >
              <div className={styles.imageContainer}>
                <Image
                  src={items[nextIndex].image}
                  alt={items[nextIndex].title}
                  width={1200}  // Явно заданные размеры
                  height={800}
                  loading="eager"
                  style={getImageStyle()}
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