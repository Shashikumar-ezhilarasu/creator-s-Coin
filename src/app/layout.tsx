import type { Metadata } from "next";
import "./globals.css";
import { Web3Provider } from "@/context/Web3Context";
import Navigation from "@/components/Navigation";

export const metadata: Metadata = {
  title: "CreatorWeb3 - Decentralized Creator Token Marketplace",
  description: "A Web3 platform for creators to tokenize their content and for supporters to access exclusive content through creator tokens.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-gray-50 min-h-screen">
        <Web3Provider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </Web3Provider>
      </body>
    </html>
  );
}
