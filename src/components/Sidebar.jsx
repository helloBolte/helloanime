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

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <motion.aside
      initial={{ width: 64 }}
      className="hidden md:flex flex-col h-full bg-gray-800 overflow-visible"
    >
      <nav className="flex flex-col space-y-1 w-full mt-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href

          return (
            <Link key={item.name} href={item.href}>
              <motion.div
                initial={false}
                animate={
                  isActive
                    ? {
                        scale: 1.1,
                        x: 10,
                        boxShadow: "0px 0px 10px rgba(168, 85, 247, 0.6)", // Adjusted shadow color
                      }
                    : { scale: 1, x: 0, boxShadow: "none" }
                }
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Button
                  variant={isActive ? "sidebar" : "ghost"}
                  className={`w-full flex flex-col h-14 gap-1 transition-all ${
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
      </nav>
    </motion.aside>
  )
}
