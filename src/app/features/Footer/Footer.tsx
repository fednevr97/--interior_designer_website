import React from 'react';
import styles from './Footer.module.css';
import VK from '../Icons/VK/VK';
import Telegram from '../Icons/Telegram/Telegram';
import Instagram from '../Icons/Instagram/Instagram';

const Footer = () => {
  return (
    <footer id="contacts" className={styles.footer} role="contentinfo">
      <div className={styles.container}>
        <div className={styles.footer__content}>
          <ul className={styles.footer__infoList}>
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_email}`}>
              <span className={styles.footer__infoLabel}>Email:</span>
              <a href="mailto:example@example.com" className={styles.footer__infoLink}>
                example@example.com
              </a>
            </li>
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_socialMedia}`}>
              <span className={styles.footer__infoLabel}>Соцсети:</span>
              <div className={styles.footer__socialLinks} role="group" aria-label="Социальные сети">
                <a href="#" aria-label="ВКонтакте">
                  <VK aria-hidden="true" />
                </a>
                <a href="#" aria-label="Telegram">
                  <Telegram aria-hidden="true" />
                </a>
                <a href="#" aria-label="Instagram">
                  <Instagram aria-hidden="true" />
                </a>
              </div>
            </li>
            <li className={`${styles.footer__infoItem} ${styles.footer__infoItem_phone}`}>
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