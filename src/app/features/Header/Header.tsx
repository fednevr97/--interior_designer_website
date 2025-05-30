"use client";

// Импортируем необходимые компоненты и хуки
import React, { useState } from 'react';
import Link from 'next/link';
import styles from './Header.module.css';
import MenuIcon from '../Icons/menuIcon/MenuIcon';
import LogoIcon from '../Icons/logoIcon/LogoIcon';
import CtaButton from '../../shared/components/ui/Button/CtaButton';
import SideMenu from '../SideMenu/SideMenu';
import VK from '../Icons/VK/VK';
import Telegram from '../Icons/Telegram/Telegram';
import Modal from '../ModalForm/ModalForm';

// Интерфейс для пропсов компонента Header
interface HeaderProps {
  phone?: string; // Опциональный номер телефона
}

const Header: React.FC<HeaderProps> = ({ 
  phone = "+7 (978) 662 37 81", // Значение по умолчанию для телефона
}) => {
  // Состояния для управления меню и модальным окном
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Функции для управления состоянием меню
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  // Массив пунктов меню
  const menuItems = [
    { id: '1', href: '/', label: 'Главная' },
    { id: '2', href: '/#about', label: 'Обо мне' },
    { id: '3', href: '/#services', label: 'Услуги' },
    { id: '4', href: '/portfolio', label: 'Портфолио' },
    { id: '5', href: '#contacts', label: 'Контакты' },
    { id: '6', href: '/articles', label: 'Полезные статьи' },
  ];

  // Массив ссылок на социальные сети
  const socialLinks = [
    { id: '1', url: 'https://vk.ru/id14565500', label: 'ВКонтакте', icon: <VK /> },
    { id: '2', url: 'https://t.me/dariy1988', label: 'Telegram', icon: <Telegram /> },
  ];

  return (
    <>
      {/* Основной header */}
      <header className={styles.header} role="banner">
        <div className={styles.header__content}>
          <nav className={styles.header__nav} role="navigation" aria-label="Главное меню">
            <ul className={styles.header__menu}>
              {/* Кнопка меню */}
              <li className={styles.header__menuItem}>
                <button
                  className={styles.menuButton}
                  onClick={toggleMenu}
                  aria-label="Открыть меню"
                  aria-expanded={isMenuOpen}
                >
                  <MenuIcon />
                </button>
              </li>
              {/* Логотип */}
              <li className={`${styles.header__menuItem} ${styles.header__menuItemLogo}`}>
                <Link href="/" className={styles.header__logo} aria-label="На главную">
                  <LogoIcon variant="header" aria-hidden="true" />
                  <b className={styles.header__logoText}>
                    индивидуальный дизайн<br />
                    интерьера
                  </b>
                </Link>
              </li>
              {/* Контакты и кнопка CTA */}
              <li className={`${styles.header__menuItem} ${styles.header__contacts}`}>
                <a 
                  href={`tel:${phone.replace(/\D/g, '')}`} 
                  className={styles.header__phone} 
                  aria-label="Позвонить"
                >
                  {phone}
                </a>
                <CtaButton onClick={() => setIsModalOpen(true)}/>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Боковое меню */}
      <SideMenu
        isOpen={isMenuOpen}
        onClose={closeMenu}
        logo={{
          icon: <LogoIcon />,
          text: 'Индивидуальный дизайн\nинтерьера'
        }}
        menuItems={menuItems}
        phone={phone}
        socialLinks={socialLinks}
        address="г. Севастополь, ул. Токарева, 3"
      />

      {/* Модальное окно формы */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />  
    </>
  );
};

export default Header;