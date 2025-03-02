import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import NavigationBar from "@/components/ui/navigation-bar";
import { Toaster } from "@/components/ui/toaster";
import { ClerkProvider } from "@clerk/nextjs";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CCISS Assistant",
  description: "Assistente virtuale del CCISS",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable}` +
            "antialiased h-screen w-screen max-h-screen max-w-screen flex flex-col items-center justify-between overflow-hidden py-2"}
        >
          <div className="flex flex-col h-full w-full max-w-[60rem] min-w-[20rem] items-start justify-between gap-2 overflow-hidden">
            <NavigationBar />
            <Toaster />
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
