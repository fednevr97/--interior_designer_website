'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

interface ImageElementProps {
  ref?: React.Ref<HTMLImageElement>;
  style?: React.CSSProperties;
  onDoubleClick?: () => void;
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
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  // Состояния для масштабирования и перемещения
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTouchCenter, setLastTouchCenter] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }, 300);
  }, [onClose]);

  const handlePrev = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onPrev?.();
  }, [onPrev]);

  const handleNext = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    onNext?.();
  }, [onNext]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
      setDragOffset(0);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Начало жеста масштабирования
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      setLastTouchDistance(distance);
      
      // Вычисляем центр между двумя пальцами
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setLastTouchCenter({ x: centerX, y: centerY });
    } else if (e.touches.length === 1 && scale > 1) {
      // Начало перемещения при зуме
      setIsDragging(true);
    } else if (e.touches.length === 1) {
      // Начало жеста закрытия (свайп вниз)
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && lastTouchDistance > 0) {
      // Обработка жеста масштабирования
      e.preventDefault();
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const distance = Math.hypot(
        touch2.clientX - touch1.clientX,
        touch2.clientY - touch1.clientY
      );
      
      // Вычисляем новый масштаб
      const newScale = Math.max(1, Math.min(3, scale * (distance / lastTouchDistance)));
      setScale(newScale);
      setLastTouchDistance(distance);
      
      // Вычисляем смещение для сохранения центра масштабирования
      const centerX = (touch1.clientX + touch2.clientX) / 2;
      const centerY = (touch1.clientY + touch2.clientY) / 2;
      setPosition(prev => ({
        x: prev.x + (centerX - lastTouchCenter.x),
        y: prev.y + (centerY - lastTouchCenter.y)
      }));
      setLastTouchCenter({ x: centerX, y: centerY });
    } else if (e.touches.length === 1 && isDragging && scale > 1) {
      // Обработка перемещения при зуме
      e.preventDefault();
      const touch = e.touches[0];
      setPosition(prev => ({
        x: prev.x + (touch.clientX - lastTouchCenter.x),
        y: prev.y + (touch.clientY - lastTouchCenter.y)
      }));
      setLastTouchCenter({ x: touch.clientX, y: touch.clientY });
    } else if (e.touches.length === 1 && scale === 1) {
      // Обработка жеста закрытия (свайп вниз)
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;
      
      if (deltaY > 0 && (contentRef.current?.scrollTop === 0 || deltaY > 10)) {
        e.preventDefault();
        setDragOffset(deltaY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setLastTouchDistance(0);
      setIsDragging(false);
    }

    if (!isOpen) return;

    if (scale === 1) {
      const deltaTime = Date.now() - touchStartTime.current;
      const velocity = Math.abs(dragOffset) / deltaTime;
      const shouldClose = Math.abs(dragOffset) > 100 || velocity > 0.3;
      
      if (shouldClose) {
        handleClose();
      } else {
        setDragOffset(0);
      }
    }
  };

  const handleDoubleClick = () => {
    const newScale = scale === 1 ? 2 : 1;
    setScale(newScale);
    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    }
  };

  const getTransformStyle = () => {
    if (dragOffset === 0) return '';
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
        transition: dragOffset === 0 ? 'opacity 0.3s ease' : 'none',
        touchAction: 'none' // Отключаем стандартные жесты браузера
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
        <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
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
        <div className={styles.imageContainer}>
          {React.cloneElement(children as React.ReactElement<ImageElementProps>, {
            ref: imgRef,
            style: {
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transition: 'transform 0.2s ease-out',
              transformOrigin: 'center center',
              touchAction: 'none',
              cursor: scale === 1 ? 'zoom-in' : 'grab'
            },
            onDoubleClick: handleDoubleClick
          })}
        </div>
      </div>
    </div>
  );
};

export default Modal;