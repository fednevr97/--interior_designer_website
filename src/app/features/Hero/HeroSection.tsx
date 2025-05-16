import React from 'react';
import Image from 'next/image';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  imageSrc: string;
  imageAlt?: string;
  id?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  imageSrc,
  imageAlt = 'Главное изображение',
}) => {
  return (
    <section className={styles.hero} aria-label="Главный баннер">
      <div className={styles.imageContainer}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className={styles.heroImage}
          priority
          sizes="100vw"
        />
      </div>
    </section>
  );
};

export default HeroSection;