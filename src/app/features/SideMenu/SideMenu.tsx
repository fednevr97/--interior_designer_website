"use client";

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import styles from './SideMenu.module.css';
import LogoIcon from '../Icons/logoIcon/LogoIcon';

// Интерфейсы для типизации пропсов
interface MenuItem {
  id: string;      // Уникальный идентификатор пункта меню
  href: string;    // Ссылка пункта меню
  label: string;   // Текст пункта меню
}

interface SocialLink {
  id: string;          // Уникальный идентификатор соцсети
  url: string;         // Ссылка на соцсеть
  label: string;       // Текст для доступности
  icon: React.ReactNode; // Иконка соцсети
}

interface SideMenuProps {
  isOpen: boolean;     // Состояние открытия меню
  onClose: () => void; // Функция закрытия меню
  logo: {
    icon: React.ReactNode; // Иконка логотипа
    text: string;         // Текст логотипа
  };
  menuItems: MenuItem[];  // Массив пунктов меню
  phone: string;          // Номер телефона
  socialLinks: SocialLink[]; // Массив ссылок на соцсети
  address: string;        // Адрес
}

// Компонент бокового меню
const SideMenu: React.FC<SideMenuProps> = ({ 
  isOpen, 
  onClose, 
  logo, 
  menuItems, 
  phone, 
  socialLinks,
}) => {
  // Обработчик закрытия по клавише ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Блокировка скролла при открытом меню
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Реф для отслеживания кликов вне меню
  const menuRef = useRef<HTMLElement>(null);

  // Обработчик клика вне меню
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
  
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
  
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Формирование URL для Яндекс.Карт
  const address = "Севастополь, ул. Токарева, 3";
  const yandexMapsUrl = `https://yandex.ru/maps/?text=${encodeURIComponent(address)}`;

  return (
    <aside 
      className={`${styles['side-menu']} ${isOpen ? styles.active : ''}`} 
      role="complementary" 
      aria-label="Боковое меню"
      ref={menuRef}
    >
      <div className={styles['side-menu__content']}>
        {/* Кнопка закрытия */}
        <button 
          className={styles['side-menu__close']} 
          onClick={onClose}
          aria-label="Закрыть меню"
        >
          &times;
        </button>
        
        {/* Навигация */}
        <nav className={styles['side-menu__nav']} role="navigation" aria-label="Навигация">
          <ul className={styles['side-menu__list']}>
            {/* Логотип */}
            <li className={`${styles['side-menu__item']} ${styles['side-menu__item--logo']}`}>
              <Link href="/" className={`${styles['header__logo']} ${styles['header__logo-menu']}`} aria-label="На главную">
                <LogoIcon variant="menu" className={styles['header__btn-logo']} aria-hidden="true"/>
                <span className={styles['header__logo-text']}>
                  {logo.text.split('\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </span>
              </Link>
            </li>

            {/* Пункты меню */}
            <li className={styles['side-menu__item']}>
              <ul className={styles['side-menu__sublist']}>
                {menuItems.map((item) => (
                  <li key={item.id} className={styles['side-menu__item-link']}>
                    <Link 
                      href={item.href} 
                      className={styles['side-menu__link']} 
                      onClick={onClose}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>

            {/* Контакты */}
            <li className={`${styles['side-menu__item']} ${styles['side-menu__item-phone']}`}>
              <a 
                href={`tel:${phone.replace(/\D/g, '')}`}
                className={`${styles['side-menu__link']} ${styles['phone-link']}`}
                aria-label="Позвонить"
              >
                {phone}
              </a>
            </li>
            <li className={styles['side-menu__item']}>
              <a 
                href={yandexMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles['side-menu__link']}
                aria-label="Открыть адрес на Яндекс.Картах"
              >
                {address}
              </a>
            </li>

            {/* Социальные сети */}
            <li className={`${styles['side-menu__item']} ${styles['side-menu__item-social']}`}>
              <div className={styles['side-menu__social-links']} role="group" aria-label="Социальные сети">
                {socialLinks.map((social) => (
                  <a
                    key={social.id}
                    href={social.url}
                    className={styles['social-icon-wrapper']}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default SideMenu;