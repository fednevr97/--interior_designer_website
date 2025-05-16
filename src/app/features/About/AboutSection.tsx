import React from 'react';
import Image from 'next/image';
import styles from './AboutSection.module.css';

interface AboutSectionProps {
  id?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({ id }) => {
  return (
    <section id={id || "about"} className={styles.aboutSection} aria-labelledby="about-title">
      <div className={styles.container}>
        <div className={styles.aboutContent}>
          <div className={styles.aboutImageWrapper}>
            <div className={styles.aboutImage}>
              <Image
                src="/assets/Photo.jpg"
                alt="Фото Шептицкая Дарья"
                fill
                className={styles.aboutPhoto}
                sizes="(max-width: 768px) 100vw, 50vw"
              />
              <div className={styles.imageOverlayText}>
                <h3 id="about-title">Шептицкая Дарья</h3>
                <p>Дизайнер интерьера</p>
              </div>
            </div>
          </div>
          <div className={styles.aboutText}>
            <p className={styles.aboutParagraph}>Приветствую Вас на моем сайте!</p>
            <p className={styles.aboutParagraph}>
              Меня зовут Дарья. Я - дизайнер интерьера, который верит, что каждый проект — это не
              просто работа, а творческое путешествие, где Ваши мечты становятся реальностью. С
              каждым новым проектом я стремлюсь создать пространство, которое отражает
              индивидуальность и стиль своих владельцев.
            </p>
            <p className={styles.aboutParagraph}>
              Мой подход включает: <br />
              - Профессионализм. Я обладаю многолетним опытом и регулярно
              обновляю свои знания, чтобы быть в курсе последних трендов и технологий. <br />
              - Ответственность. Каждое решение я принимаю с учетом Ваших потребностей и пожеланий,
              ведь для меня важен результат, который будет радовать Вас долгие годы. <br />
              - Упорство. Я настойчиво работаю над каждой деталью, чтобы добиться идеального результата, потому
              что верю, что качественный дизайн способен изменить пространство и улучшить качество
              жизни.
            </p>
            <p className={styles.aboutParagraph}>
              Если Вы готовы сделать шаг в мир вдохновения и гармонии, я буду рада помочь Вам
              реализовать Ваши идеи. Давайте вместе создадим уникальный интерьер, в котором будет
              комфортно и приятно находиться!
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;