import React from 'react';
import styles from './MenuIcon.module.css';

interface MenuIconProps {
  className?: string;
}

const MenuIcon: React.FC<MenuIconProps> = ({ className }) => (
  <svg
    className={`${styles.icon} ${className || ''}`}
    style={{flexShrink:0}}
    width="30"
    height="30"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M4 6H20M4 12H14M4 18H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

export default MenuIcon;