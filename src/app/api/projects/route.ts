import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface Project {
  id: number;
  image: string;
  title: string;
}

export async function GET() {
  try {
    const projectsDir = path.join(process.cwd(), 'public', 'projects');
    const categories = await fs.readdir(projectsDir);
    
    let allProjects: Project[] = []; // Явно указываем тип
    let idCounter = 1;

    for (const category of categories) {
      const categoryPath = path.join(projectsDir, category);
      const stat = await fs.stat(categoryPath);
      
      if (stat.isDirectory()) {
        const files = await fs.readdir(categoryPath);
        const categoryProjects: Project[] = files
          .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
          .map(file => ({
            id: idCounter++,
            image: `/projects/${category}/${file}`,
            title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
          }));

        allProjects = [...allProjects, ...categoryProjects];
      }
    }

    return NextResponse.json(allProjects);
  } catch (error) {
    console.error('Error fetching projects:', error); // Используем переменную error
    return NextResponse.json(
      { error: 'Failed to fetch projects' },
      { status: 500 }
    );
  }
}