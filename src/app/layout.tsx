import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: "Copa Queen - Campeonato de Free Fire",
  description: "Plataforma oficial do campeonato Copa Queen de Free Fire. Inscreva sua equipa, acompanhe a classificação e ranking de MVP.",
  keywords: ["Free Fire", "campeonato", "Copa Queen", "esports", "torneio"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt">
      <body className={outfit.variable}>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  );
}
