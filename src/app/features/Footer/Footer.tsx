import React from 'react';
import styles from './Footer.module.css';
import VK from '../Icons/VK/VK';
import Telegram from '../Icons/Telegram/Telegram';

const Footer = () => {
  const address = "Севастополь, ул. Токарева, 3";
  const yandexMapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;

  return (
    <footer id="contacts" className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.footer__content}>
          <ul className={styles.footer__infoList}>
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
            {/* Остальные элементы остаются без изменений */}
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_email}`}>
              <span className={styles.footer__infoLabel}>Email:</span>
              <a href="mailto:example@example.com" className={styles.footer__infoLink}>
                example@example.com
              </a>
            </li>
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
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_}`}>
              <span className={styles.footer__infoLabel}>Телефон:</span>
              <a href="tel:+7(978)-662-37-81" className={styles.footer__infoLink}>
                +7 (978) 662 37 81
              </a>
            </li>
          </ul>
        </div>
        <div className={styles.footer__copyright}>
          <p className={styles.footer__copyrightText}>&copy; 2025 Мой Сайт. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;