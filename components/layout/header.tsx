"use client"

import { Button } from "@/components/ui/button"
import { Menu } from 'lucide-react'
import { navigationItems } from "@/lib/constants/content"
import { useState } from "react"

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="px-4 lg:px-6 h-20 flex items-center fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-indigo-100">
      <nav className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <a className="flex items-center gap-2 text-2xl font-bold text-indigo-600" href="#">
          <div className="size-10 bg-indigo-600 text-white flex items-center justify-center rounded-lg rotate-3 hover:rotate-6 transition-transform">
            <span className="font-black">FS</span>
          </div>
          <span className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
            FonoSaaS
          </span>
        </a>

        <div className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-20 md:top-0 left-0 right-0 bg-white md:bg-transparent flex-col md:flex-row gap-6 p-6 md:p-0 border-b md:border-0`}>
          {navigationItems.map((item) => (
            <a
              key={item}
              className="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
              href={`#${item.toLowerCase()}`}
            >
              {item}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all duration-300">
            Comece Agora
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </nav>
    </header>
  )
}