import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AgoraWagmiProvider } from "../components/WagmiProvider";
import Navbar from "../components/Navbar";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AGORA — Sovereign Agent Orchestration Protocol",
  description: "The On-Chain Economy Where Agents Hire Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-[#050816] text-white">
        <AgoraWagmiProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(16,185,129,0.12),_transparent_25%),#050816]">
            <Navbar />
            <main className="mx-auto max-w-7xl px-6 py-10">{children}</main>
          </div>
        </AgoraWagmiProvider>
      </body>
    </html>
  );
}
