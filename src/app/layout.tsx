import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/context/Providers";

export const metadata: Metadata = {
  title: "SP Tracker — Asia Structured Products Intelligence",
  description: "Real-time tracking of structured product issuances across Asian exchanges including HKEX, SGX and major bank platforms.",
  keywords: ["Structured Products", "FCN", "ELN", "Autocallable", "HKEX", "SGX", "Asia", "结构化产品", "亚洲"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
