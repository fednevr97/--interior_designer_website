// AboutSection.tsx
'use client'

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './AboutSection.module.css';

// Интерфейс для пропсов компонента
interface AboutSectionProps {
  id?: string;
  className?: string;
}

// Текст для секции "О нас"
const ABOUT_TEXT = [
  "Приветствую Вас на моем сайте!",
  `Меня зовут Дарья. Я - дизайнер интерьера, который верит, что каждый проект — это не просто работа, а творческое путешествие, где Ваши мечты становятся реальностью. С каждым новым проектом я стремлюсь создать пространство, которое отражает индивидуальность и стиль своих владельцев.`,
  `Мой подход включает:
  • Профессионализм. Я обладаю многолетним опытом и регулярно обновляю свои знания.
  • Ответственность. Каждое решение принимается с учетом Ваших потребностей.
  • Упорство. Я работаю над каждой деталью, чтобы добиться идеального результата.`,
  `Если Вы готовы сделать шаг в мир вдохновения и гармонии, я буду рада помочь Вам реализовать Ваши идеи. Давайте вместе создадим уникальный интерьер!`
];

const AboutSection: React.FC<AboutSectionProps> = ({ id, className }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  
  // Миниатюра для blur-эффекта при загрузке изображения
  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+';
  
  // Мемоизированное создание параграфов текста
  const paragraphs = useMemo(() => (
    ABOUT_TEXT.map((text, index) => (
      <p key={`para-${index}`} className={styles.aboutParagraph}>
        {text.split('\n').map((line, i) => (
          <React.Fragment key={`line-${i}`}>
            {line}
            {i < text.split('\n').length - 1 && <br />}
          </React.Fragment>
        ))}
      </p>
    ))
  ), []);

  return (
    <section 
      id={id || "about"} 
      className={`${styles.aboutSection} ${className || ''}`}
      aria-labelledby="about-title"
    >
      <div className={styles.container}>
        <div className={styles.aboutContent}>
          {/* Обертка для изображения */}
          <div className={styles.aboutImageWrapper}>
            {!isLoaded && <div className={styles.skeleton} />}
            
            <div className={`${styles.aboutImage} ${!isLoaded ? styles.hidden : ''}`}>
              <Image
                src="/assets/Photo.webp"
                alt="Фото Шептицкая Дарья"
                fill
                priority
                quality={85}
                className={styles.aboutPhoto}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
                onLoad={() => setIsLoaded(true)}
                placeholder="blur"
                blurDataURL={blurDataURL}
              />
              {/* Наложение с текстом поверх изображения */}
              <div className={styles.imageOverlayText}>
                <h3 id="about-title">Шептицкая Дарья</h3>
                <p>Дизайнер интерьера</p>
              </div>
            </div>
          </div>
          {/* Секция с текстом */}
          <div className={styles.aboutText}>
            {paragraphs}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(AboutSection);