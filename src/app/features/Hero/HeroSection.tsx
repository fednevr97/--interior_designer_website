'use client'

// Импортируем необходимые компоненты и хуки
import React, { useState } from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';

// Интерфейс для пропсов компонента HeroSection
interface HeroSectionProps {
  imageSrc: string;      // Путь к изображению
  imageAlt?: string;     // Альтернативный текст для изображения
  id?: string;          // Опциональный идентификатор секции
  className?: string;   // Опциональные дополнительные классы
}

const HeroSection: React.FC<HeroSectionProps> = ({
  imageSrc,
  imageAlt = 'Главное изображение', // Значение по умолчанию для alt
  id,
  className
}) => {
  // Состояние для отслеживания загрузки изображения
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Для генерации реального blurDataURL используйте getPlaiceholder
  const blurDataURL = 'data:image/svg+xml;base64,...';

  return (
    <section 
      id={id}
      className={`${styles.hero} ${className || ''}`}
      aria-label="Главный баннер"
    >
      <div className={styles.imageContainer}>
        {/* Скелетон для состояния загрузки */}
        {!isLoaded && <div className={styles.skeleton} />}
        
        {/* Основное изображение с оптимизацией */}
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={true}        // Приоритетная загрузка
          quality={85}           // Качество изображения
          className={`${styles.heroImage} ${!isLoaded ? styles.hidden : ''}`}
          sizes="(max-width: 768px) 100vw, 100vw" // Адаптивные размеры
          onLoad={() => setIsLoaded(true)} // Обработчик загрузки
          placeholder="blur"     // Плейсхолдер при загрузке
          blurDataURL={blurDataURL} // Данные для размытия
        />
      </div>
    </section>
  );
};

export default React.memo(HeroSection); // Мемоизация для оптимизации