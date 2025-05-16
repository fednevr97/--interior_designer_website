import React from 'react';
import styles from './CtaButton.module.css'; // Предполагается, что стили вынесены в отдельный файл

interface CtaButtonProps {
  /**
   * Текст на кнопке
   */
  text?: string;
  /**
   * ARIA-лейбл для доступности
   */
  ariaLabel?: string;
  /**
   * Дополнительные классы стилей
   */
  className?: string;
  /**
   * Обработчик клика
   */
  onClick?: () => void;
}

const CtaButton: React.FC<CtaButtonProps> = ({
  text = 'оставить заявку',
  ariaLabel = 'Оставить заявку',
  className = '',
  onClick,
}) => {
  return (
    <button
      className={`${styles.ctaButton} ${className}`}
      aria-label={ariaLabel}
      onClick={onClick}
    >
      {text}
    </button>
  );
};

export default CtaButton;