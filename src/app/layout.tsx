import type { Metadata } from "next";
import { DM_Sans, Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "NOVERA",
  description: "Premium AI-powered conversational experience",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${dmSans.variable} ${inter.variable} h-full scroll-smooth`}
      >
        <body className="min-h-full flex flex-col font-light antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
