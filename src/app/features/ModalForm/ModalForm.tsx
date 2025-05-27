'use client'

import React, { useState, useEffect, useCallback } from 'react';
import styles from './ModalForm.module.css';

// Интерфейс для пропсов модального окна
interface ModalProps {
  isOpen: boolean;    // Флаг открытия модального окна
  onClose: () => void; // Функция закрытия модального окна
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  // Состояние для хранения данных формы
  const [formData, setFormData] = useState({
    type: '',    // Тип помещения
    area: '',    // Площадь
    name: '',    // Имя
    email: '',   // Email
    phone: ''    // Телефон
  });

  // Состояния для управления политикой конфиденциальности
  const [isPolicyChecked, setIsPolicyChecked] = useState(false);     // Флаг согласия с политикой
  const [showPolicyError, setShowPolicyError] = useState(false);     // Флаг отображения ошибки
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);   // Флаг видимости подсказки

  // Обработчик закрытия по клавише ESC
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Эффект для управления обработчиком ESC и блокировкой скролла
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden'; // Блокируем скролл при открытом модальном окне
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

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      // Для чекбоксов типа помещения
      setFormData(prev => ({
        ...prev,
        type: prev.type === value ? '' : value
      }));
    } else {
      // Для текстовых полей
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Обработчик изменения состояния чекбокса политики
  const handlePolicyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPolicyChecked(e.target.checked);
    setShowPolicyError(false);
    setIsTooltipVisible(false);
  };

  // Обработчик отправки формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Проверяем согласие с политикой
    if (!isPolicyChecked) {
      setShowPolicyError(true);
      setIsTooltipVisible(true);
      
      // Скрываем подсказку через 3 секунды
      setTimeout(() => {
        setIsTooltipVisible(false);
      }, 3000);
      
      // Прокручиваем к политике
      const policyElement = document.querySelector(`.${styles.modal__policy}`);
      policyElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    console.log('Form submitted:', formData);
    onClose();
  };

  // Не рендерим компонент, если модальное окно закрыто
  if (!isOpen) return null;

  return (
    // Основной контейнер модального окна
    <div 
      className={`${styles.modal} ${isOpen ? styles.active : ''}`} 
      role="dialog" 
      aria-labelledby="modal-title" 
      aria-modal="true"
    >
      {/* Оверлей для затемнения фона */}
      <div 
        className={styles.modal__overlay} 
        aria-hidden="true" 
        onClick={handleOverlayClick}
      ></div>
      
      {/* Контент модального окна */}
      <div className={styles.modal__content}>
        {/* Кнопка закрытия */}
        <button 
          className={styles.modal__close} 
          aria-label="Закрыть окно"
          onClick={onClose}
          autoFocus
        >
          ×
        </button>
        
        {/* Заголовок модального окна */}
        <h2 id="modal-title" className={styles.modal__title}>
          Рассчитать стоимость
        </h2>

        {/* Форма */}
        <form 
          className={styles.modal__form} 
          aria-label="Форма расчета стоимости"
          onSubmit={handleSubmit}
        >
          
          {/* Группа чекбоксов для выбора типа помещения */}
          <fieldset className={styles.modal__checkboxes}>
            <legend className={styles.modal__checkboxLegend}>Тип помещения</legend>
            
            {/* Чекбоксы для разных типов помещений */}
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

          {/* Группа полей ввода для площади и имени */}
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

          {/* Группа полей ввода для email и телефона */}
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

          {/* Блок с политикой конфиденциальности */}
          <div className={styles.modal__policy}>
            <label className={styles.modal__policyLabel}>
              <input
                type="checkbox"
                checked={isPolicyChecked}
                onChange={handlePolicyChange}
                className={styles.modal__policyCheckbox}
                aria-invalid={showPolicyError}
                aria-describedby={showPolicyError ? "policy-error" : undefined}
              />
              <span className={styles.modal__policyText}>
                Я согласен с <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.modal__policyLink}>политикой конфиденциальности</a>
              </span>
            </label>
            {/* Всплывающая подсказка при отсутствии согласия с политикой */}
            {isTooltipVisible && (
              <div className={styles.modal__policyTooltip}>
                <div className={styles.modal__policyTooltipText}>
                  Необходимо подтвердить согласие с политикой конфиденциальности
                </div>
              </div>
            )}
          </div>

          {/* Кнопка отправки формы */}
          <button 
            type="submit" 
            className={styles.modal__submit}
          >
            Отправить
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;