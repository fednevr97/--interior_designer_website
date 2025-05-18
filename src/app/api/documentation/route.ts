// src/app/api/documentation/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Document {
  id: number;
  image: string;
  title: string;
}

export async function GET() {
  try {
    const documentationDir = path.join(process.cwd(), 'public', 'documentation');
    const files = await fs.readdir(documentationDir);
    
    let allDocuments: Document[] = []; // Явно указываем тип
    let idCounter = 1;

    const documentProjects: Document[] = files
      .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
      .map(file => ({
        id: idCounter++,
        image: `/documentation/${file}`,
        title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
      }));

    allDocuments = [...allDocuments, ...documentProjects];

    return NextResponse.json(allDocuments);
  } catch (error) {
    console.error('Error fetching documentation:', error); // Используем переменную error
    return NextResponse.json(
      { error: 'Failed to fetch documentation' },
      { status: 500 }
    );
  }
}