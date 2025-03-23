"use client"

import {Button} from "@/components/ui/button"
import {Menu} from 'lucide-react'
import {navigationItems} from "@/lib/constants/content"
import {useState} from "react"
import {SignedIn, SignedOut, SignInButton, UserButton} from "@clerk/nextjs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
            <SignedOut>
              <SignInButton mode="modal" forceRedirectUrl="/dashboard">
                <Button className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg hover:shadow-indigo-200 transition-all duration-300">
                  Get Started
                </Button>
              </SignInButton>
            </SignedOut>

            <SignedIn>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "size-10 rounded-full hover:ring-2 hover:ring-indigo-600 transition-all"
                        }
                      }}
                      signInUrl="/sign-in"
                  />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem className="cursor-pointer">
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer">
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer text-red-600">
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SignedIn>

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

//
// import { Button } from "@/components/ui/button"
// import { Menu } from 'lucide-react'
// import { useState } from "react"
// import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuSeparator,
//   DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"
// import {navigationItems} from "@/lib/constants/content"
// import {useRouter} from "next/navigation";
//
//
// export default function Header() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false)
//
//   const router = useRouter();
//
//   return (
//       <header className="px-4 lg:px-6 h-20 flex items-center fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-purple-100">
//         <nav className="flex items-center justify-between w-full max-w-7xl mx-auto">
//           <a className="flex items-center gap-2 text-2xl font-bold text-indigo-600" href="#">
//             <div
//               className="size-10 bg-indigo-600 text-white flex items-center justify-center rounded-lg rotate-3 hover:rotate-6 transition-transform">
//           <span className="font-black">FS</span>
//          </div>
//           <span
//               className="hidden sm:inline bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
//             FonoSaaS
//            </span>
//            </a>
//
//           <div
//               className={`${isMenuOpen ? 'flex' : 'hidden'} md:flex absolute md:relative top-20 md:top-0 left-0 right-0 bg-white md:bg-transparent flex-col md:flex-row gap-6 p-6 md:p-0 border-b md:border-0`}>
//             {navigationItems.map((item) => (
//                 <a
//                     key={item}
//                     className="text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors"
//                     href={`#${item.toLowerCase()}`}
//                 >
//                   {item}
//                 </a>
//             ))}
//           </div>
//
//           <div className="flex items-center gap-4">
//             <SignedOut>
//               <Button
//                   className="bg-white text-purple-600 hover:bg-purple-50 border border-purple-200"
//                   variant="outline"
//               >
//                 Login
//               </Button>
//               <Button
//                   className="bg-purple-600 text-white hover:bg-purple-700 shadow-lg hover:shadow-purple-200 transition-all duration-300"
//                   onClick={() => {
//                       router.push("/sign-up")
//                   }}
//               >
//                 Comece Agora
//               </Button>
//             </SignedOut>
//
//             <SignedIn>
//               <DropdownMenu>
//                 <DropdownMenuTrigger asChild>
//                   <UserButton
//                       appearance={{
//                         elements: {
//                           avatarBox: "size-10 rounded-full hover:ring-2 hover:ring-purple-600 transition-all"
//                         }
//                       }}
//                       signInUrl="/entrar"
//                   />
//                 </DropdownMenuTrigger>
//                 <DropdownMenuContent align="end" className="w-56">
//                   <DropdownMenuItem className="cursor-pointer">
//                     Minha Conta
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="cursor-pointer">
//                     Minhas Consultas
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="cursor-pointer">
//                     Resultados de Exames
//                   </DropdownMenuItem>
//                   <DropdownMenuItem className="cursor-pointer">
//                     Configurações
//                   </DropdownMenuItem>
//                   <DropdownMenuSeparator/>
//                   <DropdownMenuItem className="cursor-pointer text-red-600">
//                     Sair
//                   </DropdownMenuItem>
//                 </DropdownMenuContent>
//               </DropdownMenu>1
//             </SignedIn>
//
//             <Button
//                 variant="ghost"
//                 size="icon"
//                 className="md:hidden"
//                 onClick={() => setIsMenuOpen(!isMenuOpen)}
//             >
//               <Menu className="size-5"/>
//             </Button>
//           </div>
//         </nav>
//       </header>
//   )
// }