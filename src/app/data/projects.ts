// app/data/projects.ts
import fs from 'fs/promises';
import path from 'path';

interface Project {
  id: number; // Теперь только number
  image: string;
  title: string;
  category: string;
  folder: string;
}

export async function getProjects(): Promise<Project[]> {
  const projectsDir = path.join(process.cwd(), 'public', 'projects');
  const categories = await fs.readdir(projectsDir);
  
  let allProjects: Project[] = [];
  let idCounter = 1;

  for (const category of categories) {
    const categoryPath = path.join(projectsDir, category);
    const stat = await fs.stat(categoryPath);
    
    if (stat.isDirectory()) {
      const files = await fs.readdir(categoryPath);
      const categoryProjects = files
        .filter(file => /\.(jpe?g|png|webp)$/i.test(file))
        .map(file => ({
          id: idCounter++, // Теперь просто число
          image: `/projects/${category}/${file}`,
          title: file.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          category: category,
          folder: category
        }));

      allProjects = [...allProjects, ...categoryProjects];
    }
  }

  return allProjects;
}

export async function getCategories(): Promise<string[]> {
  const projectsDir = path.join(process.cwd(), 'public', 'projects');
  const items = await fs.readdir(projectsDir);
  const categories = [];
  
  for (const item of items) {
    const itemPath = path.join(projectsDir, item);
    const stat = await fs.stat(itemPath);
    if (stat.isDirectory()) {
      categories.push(item);
    }
  }
  
  return categories;
}