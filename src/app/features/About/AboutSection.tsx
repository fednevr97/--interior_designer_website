'use client'

import React, { useMemo, useState } from 'react';
import Image from 'next/image';
import styles from './AboutSection.module.css';

interface AboutSectionProps {
  id?: string;
  className?: string;
}

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

  const blurDataURL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiIC8+PC9zdmc+';

  const paragraphs = useMemo(() => (
    ABOUT_TEXT.map((text, index) => (
      <p key={index} className={styles.aboutParagraph}>
        {text.split('\n').map((line, i) => (
          <React.Fragment key={i}>
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
      className={[styles.aboutSection, className].filter(Boolean).join(' ')}
      aria-labelledby="about-title"
    >
      <div className={styles.container}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutImageWrapper}>
            {!isLoaded && <div className={styles.skeleton} aria-hidden="true" />}
            <Image
              src="/assets/Photo.webp"
              alt="Фото Шептицкая Дарья"
              fill
              quality={75}
              className={styles.aboutPhoto}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 40vw"
              placeholder="blur"
              blurDataURL={blurDataURL}
              loading="eager"
              onLoad={() => setIsLoaded(true)}
            />
            <div className={styles.imageOverlayText}>
              <h1 id="about-title">Дарья Шептицкая - дизайнер интерьера</h1>
            </div>
          </div>
          <div className={styles.aboutText}>
            {paragraphs}
          </div>
        </div>
      </div>
    </section>
  );
};

export default React.memo(AboutSection);