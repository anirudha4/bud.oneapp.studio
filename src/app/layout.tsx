import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import { ItemContextProvider } from "@/components/context/item-context";
import { ChatContextProvider } from "@/components/context/chat-context";

import SidebarLinks from "@/components/custom/sidebar-links";
import Image from "next/image";
import Link from "next/link";
import AppHeader from "@/components/custom/app-header";
import AIChat from "@/components/custom/ai-chat";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Bud | One App Studio",
  description: "Bud is an AI productivity app for managing notes and tasks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ItemContextProvider>
          <ChatContextProvider>
            <div className="h-screen flex bg-slate-50">
              <div className="w-[80px] bg-background h-full border-r flex flex-col">
                <Link href={'/'} className="h-16 border-b flex items-center justify-center hover:bg-slate-50 cursor-pointer">
                  <Image src={'/logo.svg'} width={30} height={30} alt="Bud Logo" />
                </Link>
                <SidebarLinks />
              </div>
              <div className="max-h-screen h-full flex-1 flex flex-col overflow-auto">
                <AppHeader />
                {children}
              </div>
              <AIChat />
            </div>
          </ChatContextProvider>
        </ItemContextProvider>
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}
