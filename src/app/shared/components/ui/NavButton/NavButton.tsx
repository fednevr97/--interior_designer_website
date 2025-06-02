// src/app/shared/components/ui/NavButton/NavButton.tsx
'use client'

import React from 'react';
import { ReactNode } from 'react';
import styles from './NavButton.module.css';

// Интерфейс пропсов компонента
interface NavButtonProps {
  children?: ReactNode;          // Дочерние элементы
  onClick?: () => void;          // Обработчик клика
  className?: string;            // Дополнительные CSS классы
  ariaLabel?: string;            // Текст для доступности
  variant?: 'arrow-left' | 'arrow-right';  // Вариант кнопки (стрелка влево/вправо)
  disabled?: boolean;            // Состояние отключения кнопки
}

// Мемоизированный компонент кнопки навигации
const NavButton = React.memo(({ 
  children, 
  onClick, 
  className = '', 
  ariaLabel = 'Navigation button',
  variant,
  disabled = false 
}: NavButtonProps) => {
  // Мемоизируем функцию определения класса
  const getVariantClass = React.useCallback(() => {
    if (variant === 'arrow-left') return styles['nav-btn-prev'];
    if (variant === 'arrow-right') return styles['nav-btn-next'];
    return '';
  }, [variant]);

  // Мемоизируем функцию определения содержимого
  const getDefaultContent = React.useCallback(() => {
    // SVG для стрелки влево
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
    // SVG для стрелки вправо
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
    // Возвращаем дочерние элементы, если вариант не указан
    return children;
  }, [variant, children]);

  // Мемоизируем классы кнопки
  const buttonClassName = React.useMemo(() => 
    `${styles['nav-btn']} ${getVariantClass()} ${className}`,
    [getVariantClass, className]
  );

  // Рендер кнопки
  return (
    <button
      className={buttonClassName}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {getDefaultContent()}
    </button>
  );
}, (prevProps, nextProps) => {
  // Кастомная функция сравнения для оптимизации ререндеров
  return (
    prevProps.variant === nextProps.variant &&
    prevProps.className === nextProps.className &&
    prevProps.ariaLabel === nextProps.ariaLabel &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onClick === nextProps.onClick &&
    prevProps.children === nextProps.children
  );
});

// Добавляем displayName для удобства отладки
NavButton.displayName = 'NavButton';

export default NavButton;