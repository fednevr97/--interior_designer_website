'use client'

import React, { useState } from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  imageSrc: string;
  imageAlt?: string;
  id?: string;
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  imageSrc,
  imageAlt = 'Главное изображение',
  id,
  className
}) => {
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
        {!isLoaded && <div className={styles.skeleton} />}
        
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          priority={true}
          quality={85}
          className={`${styles.heroImage} ${!isLoaded ? styles.hidden : ''}`}
          sizes="(max-width: 768px) 100vw, 100vw"
          onLoad={() => setIsLoaded(true)}
          placeholder="blur"
          blurDataURL={blurDataURL}
        />
      </div>
    </section>
  );
};

export default React.memo(HeroSection);