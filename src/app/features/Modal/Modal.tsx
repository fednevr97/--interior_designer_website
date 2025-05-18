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
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);
  
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  }, [onClose]); // Стабилизированная версия

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
      setDragOffset(0);
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
  }, [isOpen, handleClose]); // Все зависимости на месте

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchStartTime.current = Date.now();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isOpen) 
      return;
    
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    
    // Если свайп вниз и контент вверху
    if (deltaY > 0 && (contentRef.current?.scrollTop === 0 || deltaY > 10)) {
      e.preventDefault();
      setDragOffset(deltaY);
    }
    // Если свайп вверх и контент внизу
    else if (deltaY < 0 && (contentRef.current && 
           contentRef.current.scrollHeight - contentRef.current.scrollTop <= 
           contentRef.current.clientHeight + 10)) {
      e.preventDefault();
      setDragOffset(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isOpen) return;
    
    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dragOffset) / deltaTime;
    const shouldClose = Math.abs(dragOffset) > 100 || velocity > 0.3;
    
    if (shouldClose) {
      handleClose();
    } else {
      // Анимация возврата
      setDragOffset(0);
    }
  };

  const getTransformStyle = () => {
    if (dragOffset === 0) return '';
    const scale = 1 - Math.min(Math.abs(dragOffset) / 1000, 0.1);
    return `translateY(${dragOffset}px) scale(${scale})`;
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
        <button className={styles.closeButton} onClick={handleClose} aria-label="Закрыть">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {onPrev && onNext && (
          <>
            <button 
              className={`${styles.navButton} ${styles.prevButton}`} 
              onClick={onPrev}
              disabled={!canGoPrev}
              aria-label="Предыдущее изображение"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              className={`${styles.navButton} ${styles.nextButton}`} 
              onClick={onNext}
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
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;