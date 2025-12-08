import { Outfit } from "next/font/google"; // Premium Tech Font
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata = {
  title: "LectureAI Pro",
  description: "Advanced Neural Study Companion",
  // --- UPDATED BLUE BRAIN ICON ---
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2306b6d4' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'><path d='M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-4A2.5 2.5 0 0 1 9.5 2Z'/><path d='M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-4A2.5 2.5 0 0 0 14.5 2Z'/></svg>",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className={`${outfit.className} bg-[#020617] text-white antialiased selection:bg-cyan-500/30 selection:text-cyan-100`}>
        {children}
      </body>
    </html>
  );
}