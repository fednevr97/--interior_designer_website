import { promises as fs } from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import html from 'remark-html'

const articlesDirectory = path.join(process.cwd(), 'content/articles/')

export async function getArticleBySlug(slug: string): Promise<{
  meta: {
    title: string
    excerpt: string
    coverImage: string
    date: string
  }
  content: string
  slug: string
} | null> {
  const fullPath = path.join(articlesDirectory, `${slug}.md`)
  try {
    const fileContents = await fs.readFile(fullPath, 'utf8')
    const { data, content } = matter(fileContents)

    const processedContent = await remark()
      .use(html)
      .process(content)
    const contentHtml = processedContent.toString()

    return {
      meta: {
        title: data.title || '',
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '',
        date: data.date || '',
      },
      content: contentHtml,
      slug,
    }
  } catch {
    return null
  }
}

export async function getAllArticles(): Promise<Array<{
  meta: {
    title: string
    excerpt: string
    coverImage: string
    date: string
  }
  slug: string
}>> {
  const files = await fs.readdir(articlesDirectory)
  
  const articles = await Promise.all(
    files.map(async (filename) => {
      const slug = filename.replace(/\.md$/, '')
      const article = await getArticleBySlug(slug)
      if (!article) {
        throw new Error(`Article ${slug} is broken or missing`)
      }
      return {
        meta: article.meta,
        slug: article.slug
      }
    })
  )

  // Сортировка по дате (новые сначала)
  return articles.sort((a, b) => 
    new Date(b.meta.date).getTime() - new Date(a.meta.date).getTime()
  )
}