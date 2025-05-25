'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Modal.module.css';

// Пропсы для компонента Modal
interface ModalProps {
  isOpen: boolean; // Флаг открытия модалки
  onClose: () => void; // Функция закрытия
  children: React.ReactNode; // Дочерние элементы
  onPrev?: () => void; // Функция "предыдущий"
  onNext?: () => void; // Функция "следующий"
  canGoPrev?: boolean; // Доступность кнопки "предыдущий"
  canGoNext?: boolean; // Доступность кнопки "следующий"
  onClick?: (e: React.MouseEvent) => void; // Обработчик клика
}

// Пропсы для изображения
interface ImageElementProps {
  ref?: React.Ref<HTMLImageElement>;
  style?: React.CSSProperties;
}

interface ImageChildProps {
  src?: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  children, 
  onPrev, 
  onNext, 
  canGoPrev = true, 
  canGoNext = true,
  onClick
}) => {
  // Рефы
  const overlayRef = useRef<HTMLDivElement>(null); // Оверлей модалки
  const contentRef = useRef<HTMLDivElement>(null); // Контент модалки
  const imageContainerRef = useRef<HTMLDivElement>(null); // Контейнер изображения
  
  // Состояния
  const [isClosing, setIsClosing] = useState(false); // Флаг анимации закрытия
  const [dragOffset, setDragOffset] = useState(0); // Смещение при перетаскивании
  const [scale, setScale] = useState(1); // Масштаб изображения
  
  // Refs для touch-событий
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  const touchStartX = useRef(0);
  const initialDistance = useRef(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const prevImageSrcRef = useRef<string>('');

  // Эффект для предотвращения скролла страницы при открытой модалке
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
      setDragOffset(0);
      setScale(1);
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Эффект для обработки смены изображения
  useEffect(() => {
    if (!isOpen) return;
    
    if (React.isValidElement(children)) {
      const currentChild = children as React.ReactElement<ImageChildProps>;
      const currentSrc = currentChild.props.src;
      
      if (currentSrc && currentSrc !== prevImageSrcRef.current) {
        setScale(1); // Сброс масштаба при смене изображения
        prevImageSrcRef.current = currentSrc;
      }
    }
  }, [children, isOpen]);

  // Обработчик закрытия модалки с анимацией
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setScale(1);
    }, 300);
  }, [onClose]);

  // Обработчик нажатия Esc
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, handleClose]);

  // Обработчики touch-событий

    // Обработчики навигации
    const handlePrev = useCallback(() => {
      if (scale === 1) { // Навигация только при нормальном масштабе
        onPrev?.();
      }
    }, [onPrev, scale]);
  
    const handleNext = useCallback(() => {
      if (scale === 1) {
        onNext?.();
      }
    }, [onNext, scale]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Обработка масштабирования двумя пальцами
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      initialDistance.current = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      return;
    }
  
    if (scale === 1) {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    }
  };
  
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isOpen) return;
    
    if (e.touches.length === 2) {
      e.preventDefault();
      // Расчет масштаба при pinch-зуме
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const currentDistance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      const newScale = Math.max(1, Math.min(3, currentDistance / initialDistance.current));
      setScale(newScale);
      return;
    }

    if (scale === 1) {
      // Обработка свайпов
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;
      
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        // Горизонтальный свайп
        e.stopPropagation()
      } else if (Math.abs(deltaY) > 10 && contentRef.current?.scrollTop === 0) {
        // Вертикальный свайп для закрытия
        e.stopPropagation()
        setDragOffset(deltaY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;
    
    // Обработка горизонтальных свайпов
    if (scale === 1 && Math.abs(deltaX) > 50) {
      if (deltaX > 0 && canGoPrev) {
        handlePrev();
      } else if (deltaX < 0 && canGoNext) {
        handleNext();
      }
    }
    
    // Обработка вертикальных свайпов
    const absDrag = Math.abs(deltaY);
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = absDrag / deltaTime;
    
    if (absDrag > 100 || velocity > 0.3) {
      handleClose();
    } else {
      setDragOffset(0);
    }
  };

  // Функции для расчета стилей
  const getTransformStyle = () => {
    if (dragOffset === 0) return `translateY(0)`;
    const baseScale = 1 - Math.min(Math.abs(dragOffset) / 1000, 0.1);
    return `translateY(${dragOffset}px) scale(${baseScale})`;
  };

  const getOverlayOpacity = () => {
    return 1 - Math.min(Math.abs(dragOffset) / 300, 0.5);
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className={`${styles.modalOverlay} ${isClosing ? styles.closing : ''}`}
      onClick={onClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        opacity: getOverlayOpacity(),
        transition: dragOffset === 0 ? 'opacity 0.3s ease' : 'none'
      }}
    >
      <div 
        ref={contentRef}
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        style={{
          transform: getTransformStyle(),
          transition: dragOffset === 0 ? 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 1)' : 'none'
        }}
      >
        {/* Кнопка закрытия */}
        <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        
        {/* Кнопки навигации */}
        {onPrev && onNext && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`} 
              onClick={handlePrev}
              disabled={!canGoPrev}
              aria-label="Предыдущее изображение"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`} 
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Следующее изображение"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 6L15 12L9 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </>
        )}
        
        {/* Контейнер изображения с поддержкой масштабирования */}
        <div 
          ref={imageContainerRef}
          className={styles.imageContainer}
        >
          {React.cloneElement(children as React.ReactElement<ImageElementProps>, {
            ref: imgRef,
            style: {
              transform: `scale(${scale})`,
              transformOrigin: 'center center',
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default Modal;