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
      className={[styles.hero, className].filter(Boolean).join(' ')}
    >
      <div className={styles.imageContainer}>
        {/* Скелетон для состояния загрузки */}
        <div
          className={styles.skeleton}
          style={{ opacity: isLoaded ? 0 : 1, pointerEvents: isLoaded ? 'none' : 'auto' }}
          aria-hidden="true"
        />
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority
          quality={75}
          className={styles.heroImage}
          sizes="(max-width: 768px) 100vw, 100vw"
          onLoad={() => setIsLoaded(true)}
          {...(blurDataURL ? { placeholder: 'blur', blurDataURL } : {})}
        />
      </div>
    </section>
  );
};

export default React.memo(HeroSection); // Мемоизация для оптимизации