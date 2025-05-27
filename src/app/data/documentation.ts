import fs from 'fs/promises';
import path from 'path';

// Интерфейс для документа
interface Document {
  id: number;        // Уникальный идентификатор
  image: string;     // Путь к изображению
  title: string;     // Заголовок документа
}

// Функция для получения списка документов
export async function getDocumentation(): Promise<Document[]> {
  // Путь к директории с документами
  const docsDir = path.join(process.cwd(), 'public', 'documentation');
  // Получаем список файлов в директории
  const files = await fs.readdir(docsDir);
  
  let allDocuments: Document[] = [];
  let idCounter = 1;

  // Фильтруем файлы по допустимым расширениям (jpg, jpeg, png, webp, pdf)
  const documentFiles = files.filter(file => /\.(jpe?g|png|webp|pdf)$/i.test(file));

  // Преобразуем файлы в массив документов
  allDocuments = documentFiles.map(file => ({
    id: idCounter++, // Увеличиваем счетчик ID
    image: `/documentation/${file}`, // Формируем путь к изображению
    title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), // Форматируем заголовок
  }));

  return allDocuments;
}