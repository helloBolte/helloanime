"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Flame, Calendar, History, Search } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Trending", icon: Flame, href: "/trending" },
  // { name: "Search", icon: Search, href: "/search" },
  { name: "Schedule", icon: Calendar, href: "/schedule" },
  { name: "History", icon: History, href: "/history" },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-xl border-t border-white/10 z-50 shadow-[0_-12px_40px_rgba(236,72,153,0.15)]">
      <div className="flex justify-around h-20 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link 
              key={item.name} 
              href={item.href} 
              className="flex items-center justify-center relative group"
            >
              <motion.div
                className="flex flex-col items-center justify-center gap-1 h-full w-16 relative"
                whileTap={{ scale: 0.95 }}
              >
                {/* Active indicator bar */}
                {isActive && (
                  <motion.div
                    layoutId="active-bar"
                    className="w-full h-1 bg-pink-400 absolute top-0 rounded-full"
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                )}

                {/* Button with instant click feedback */}
                <Button
                  variant="ghost"
                  size="icon"
                  className={`
                    w-12 h-12 rounded-2xl 
                    transition-colors
                    ${isActive 
                      ? "!bg-pink-600 shadow-pink-glow" 
                      : "bg-white/5 active:!bg-pink-600 hover:bg-white/10"}
                    focus:!bg-pink-600
                    focus:!ring-0
                  `}
                >
                  <item.icon
                    className={`h-6 w-6 ${
                      isActive ? "text-white" : "text-pink-300"
                    }`}
                  />
                </Button>

                {/* Label */}
                <span
                  className={`text-xs font-medium ${
                    isActive ? "text-pink-400" : "text-gray-400"
                  }`}
                >
                  {item.name}
                </span>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}