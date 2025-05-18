// src/app/data/documentation.ts
import fs from 'fs/promises';
import path from 'path';

interface Document {
  id: number;
  image: string;
  title: string;
}

export async function getDocumentation(): Promise<Document[]> {
  const docsDir = path.join(process.cwd(), 'public', 'documentation');
  const files = await fs.readdir(docsDir);
  
  let allDocuments: Document[] = [];
  let idCounter = 1;

  const documentFiles = files.filter(file => /\.(jpe?g|png|webp|pdf)$/i.test(file)); // Фильтруем по типам файлов

  allDocuments = documentFiles.map(file => ({
    id: idCounter++, // Увеличиваем счетчик ID
    image: `/documentation/${file}`, // Путь к изображению
    title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '), // Заголовок документа
  }));

  return allDocuments;
}