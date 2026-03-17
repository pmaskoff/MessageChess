import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import NavBar from "@/components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Message Chess | Review Important Conversations",
  description:
    "Chess-style reviews for important conversations. Upload a screenshot, study the critical moments, and plan your next move.",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 min-h-screen antialiased flex flex-col`}>
        <NavBar />
        <main className="flex-1">
          {children}
        </main>
        <Toaster theme="dark" position="top-center" />
      </body>
    </html>
  );
}
