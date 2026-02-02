import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: "Daily Light | Bible Blog",
    template: "%s | Daily Light"
  },
  description: "Daily insights, reflections, and spiritual nourishment from the Bible. A modern editorial platform for your daily walk.",
  keywords: ["Bible", "Daily Devotional", "Christian Blog", "Spiritual Growth", "Bible Verses", "Daily Light"],
  authors: [{ name: "Daily Light Team" }],
  creator: "Daily Light",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dailylight.blog",
    title: "Daily Light | Bible Blog",
    description: "Daily insights, reflections, and spiritual nourishment from the Bible.",
    siteName: "Daily Light",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Light | Bible Blog",
    description: "Daily insights, reflections, and spiritual nourishment from the Bible.",
    creator: "@dailylight",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Outfit:wght@200;300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body>
        <nav className="navbar">
          <div className="nav-content">
            <a href="/" className="logo">Daily Light</a>
            <div className="nav-links">
              <a href="/">Today</a>
              <a href="/archive">The Archive</a>
            </div>
          </div>
        </nav>
        <main className="content-container">
          {children}
        </main>
        <footer className="footer">
          <p>© {new Date().getFullYear()} Daily Light — An Editorial Bible Blog</p>
        </footer>
      </body>
    </html>
  );
}
