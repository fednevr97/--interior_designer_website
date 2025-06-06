import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Footer from "./features/Footer/Footer";
import Header from "./features/Header/Header";

// Настройка шрифта Montserrat
const montserrat = Montserrat({
  variable: "--font-montserrat",  // CSS переменная для шрифта
  subsets: ["latin", "cyrillic"], // Поддержка латиницы и кириллицы
  weight: ["400", "600", "700"],  // Насыщенность шрифта
  display: 'swap',                // Стратегия загрузки шрифта
});

// Настройка шрифта Cormorant Garamond
const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",   // CSS переменная для шрифта
  subsets: ["latin", "cyrillic"], // Поддержка латиницы и кириллицы
  weight: ["400", "500", "600"],  // Насыщенность шрифта
  display: 'swap',                // Стратегия загрузки шрифта
});

// Метаданные для SEO
export const metadata: Metadata = {
  title: {
    default: "Дизайнер интерьера в Крыму – Дарья Шептицкая | Проекты, услуги, портфолио",  // Заголовок по умолчанию
    template: "%s | Дизайнер интерьера в Крыму и Севастополе – Дарья Шептицкая" // Шаблон для других страниц
  },
  description: "Профессиональный дизайнер интерьера Дарья Шептицкая — полный цикл работ: дизайн-проект, подбор материалов, авторский надзор. Примеры работ, услуги и контакты на сайте.", // Описание сайта
  metadataBase: new URL('https://interior-designer-website-git-main-ruslans-projects-3bb2167d.vercel.app/'), // Базовый URL
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any"},        // Основная иконка
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },  // Иконка 32x32
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },  // Иконка 16x16
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" }, // Иконка для Apple
    ],
  },
};

// Корневой компонент макета
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Структурированные данные для SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "name": "Дизайнер интерьера Шептицкая Дарья",
    "url": "https://interior-designer-website-git-main-ruslans-projects-3bb2167d.vercel.app/",
    "image": "https://interior-designer-website-inky.vercel.app/assets/Photo.webp",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Токарева, 3",
      "addressLocality": "Севастополь",
      "addressCountry": "Россия"
    },
    "telephone": "+7 (978) 662 37 81",
    "email": "me@sheptitskaja.ru",
    "sameAs": [
      "https://vk.ru/id14565500",
      "https://t.me/dariy1988"
    ]
  };

  return (
    <html lang="ru" className="scroll-smooth">
      <head>
        {/* Мета-тег для адаптивности */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* Манифест для PWA */}
        <link rel="manifest" href="/site.webmanifest" />
        {/* Канонический адрес */}
        <link rel="canonical" href="https://interior-designer-website-inky.vercel.app/" />
        {/* Open Graph разметка */}
        <meta property="og:title" content="Дизайнер интерьера | Шептицкая Дарья" />
        <meta property="og:description" content="Авторские дизайн-проекты интерьеров под ключ" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:type" content="website" />
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        {/* Структурированные данные для поисковых систем */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${montserrat.variable} ${cormorant.variable} font-sans antialiased`}>
        {/* Шапка сайта */}
        <Header />
        {/* Основной контент */}
        <main className="min-h-screen">
          {children}
        </main>
        {/* Подвал сайта */}
        <Footer />
      </body>
    </html>
  );
}