"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Home, Flame, Calendar, History, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"

const navItems = [
  { name: "Home", icon: Home, href: "/" },
  { name: "Trending", icon: Flame, href: "/trending" },
  { name: "Schedule", icon: Calendar, href: "/schedule" },
  { name: "History", icon: History, href: "/history" },
  { name: "Profile", icon: User, href: "/profile" },
  { name: "Settings", icon: Settings, href: "/settings" },
]

export default function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 overflow-visible relative z-30">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href} className=" flex items-center justify-center">
              <motion.div
                initial={false}
                animate={
                  isActive
                    ? {
                        y: -10,
                        scale: 1.1,
                        boxShadow: "0px 0px 10px rgba(168, 85, 247, 0.6)", // Adjusted shadow color
                      }
                    : { y: 0, scale: 1, boxShadow: "none" }
                }
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                className=" h-full"
              >
                <Button
                  variant={isActive ? "bottomnav" : "ghost"}
                  size="icon"
                  className={`flex flex-col h-full w-16 items-center justify-center gap-0.5 transition-all ${
                    isActive ? "bg-purple-600" : "hover:bg-purple-600/30"
                  }`}
                >
                  <item.icon
                    className={`h-10 w-10 ${
                      isActive ? "text-white" : "text-white"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold leading-tight ${
                      isActive ? "text-white" : "text-white"
                    }`}
                  >
                    {item.name}
                  </span>
                </Button>
              </motion.div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
