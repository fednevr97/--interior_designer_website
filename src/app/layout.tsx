import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Footer from "./features/Footer/Footer";
import Header from "./features/Header/Header";

// Оптимизация шрифтов
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: 'swap', // Добавлено для оптимизации отображения
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"], // Убраны лишние начертания
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Дизайн интерьера | Студия [Имя Фамилия]",
    template: "%s | Студия дизайна [Имя]"
  },
  description: "Авторские дизайн-проекты интерьеров под ключ",
  metadataBase: new URL('https://interior-designer-website-git-main-ruslans-projects-3bb2167d.vercel.app/'), // Добавлено для canonical URL
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Дизайнер интерьера Шептицкая Дарья",
    "url": "https://interior-designer-website-git-main-ruslans-projects-3bb2167d.vercel.app/",
  };

  return (
    <html lang="ru" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={`${montserrat.variable} ${cormorant.variable} font-sans antialiased`}>
        {/* JSON-LD для SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          className="hidden" // Скрываем от видимого интерфейса
        />
        
        {/* Основная структура страницы */}
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}