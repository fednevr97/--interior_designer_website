'use client'

import React, { useEffect, useState } from 'react';
import styles from './ServicesSection.module.css';
import Image from 'next/image';

// Интерфейс для пропсов компонента
interface ServicesProps {
  id?: string;  // Опциональный идентификатор секции
}

// Компонент секции услуг
const Services: React.FC<ServicesProps> = ({ id = "services"}) => {
  // Массив с данными об услугах
  const services = [
    {
      id: 1,
      image: "/assets/Дизайн проекта.webp",
      title: "Дизайн проекта",
      description: "Создание уникального и функционального дизайна интерьера с учетом Ваших пожеланий и стиля жизни. Мы разрабатываем подробные планы, визуализации и подбор материалов, чтобы каждый элемент гармонично сочетался.",
      price: "От 3 000 руб."
    },
    {
      id: 2,
      image: "/assets/комплектация.webp",
      title: "Комплектация",
      description: "Полный цикл подбора и закупки мебели, отделочных материалов и декора. Я обеспечиваю качественную реализацию всех аспектов проекта, чтобы повысить комфорт и эстетическую ценность Вашего пространства.",
      price: "От 3 000 руб."
    },
    {
      id: 3,
      image: "/assets/реализация.webp",
      title: "Реализация",
      description: "Осуществление всех этапов проекта от начала до конца. Я контролирую строительные и отделочные работы, обеспечивая высокие стандарты качества и соблюдение сроков, чтобы результат превзошел все Ваши ожидания.",
      price: "От 20 000 руб."
    }
  ];

  // Состояние для определения мобильного устройства
  const [isMobile, setIsMobile] = useState(false);

  // Эффект для отслеживания размера окна
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize(); // Проверяем сразу при загрузке
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Функция для определения размеров изображений
  const getSizes = () => {
    return isMobile 
      ? "100vw" // На мобильных - 1 элемент (100% ширины)
      : "33vw"; // На десктопе - 3 элемента (по 33% ширины)
  };

  return (
    <section id={id} className={styles['services-section']} aria-labelledby="services-title">
      <div className={styles.container}>
        <h2 id="services-title" className={styles.servicesTitle}>Мои услуги</h2>
        <div className={styles['services-wrapper']}>
          <div className={styles['carousel-container']}>
            <div className={styles['services-carousel']} >
              {services.map((service) => (
                <article 
                  key={service.id} 
                  className={`${styles['service-item']} ${isMobile ? styles['mobile-view'] : ''}`} 
                >
                  <div className={styles['service-image']}>
                    <Image 
                      src={service.image} 
                      alt={service.title} 
                      fill
                      sizes={getSizes()}
                      className={styles['service-img']}
                      style={{
                        objectFit: 'cover',
                      }}
                      quality={75} // Оптимизация качества (по умолчанию 75)
                    />
                  </div>
                  <div className={styles['service-content']}>
                    <h3>{service.title}</h3>
                    <p>{service.description}</p>
                    <p className={styles['service-price']}>{service.price}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;