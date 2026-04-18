import type { Metadata } from "next";
import { AgoraWagmiProvider } from "../components/WagmiProvider";
import { AgentProvider } from "../lib/AgentContext";
import Navbar from "../components/Navbar";
import "./globals.css";

export const metadata: Metadata = {
  title: "AGORA — The Agentic Economy",
  description: "The On-Chain Economy Where Agents Hire Agents",
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
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
          href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@300;400;500;600;700&family=JetBrains+Mono:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-black text-[#e2e2e2] overflow-x-hidden">
        <AgoraWagmiProvider>
          <AgentProvider>
            <Navbar />
            <main>{children}</main>
          </AgentProvider>
        </AgoraWagmiProvider>
      </body>
    </html>
  );
}
