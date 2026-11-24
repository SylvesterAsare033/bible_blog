/* eslint-disable @next/next/no-html-link-for-pages */
import type { Metadata, Viewport } from "next";
import { Newsreader, Instrument_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import ThemeToggle from "@/components/ThemeToggle";
import "./globals.css";

const newsreader = Newsreader({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-newsreader",
  display: "swap",
});

const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

// Applies the saved theme before first paint so dark-mode readers don't see
// a flash of the light theme.
const themeScript = `try{var t=localStorage.getItem("daily-light-theme");if(t==="light"||t==="dark")document.documentElement.dataset.theme=t}catch(e){}`;

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#141311" },
  ],
};

export const metadata: Metadata = {
  // Makes relative OG image URLs absolute, which WhatsApp requires.
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_PROJECT_PRODUCTION_URL
        ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
        : "https://bible-blog-seven.vercel.app"),
  ),
  title: {
    default: "Daily Light | Bible Blog",
    template: "%s | Daily Light",
  },
  description:
    "Daily insights, reflections, and spiritual nourishment from the Bible. A modern editorial platform for your daily walk.",
  keywords: [
    "Bible",
    "Daily Devotional",
    "Christian Blog",
    "Spiritual Growth",
    "Bible Verses",
    "Daily Light",
  ],
  authors: [{ name: "Daily Light Team" }],
  creator: "Daily Light",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://dailylight.blog",
    title: "Daily Light | Bible Blog",
    description:
      "Daily insights, reflections, and spiritual nourishment from the Bible.",
    siteName: "Daily Light",
  },
  twitter: {
    card: "summary_large_image",
    title: "Daily Light | Bible Blog",
    description:
      "Daily insights, reflections, and spiritual nourishment from the Bible.",
    creator: "@dailylight",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${newsreader.variable} ${instrumentSans.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <header className="site-header">
          <div className="site-header__inner">
            <a href="/" className="brand" aria-label="Daily Light — today's reflection">
              <span className="brand__mark" aria-hidden="true" />
              Daily Light
            </a>
            <nav className="site-nav" aria-label="Main">
              <a href="/">Today</a>
              <a href="/archive">Archive</a>
              <ThemeToggle />
            </nav>
          </div>
        </header>
        <main className="site-main">{children}</main>
        <footer className="site-footer">
          <div className="site-footer__inner">
            <a href="/" className="brand">
              <span className="brand__mark" aria-hidden="true" />
              Daily Light
            </a>
            <p>A short reflection on Scripture, every day.</p>
            <p>© {new Date().getFullYear()} Daily Light</p>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
