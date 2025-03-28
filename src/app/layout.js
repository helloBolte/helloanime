import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/Navbar"
import Sidebar from "@/components/Sidebar"
import BottomNavigation from "@/components/BottomNavigation"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "AnimeZone",
  description: "A modern anime streaming platform for kids and teens",
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="flex flex-col h-screen">
          <Navbar />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-3 bg-black md:pb-0">
              {children}
            </main>
          </div>
          <BottomNavigation />
          <div className="h-[calc(3rem+env(safe-area-inset-bottom))]" />
        </div>
      </body>
    </html>
  )
}
