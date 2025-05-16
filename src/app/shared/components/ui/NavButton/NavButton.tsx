import React from 'react';
import { ReactNode } from 'react';
import styles from './NavButton.module.css';

interface NavButtonProps {
  children?: ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
  variant?: 'arrow-left' | 'arrow-right';
  disabled?: boolean; // Добавляем свойство disabled
}

const NavButton: React.FC<NavButtonProps> = ({ 
  children, 
  onClick, 
  className = '', 
  ariaLabel = 'Navigation button',
  variant,
  disabled = false // Добавляем значение по умолчанию
}) => {
  const getVariantClass = () => {
    if (variant === 'arrow-left') return styles['nav-btn-prev'];
    if (variant === 'arrow-right') return styles['nav-btn-next'];
    return '';
  };

  const getDefaultContent = () => {
    if (variant === 'arrow-left') {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <path
            d="M15 18L9 12L15 6"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    if (variant === 'arrow-right') {
      return (
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true">
          <path
            d="M9 6L15 12L9 18"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return children;
  };

  return (
    <button
      className={`${styles['nav-btn']} ${getVariantClass()} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {getDefaultContent()}
    </button>
  );
};

export default NavButton;