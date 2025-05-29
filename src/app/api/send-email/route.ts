import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    // Добавим логирование для отладки
    console.log('Начало обработки запроса');
    console.log('Переменные окружения:', {
      user: process.env.EMAIL_USER ? 'Установлен' : 'Не установлен',
      pass: process.env.EMAIL_PASS ? 'Установлен' : 'Не установлен'
    });

    const body = await request.json();
    const { name, email, phone, message } = body;

    // Создаем транспортер
    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.ru',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Проверяем подключение
    try {
      await transporter.verify();
    } catch (error) {
      console.error('Ошибка SMTP подключения:', error);
      return NextResponse.json(
        { error: 'Ошибка подключения к почтовому серверу' },
        { status: 500 }
      );
    }

    // Формируем письмо
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Новая заявка с сайта',
      text: `
        Имя: ${name}
        Email: ${email}
        Телефон: ${phone}
        Сообщение: ${message}
      `,
      html: `
        <h2>Новая заявка с сайта</h2>
        <p><strong>Имя:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Телефон:</strong> ${phone}</p>
        <p><strong>Сообщение:</strong> ${message}</p>
      `
    };

    // Отправляем письмо
    const info = await transporter.sendMail(mailOptions);
    console.log('Письмо отправлено:', info.messageId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка при отправке письма:', error);
    return NextResponse.json(
      { error: 'Ошибка при отправке письма' },
      { status: 500 }
    );
  }
}