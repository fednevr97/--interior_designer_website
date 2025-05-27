import { NextResponse } from 'next/server'; // Next.js утилита для создания ответов API
import fs from 'fs/promises'; // Модуль для работы с файловой системой (Promise-based)
import path from 'path'; // Модуль для работы с путями файловой системы

// Определение интерфейса для документа
interface Document {
  id: number;        // Уникальный идентификатор документа
  image: string;     // Путь к изображению документа
  title: string;     // Название документа
}

// Экспорт асинхронной GET-функции для обработки HTTP GET-запросов
export async function GET() {
  try {
    // Формирование абсолютного пути к директории с документами
    // process.cwd() - текущая рабочая директория
    // path.join() - безопасное объединение путей
    const documentationDir = path.join(process.cwd(), 'public', 'documentation');
    
    // Чтение содержимого директории (асинхронно)
    const files = await fs.readdir(documentationDir);
    
    // Инициализация массива для хранения всех документов
    let allDocuments: Document[] = []; 
    // Счетчик для генерации ID
    let idCounter = 1;

    // Обработка файлов:
    const documentProjects: Document[] = files
      // Фильтрация только изображений (jpg, jpeg, png, webp)
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
      // Преобразование каждого файла в объект Document
      .map(file => ({
        id: idCounter++, // Генерация последовательного ID
        image: `/documentation/${file}`, // Формирование относительного пути к изображению
        title: file
          .replace(/\.[^/.]+$/, '') // Удаление расширения файла
          .replace(/[-_]/g, ' ')    // Замена подчеркиваний и дефисов на пробелы
      }));

    // Добавление обработанных документов в общий массив
    allDocuments = [...allDocuments, ...documentProjects];

    // Возврат успешного ответа с массивом документов в формате JSON
    return NextResponse.json(allDocuments);
  } catch (error) {
    // Обработка ошибок:
    console.error('Error fetching documentation:', error); // Логирование ошибки
    
    // Возврат ответа с ошибкой (500 Internal Server Error)
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    );
  }
}