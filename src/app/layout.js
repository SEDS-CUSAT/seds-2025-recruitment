import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: "SEDS CUSAT Recruitment 2025 | Students for the Exploration and Development of Space",
  description: "Join the Students for the Exploration and Development of Space (SEDS) CUSAT chapter for our 2025 recruitment drive!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/ires-seds-logo.jpg" />
      </head>
      <body className={`${inter.variable} font-sans antialiased bg-gradient-to-b`}>
        <div className="min-h-screen relative">
          {children}
        </div>
      </body>
    </html>
  );
}
