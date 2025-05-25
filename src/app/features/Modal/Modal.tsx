'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: {
    id: number;
    image: string;
    title: string;
  }[];
  initialIndex: number;
}

const Modal: React.FC<ModalProps> = ({ 
  isOpen, 
  onClose, 
  items,
  initialIndex,
}) => {
  // Состояния компонента
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isClosing, setIsClosing] = useState(false);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState(0);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  // Рефы для DOM-элементов
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Рефы для обработки жестов
  const touchStartPos = useRef({ x: 0, y: 0 });
  const touchStartDistance = useRef(0);
  const touchStartTime = useRef(0);
  const touchStartImagePos = useRef({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const isZooming = useRef(false);
  const isHorizontalSwipe = useRef(false);
  const isImageDragging = useRef(false);

  // Пороговые значения
  const SWIPE_THRESHOLD = 50;
  const SWIPE_VELOCITY_THRESHOLD = 0.3;
  const CLOSE_THRESHOLD = 100;
  const ZOOM_SENSITIVITY = 0.01;
  const IMAGE_DRAG_THRESHOLD = 10;

  useEffect(() => {
    setCurrentIndex(initialIndex);
  }, [initialIndex]);

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

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      handleClose();
    }
  }, [handleClose]);

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

  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex < items.length - 1;

  const handlePrev = useCallback(() => {
    if (scale === 1 && canGoPrev) {
      setCurrentIndex(prev => prev - 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoPrev]);

  const handleNext = useCallback(() => {
    if (scale === 1 && canGoNext) {
      setCurrentIndex(prev => prev + 1);
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setImagePosition({ x: 0, y: 0 });
    }
  }, [scale, canGoNext]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Начало зума
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

    // Начало драга/свайпа
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

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2 && isZooming.current) {
      // Обработка зума
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

      // Определяем направление свайпа после превышения порога
      if (!isHorizontalSwipe.current && Math.abs(deltaX) > IMAGE_DRAG_THRESHOLD) {
        isHorizontalSwipe.current = true;
      }

      if (scale === 1) {
        if (isHorizontalSwipe.current) {
          // Горизонтальный свайп - навигация
          // e.preventDefault();
          setPosition({ x: deltaX, y: 0 });
        } else {
          // Вертикальный свайп - закрытие (вверх или вниз)
          setDragOffset(deltaY);
        }
      }
    }
  }, [scale]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (isZooming.current) {
      isZooming.current = false;
      return;
    }

    if (isDragging.current) {
      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartPos.current.x;
      const deltaY = touch.clientY - touchStartPos.current.y;
      const deltaTime = Date.now() - touchStartTime.current;
      const velocity = Math.abs(deltaX) / deltaTime;

      // Проверяем, был ли это быстрый свайп
      const isFastSwipe = velocity > SWIPE_VELOCITY_THRESHOLD;

      if (isImageDragging.current) {
        // После перемещения изображения просто сбрасываем флаги
        isImageDragging.current = false;
      } 
      else if (scale === 1) {
        // Горизонтальный свайп - навигация
        if (isHorizontalSwipe.current || isFastSwipe) {
          if ((deltaX > SWIPE_THRESHOLD || isFastSwipe) && canGoPrev) {
            handlePrev();
          } else if ((deltaX < -SWIPE_THRESHOLD || isFastSwipe) && canGoNext) {
            handleNext();
          }
        }
        // Вертикальный свайп - закрытие (вверх или вниз)
        else if (Math.abs(deltaY) > CLOSE_THRESHOLD) {
          handleClose();
        }
      }

      // Сброс состояний
      setPosition({ x: 0, y: 0 });
      setDragOffset(0);
      isDragging.current = false;
      isHorizontalSwipe.current = false;
    }
  }, [scale, canGoPrev, canGoNext, handlePrev, handleNext, handleClose]);

  const getContentStyle = () => {
    return {
      transform: `translate(${position.x}px, ${position.y + dragOffset}px)`,
      transition: isDragging.current ? 'none' : 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 1)'
    };
  };

  const getImageStyle = () => {
    return {
      transform: `scale(${scale}) translate(${imagePosition.x}px, ${imagePosition.y}px)`,
      transformOrigin: 'center center',
      transition: isDragging.current || isZooming.current ? 'none' : 'transform 0.2s ease-out',
      touchAction: scale > 1 ? 'none' : 'pan-y'
    };
  };

  const getOverlayOpacity = () => {
    return 1 - Math.min(Math.abs(dragOffset) / 300, 0.5);
  };

  if (!isOpen) return null;

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
      <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2"/>
        </svg>
      </button>
      
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

      <div 
        ref={contentRef}
        className={styles.modalContent}
        onClick={e => e.stopPropagation()}
        style={getContentStyle()}
      >
        <div className={styles.imageContainer}>
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