import type { Metadata } from "next";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import "./globals.css";
import Footer from "./features/Footer/Footer";
import Header from "./features/Header/Header";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700"],
  display: 'swap', 
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "Дизайнер интерьера | Шептицкая Дарья",
    template: "%s | Дизайнер интерьера Шептицкая Дарья"
  },
  description: "Авторские дизайн-проекты интерьеров под ключ",
  metadataBase: new URL('https://interior-designer-website-git-main-ruslans-projects-3bb2167d.vercel.app/'), 
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon", sizes: "any"},
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
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
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className={`${montserrat.variable} ${cormorant.variable} font-sans antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          className="hidden"
        />
        <Header />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}