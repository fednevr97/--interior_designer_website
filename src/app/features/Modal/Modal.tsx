'use client'

import React, { useEffect, useRef } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  onPrev?: () => void;
  onNext?: () => void;
  canGoPrev?: boolean;
  canGoNext?: boolean;
  onClick?: (e: React.MouseEvent) => void; // Добавлено свойство onClick
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
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
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
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClick}>
       <div 
        className={styles.modalContent} 
        onClick={e => e.stopPropagation()}
        ref={contentRef}
      >
          <button className={styles.closeButton} onClick={onClose} aria-label="Закрыть">
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