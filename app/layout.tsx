import type { Metadata } from "next";
import { AgoraWagmiProvider } from "../components/WagmiProvider";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGORA — The Agentic Economy",
  description: "The On-Chain Economy Where Agents Hire Agents",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@400;700&family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@500;700&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-[#e2e2e2] overflow-x-hidden">
        <AgoraWagmiProvider>
          <Navbar />
          <main>{children}</main>
        </AgoraWagmiProvider>
      </body>
    </html>
  );
}
