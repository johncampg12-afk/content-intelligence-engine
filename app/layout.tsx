import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Content Intelligence Engine",
  description: "AI-powered content intelligence for social media - Predict viral content and optimize your strategy",
  keywords: "TikTok analytics, content intelligence, viral predictor, social media AI",
  authors: [{ name: "Content Intelligence Engine" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-gradient-to-br from-gray-50 to-gray-100">
        {children}
      </body>
    </html>
  );
}