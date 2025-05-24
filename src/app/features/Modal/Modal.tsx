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
  const imageRef = useRef<HTMLDivElement>(null); // Для работы с изображением
  const [isClosing, setIsClosing] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);
  const touchStartY = useRef(0);
  const touchStartTime = useRef(0);

  // Для масштабирования
  const [scale, setScale] = useState(1);
  const [lastDistance, setLastDistance] = useState(0);
  const [centerPoint, setCenterPoint] = useState({ x: 0, y: 0 });

  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      setScale(1); // Reset scale when closing
    }, 300);
  }, [onClose]);

  // Reset scale when navigating between images
  const handlePrev = useCallback(() => {
    setScale(1);
    onPrev?.();
  }, [onPrev]);

  const handleNext = useCallback(() => {
    setScale(1);
    onNext?.();
  }, [onNext]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setIsClosing(false);
      setDragOffset(0);
      setScale(1); // Reset scale when opening
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
      // Calculate center point between two fingers
      const centerX = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      const centerY = (e.touches[0].clientY + e.touches[1].clientY) / 2;
      
      // Get position relative to the image container
      const rect = imageRef.current?.getBoundingClientRect();
      if (rect) {
        setCenterPoint({
          x: (centerX - rect.left - rect.width / 2) / scale,
          y: (centerY - rect.top - rect.height / 2) / scale
        });
      }

      // Начинаем отслеживать расстояние между двумя пальцами
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      setLastDistance(distance);
    } else if (e.touches.length === 1) {
      touchStartY.current = e.touches[0].clientY;
      touchStartTime.current = Date.now();
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      // Обрабатываем жест "пинч"
      const distance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );

      if (lastDistance) {
        const scaleChange = distance / lastDistance;
        setScale((prevScale) => Math.min(Math.max(prevScale * scaleChange, 1), 3)); // Ограничиваем масштаб от 1 до 3
      }

      setLastDistance(distance);
    } else if (e.touches.length === 1) {
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - touchStartY.current;

      if (deltaY > 0 && (contentRef.current?.scrollTop === 0 || deltaY > 10)) {
        e.preventDefault();
        setDragOffset(deltaY);
      } else if (
        deltaY < 0 &&
        contentRef.current &&
        contentRef.current.scrollHeight - contentRef.current.scrollTop <=
          contentRef.current.clientHeight + 10
      ) {
        e.preventDefault();
        setDragOffset(deltaY);
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setLastDistance(0);
    }

    if (!isOpen) return;

    const deltaTime = Date.now() - touchStartTime.current;
    const velocity = Math.abs(dragOffset) / deltaTime;
    const shouldClose = Math.abs(dragOffset) > 100 || velocity > 0.3;

    if (shouldClose) {
      handleClose();
    } else {
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
        transition: dragOffset === 0 ? 'opacity 0.3s ease' : 'none',
      }}
    >
      <div
        ref={contentRef}
        className={styles.modalContent}
        onClick={(e) => e.stopPropagation()}
        style={{
          transform: getTransformStyle(),
          transition:
            dragOffset === 0
              ? 'transform 0.3s cubic-bezier(0.17, 0.67, 0.24, 1)'
              : 'none',
        }}
      >
        <button
          className={styles.closeButton}
          onClick={handleClose}
          aria-label="Закрыть"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15 18L9 12L15 6"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              className={`${styles.navButton} ${styles.nextButton}`}
              onClick={handleNext}
              disabled={!canGoNext}
              aria-label="Следующее изображение"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </>
        )}
        <div
          ref={imageRef}
          className={styles.imageContainer}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: `${centerPoint.x * scale + 50}% ${centerPoint.y * scale + 50}%`,
            transition: 'transform 0.2s ease-out',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;