'use client'

import React, { useState, useEffect, useCallback } from 'react';
import styles from './ModalForm.module.css';

// Объявление типов для grecaptcha (Google reCAPTCHA)
declare global {
  interface Window {
    grecaptcha?: {
      // Метод для выполнения кода после загрузки reCAPTCHA
      ready: (callback: () => void) => void;
      // Метод для рендеринга reCAPTCHA
      render: (
        container: string | HTMLElement,
        params: {
          sitekey: string; // Ключ сайта
          callback?: (token: string) => void; // Колбек при успешной проверке
          'expired-callback'?: () => void; // Колбек при истечении токена
          'error-callback'?: () => void; // Колбек при ошибке
          hl?: string; // Язык виджета
          theme?: 'light' | 'dark'; // Тема виджета
          size?: 'normal' | 'compact' | 'invisible'; // Размер виджета
        }
      ) => void;
      // Метод для сброса reCAPTCHA
      reset: (widgetId?: number) => void;
    };
  }
}

// Интерфейс пропсов для модального окна
interface ModalProps {
  isOpen: boolean; // Флаг открытия модального окна
  onClose: () => void; // Функция закрытия модального окна
}

const ModalForm: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  // Состояния для хранения данных формы
  const [formData, setFormData] = useState({
    type: '', // Тип помещения
    area: '', // Площадь
    name: '', // Имя
    email: '', // Email
    phone: '' // Телефон
  });

  // Состояния для управления политикой конфиденциальности
  const [isPolicyChecked, setIsPolicyChecked] = useState(false); // Флаг согласия
  const [showPolicyError, setShowPolicyError] = useState(false); // Ошибка согласия
  const [isTooltipVisible, setIsTooltipVisible] = useState(false); // Видимость подсказки

  // Состояния для reCAPTCHA
  const [isCaptchaVerified, setIsCaptchaVerified] = useState(false); // Флаг проверки
  const [showCaptchaError, setShowCaptchaError] = useState(false); // Ошибка капчи
  const [isRecaptchaLoaded, setIsRecaptchaLoaded] = useState(false); // Загрузка скрипта

  // Состояния для управления отправкой формы
  const [isSubmitting, setIsSubmitting] = useState(false); // Флаг отправки
  const [submitError, setSubmitError] = useState<string | null>(null); // Ошибка отправки
  const [captchaToken, setCaptchaToken] = useState(''); // Токен reCAPTCHA
  const [isSuccess, setIsSuccess] = useState(false); // Флаг успешной отправки

  //Сброс данных формы при закрытии модального окна
  useEffect(() => {
    if (!isOpen) {
      // Полный сброс всех данных формы
      setFormData({ 
        type: '', 
        area: '', 
        name: '', 
        email: '', 
        phone: '' 
      });
      setIsPolicyChecked(false);
      setIsCaptchaVerified(false);
      setCaptchaToken('');
      setSubmitError(null);
      setIsSuccess(false);
      
    }
  }, [isOpen]); // Зависимость от пропса isOpen

  // Обработчик успешной проверки reCAPTCHA
  const handleCaptchaVerified = useCallback((token: string) => {
    setIsCaptchaVerified(true);
    setCaptchaToken(token); // Сохраняем полученный токен
    setShowCaptchaError(false); // Сбрасываем ошибку
  }, []);
  
  // Обработчик истечения или ошибки reCAPTCHA
  const handleCaptchaExpired = useCallback(() => {
    setIsCaptchaVerified(false);
    setCaptchaToken(''); // Сбрасываем токен
  }, []);

  // Эффект для загрузки и инициализации reCAPTCHA
  useEffect(() => {
    if (!isOpen) return; // Не загружаем, если модалка закрыта

    const loadRecaptcha = () => {
      if (typeof window === 'undefined' || !window.grecaptcha) {
        console.error('reCAPTCHA не доступен в window');
        return;
      }

      // Инициализация reCAPTCHA после загрузки
      window.grecaptcha.ready(() => {
        try {
          window.grecaptcha?.render('recaptcha-container', {
            sitekey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '', // Тестовый ключ
            callback: handleCaptchaVerified, // Колбек при успехе
            'expired-callback': handleCaptchaExpired, // Колбек при истечении
            'error-callback': handleCaptchaExpired, // Колбек при ошибке
            hl: 'ru', // Язык - русский
            theme: 'light', // Светлая тема
            size: 'normal' // Стандартный размер
          });
          setIsRecaptchaLoaded(true); // Устанавливаем флаг загрузки
        } catch (error) {
          console.error('Ошибка инициализации reCAPTCHA:', error);
        }
      });
    };

    // Если reCAPTCHA уже загружен (например, при повторном открытии модалки)
    if (window.grecaptcha) {
      loadRecaptcha();
      return;
    }

    // Динамическая загрузка скрипта reCAPTCHA
    const script = document.createElement('script');
    script.src = 'https://www.google.com/recaptcha/api.js?render=explicit&hl=ru';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // Даем дополнительное время для инициализации
      setTimeout(loadRecaptcha, 500);
    };
    script.onerror = () => {
      console.error('Не удалось загрузить reCAPTCHA');
    };

    document.body.appendChild(script);

    // Функция очистки при размонтировании
    return () => {
      if (script.parentNode) {
        document.body.removeChild(script);
      }
      setIsRecaptchaLoaded(false);
    };
  }, [isOpen, handleCaptchaVerified, handleCaptchaExpired]);

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
      document.body.style.overflow = 'hidden'; // Блокируем скролл страницы
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = ''; // Восстанавливаем скролл
    }

    // Функция очистки
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  // Обработчик клика по оверлею (закрытие при клике вне формы)
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    // Для чекбоксов типа помещения (только один может быть выбран)
    if (type === 'checkbox') {
      setFormData(prev => ({
        ...prev,
        type: prev.type === value ? '' : value // Сбрасываем, если уже выбран
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
    setShowPolicyError(false); // Сбрасываем ошибку
    setIsTooltipVisible(false); // Скрываем подсказку
  };

  // Обработчик отправки формы
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null); // Сбрасываем предыдущие ошибки
    
    // Валидация согласия с политикой
    if (!isPolicyChecked) {
      setShowPolicyError(true);
      setIsTooltipVisible(true);
      
      // Автоматическое скрытие подсказки через 3 секунды
      setTimeout(() => {
        setIsTooltipVisible(false);
      }, 3000);
      
      // Прокрутка к блоку с политикой
      const policyElement = document.querySelector(`.${styles.modal__policy}`);
      policyElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    // Валидация reCAPTCHA
    if (!isCaptchaVerified) {
      setShowCaptchaError(true);
      // Прокрутка к блоку с капчей
      document.getElementById('recaptcha-container')?.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      return;
    }

    try {
      setIsSubmitting(true); // Устанавливаем флаг отправки
      
      // Отправка данных на сервер
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          message: `Тип: ${formData.type}, Площадь: ${formData.area}`,
          recaptchaToken: captchaToken, // Передаем токен reCAPTCHA
          type: formData.type,
          area: formData.area,
        }),
      });
  
      // Обработка ошибок HTTP
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Ошибка при отправке формы');
      }
  
      // Успешная отправка
      setIsSuccess(true); // Показываем сообщение об успехе
      setFormData({ type: '', area: '', name: '', email: '', phone: '' }); // Сбрасываем форму
      setIsPolicyChecked(false); // Сбрасываем чекбокс
      setIsCaptchaVerified(false); // Сбрасываем капчу
      
      // Автоматическое закрытие через 3 секунды
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 3000);
      
    } catch (error: unknown) {
      // Обработка ошибок
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Произошла ошибка при отправке формы. Пожалуйста, попробуйте позже.';
      setSubmitError(errorMessage);
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false); // Сбрасываем флаг отправки
    }
  };

  // Не рендерим компонент, если модальное окно закрыто
  if (!isOpen) {
    return null;
  }

  return (
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
      
      {/* Основной контент модального окна */}
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
        
        {/* Условный рендеринг: сообщение об успехе или форма */}
        {isSuccess ? (
          // Блок успешной отправки
          <div className={styles.modal__success}>
            <h2 className={styles.modal__title}>Заявка успешно отправлена!</h2>
            <p className={styles.modal__successText}>Мы свяжемся с вами в ближайшее время.</p>
            <div className={styles.modal__successIcon}>✓</div>
          </div>
        ) : (
          // Основной контент формы
          <>
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
                
                {/* Варианты типов помещений */}
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
                    Я согласен(а) на обработку персональных данных в соответствии с <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className={styles.modal__policyLink}>политикой конфиденциальности</a>
                  </span>
                </label>
                {/* Всплывающая подсказка при отсутствии согласия */}
                {isTooltipVisible && (
                  <div className={styles.modal__policyTooltip}>
                    <div className={styles.modal__policyTooltipText}>
                      Необходимо подтвердить согласие с политикой конфиденциальности
                    </div>
                  </div>
                )}
              </div>

              {/* Блок reCAPTCHA */}
              <div className={styles.modal__captcha}>
                {!isRecaptchaLoaded && <div>Загрузка проверки...</div>}
                <div id="recaptcha-container"></div>
                  {showCaptchaError && (
                  <p className={styles.modal__error}>
                    Пожалуйста, подтвердите, что вы не робот
                  </p>
                  )}
              </div>

              {/* Блок отображения ошибок отправки формы */}
              {submitError && (
                <div className={styles.modal__error}>
                {submitError}
                </div>
              )}

              {/* Кнопка отправки формы */}
              <button 
                type="submit" 
                className={styles.modal__submit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ModalForm;