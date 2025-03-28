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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 relative z-30">
      <div className="flex justify-around h-16">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href} className="inline-flex">
              <motion.div
                className="inline-flex"
                initial={false}
                animate={
                  isActive
                    ? {
                        y: -10,
                        scale: 1.1,
                        boxShadow: "0px 0px 10px rgba(168, 85, 247, 0.6)",
                      }
                    : { y: 0, scale: 1, boxShadow: "none" }
                }
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  variant={isActive ? "bottomnav" : "ghost"}
                  size="icon"
                  className={`flex flex-col items-center justify-center gap-0.5 transition-all ${
                    isActive ? "bg-purple-600" : "hover:bg-purple-600/30"
                  }`}
                >
                  <item.icon className="h-10 w-10 text-white" />
                  <span className="text-[10px] font-bold leading-tight text-white">
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
