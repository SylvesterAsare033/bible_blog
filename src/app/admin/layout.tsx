import { Cormorant_Garamond, Outfit } from "next/font/google";
import "./admin.css";

// The admin keeps the original typefaces; the reader pages use new ones.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["300", "500", "600", "700"],
  variable: "--font-outfit",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`admin-shell ${cormorant.variable} ${outfit.variable}`}>
      {children}
    </div>
  );
}
