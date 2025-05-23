import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Footer from "./features/Footer/Footer";
import Header from "./features/Header/Header";
import Script from "next/script";

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
  metadataBase: new URL('https://вашсайт.ru'), // Добавлено для canonical URL
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
    "url": "https://вашсайт.ru",
  };

  return (
    <html lang="ru" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Асинхронная загрузка аналитики */}
        <Script
          strategy="afterInteractive"
          src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}', {
              page_path: window.location.pathname,
              transport_type: 'beacon',
              anonymize_ip: true
            });
          `}
        </Script>
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