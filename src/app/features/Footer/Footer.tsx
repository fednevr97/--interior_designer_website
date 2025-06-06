import React from 'react';
import styles from './Footer.module.css';
import VK from '../Icons/VK/VK';
import Telegram from '../Icons/Telegram/Telegram';

const Footer = () => {
  // Адрес для Яндекс.Карт
  const address = "Севастополь, ул. Токарева, 3";
  const yandexMapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;

  return (
    <footer id="contacts" className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.footer__content}>
          <ul className={styles.footer__infoList}>
            {/* Блок с адресом */}
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_address}`}>
              <span className={styles.footer__infoLabel}>Адрес:</span>
              <a 
                href={yandexMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.footer__infoLink}
                aria-label="Открыть адрес на Яндекс.Картах"
              >
                {address}
              </a>
            </li>
            {/* Блок с email */}
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_email}`}>
              <span className={styles.footer__infoLabel}>Email:</span>
              <a href="mailto:me@sheptitskaja.ru" className={styles.footer__infoLink}>
                me@sheptitskaja.ru
              </a>
            </li>
            {/* Блок с социальными сетями */}
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_socialMedia}`}>
              <span className={styles.footer__infoLabel}>Соцсети:</span>
              <div className={styles.footer__socialLinks} role="group" aria-label="Социальные сети">
                <a href="https://vk.ru/id14565500" target='_blank' aria-label="ВКонтакте">
                  <VK aria-hidden="true" />
                </a>
                <a href="https://t.me/dariy1988" target='_blank' aria-label="Telegram">
                  <Telegram aria-hidden="true" />
                </a>
              </div>
            </li>
            {/* Блок с телефоном */}
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_phone}`}>
              <span className={styles.footer__infoLabel}>Телефон:</span>
              <a href="tel:+7(978)-662-37-81" className={styles.footer__infoLink}>
                +7 (978) 662 37 81
              </a>
            </li>
          </ul>
        </div>
        {/* Блок с копирайтом */}
        <div className={styles.footer__copyright}>
          <p className={styles.footer__copyrightText}>
            &copy; 2025 Шептицкая Дарья.{' '}
            <a href="/privacy-policy" className={styles.footer__copyrightLink}>
              Все права защищены
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;