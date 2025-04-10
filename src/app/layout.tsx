import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { ThemeToggle } from "@/components/ThemeToggle";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MCP.wtf - Model Context Protocol Search Engine",
  description: "Search engine for 450+ Model Context Protocol (MCP) servers across different programming languages and platforms",
  openGraph: {
    title: "MCP.wtf",
    description: "Search engine for Model Context Protocol (MCP) servers",
    siteName: "MCP.wtf",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "MCP.wtf",
    description: "Search engine for Model Context Protocol (MCP) servers"
  }
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
        <ThemeProvider>
          {/* ThemeToggle is now inside ThemeProvider where it can safely access context */}
          <div className="relative">
            <ThemeToggle />
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
