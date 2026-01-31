import type { Metadata } from "next";
import { Fjalla_One, Inter } from "next/font/google";
import "./globals.css";

const fjalla = Fjalla_One({
  variable: "--font-fjalla",
  subsets: ["latin"],
  weight: "400",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Prometheus | Recruit with AI",
  description: "Advanced AI recruitment platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${fjalla.variable} ${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
