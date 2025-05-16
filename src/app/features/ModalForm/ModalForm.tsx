'use client'

import React, { useState, useEffect, useCallback } from 'react';
import styles from './ModalForm.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    type: '',
    area: '',
    name: '',
    email: '',
    phone: ''
  });

  // Обработчик закрытия по ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Эффект для добавления/удаления обработчика ESC
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Восстанавливаем скролл
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Обработчик клика по оверлею
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        type: value
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`${styles.modal} ${isOpen ? styles.active : ''}`} 
      role="dialog" 
      aria-labelledby="modal-title" 
      aria-modal="true"
    >
      <div 
        className={styles.modal__overlay} 
        aria-hidden="true" 
        onClick={handleOverlayClick}
      ></div>
      
      <div className={styles.modal__content}>
        <button 
          className={styles.modal__close} 
          aria-label="Закрыть окно"
          onClick={onClose}
          autoFocus // Автофокус для доступности
        >
          ×
        </button>
        
        <h2 id="modal-title" className={styles.modal__title}>
          Рассчитать стоимость
        </h2>

        <form 
          className={styles.modal__form} 
          aria-label="Форма расчета стоимости"
          onSubmit={handleSubmit}
        >
          
          <fieldset className={styles.modal__checkboxes}>
            <legend className={styles.modal__checkboxLegend}>Тип помещения</legend>
            
            <label className={styles.modal__checkboxLabel}>
              <input type="checkbox" 
                     name="type" 
                     value="house" 
                     checked={formData.type === 'house'}
                     onChange={handleChange} />
              <span className={styles.modal__checkboxCustom} aria-hidden="true"></span>
              <span>Дома</span>
            </label>
            
            <label className={styles.modal__checkboxLabel}>
              <input type="checkbox" 
                     name="type" 
                     value="apartment" 
                     checked={formData.type === 'apartment'}
                     onChange={handleChange} />
              <span className={styles.modal__checkboxCustom} aria-hidden="true"></span>
              <span>Квартиры</span>
            </label>
            
            <label className={styles.modal__checkboxLabel}>
              <input type="checkbox" 
                     name="type" 
                     value="other" 
                     checked={formData.type === 'other'}
                     onChange={handleChange} />
              <span className={styles.modal__checkboxCustom} aria-hidden="true"></span>
              <span>Другое</span>
            </label>
          </fieldset>

          <div className={styles.modal__inputGroup}>
            <input
              type="text"
              name="area"
              placeholder="Площадь (м²)"
              className={styles.modal__input}
              aria-label="Площадь помещения"
              value={formData.area}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="name"
              placeholder="Ваше имя"
              className={styles.modal__input}
              aria-label="Ваше имя"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className={styles.modal__inputGroup}>
            <input 
              type="email" 
              name="email"
              placeholder="Email" 
              className={styles.modal__input} 
              aria-label="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Телефон"
              className={styles.modal__input}
              aria-label="Телефон"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.modal__submit}>
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;