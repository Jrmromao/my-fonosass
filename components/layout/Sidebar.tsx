'use client';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { APP_NAME } from '@/utils/constants';
import { useClerk, useUser } from '@clerk/nextjs';
import { BarChart2, BookOpen, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Footer from './footer';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true); // Start collapsed to match server
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const pathname = usePathname();
  const { signOut } = useClerk();
  const { user } = useUser();
  const router = useRouter();

  const userRole = useUserRole();

  const sidebarItems = [
    {
      title: 'Painel',
      icon: BarChart2,
      href: '/dashboard',
    },
    // {
    //   title: 'Exercícios',
    //   icon: FileText,
    //   href: '/dashboard/games',
    // },
    // {
    //   title: 'Meu Perfil',
    //   icon: User,
    //   href: '/dashboard/profile',
    // },
    // Admin only items
    ...(userRole.role === 'ADMIN'
      ? [
          {
            title: 'Recursos',
            icon: BookOpen,
            href: '/dashboard/resources',
          },
        ]
      : []),
    // {
    //     title: "Meus Dados",
    //     icon: Shield,
    //     href: "/data-rights",
    // },
    // {
    //     title: "Pacientes",
    //     icon: Users,
    //     href: "/dashboard/patient",
    //     iconPlaceholder: "👥", // Placeholder for custom icon
    // },
    // {
    //     title: "Configurações",
    //     icon: Settings,
    //     href: "/dashboard/settings",
    //     iconPlaceholder: "⚙️", // Placeholder for custom icon
    // }
  ];

  // Handle hydration and resize
  useEffect(() => {
    // Mark as hydrated
    setIsHydrated(true);

    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 768) {
        // md breakpoint for tablet experience
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Reset mobile menu state on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Mobile menu button with improved positioning
  const MobileMenuButton = () => (
    <Button
      variant="ghost"
      size="icon"
      className="md:hidden fixed top-4 left-4 z-50 rounded-full bg-white shadow-md hover:bg-gray-100"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      {isMobileMenuOpen ? (
        <X className="h-5 w-5 text-gray-700" />
      ) : (
        <Menu className="h-5 w-5 text-gray-700" />
      )}
    </Button>
  );

  return (
    <div suppressHydrationWarning={true}>
      <MobileMenuButton />

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen flex flex-col bg-gray-900 transition-all duration-300 ease-in-out overflow-hidden',
          isCollapsed ? 'w-16' : 'w-56',
          isMobileMenuOpen
            ? 'translate-x-0 shadow-xl'
            : '-translate-x-full md:translate-x-0',
          className
        )}
        suppressHydrationWarning={true}
      >
        {/* Logo area */}
        <div className="h-20 flex items-center border-b border-gray-800/50">
          <div className="flex items-center justify-center w-full">
            <div
              className={`relative transition-all duration-300 ${
                !isHydrated || isCollapsed ? 'h-14 w-14' : 'h-20 w-20'
              }`}
            >
              <Image
                src="/images/logo.png"
                alt="Almanaque da Fala Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            {isHydrated && !isCollapsed && (
              <span className="sr-only">{APP_NAME}</span>
            )}
          </div>

          {/* Collapse toggle for desktop */}
          {isHydrated && !isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto mr-2 hidden md:flex text-gray-500 hover:text-white hover:bg-white/10 rounded-md h-7 w-7 p-0"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M15 6L9 12L15 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          )}

          {/* Expand toggle for collapsed state */}
          {isHydrated && isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-4 -right-3 hidden md:flex text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full w-6 h-6 p-0 shadow-lg border border-gray-200 dark:border-gray-700"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <svg
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 6L15 12L9 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          )}
        </div>

        {/* Nav items with professional styling */}
        <nav
          className={`flex-1 overflow-y-auto transition-all duration-300 ${!isHydrated || isCollapsed ? 'px-2 py-4' : 'px-3 py-4'}`}
        >
          <ul
            className={`space-y-1 ${!isHydrated || isCollapsed ? 'space-y-2' : ''}`}
          >
            {sidebarItems.map((item) => {
              const isActive =
                pathname === item.href ||
                (pathname.startsWith(item.href + '/') &&
                  item.href !== '/dashboard') ||
                (item.href === '/dashboard' && pathname === '/dashboard');
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center rounded-lg transition-all duration-200 group relative',
                      !isHydrated || isCollapsed
                        ? 'justify-center p-3 mx-1'
                        : 'px-3 py-2.5',
                      isActive
                        ? 'bg-white/10 text-white font-medium'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    )}
                    title={!isHydrated || isCollapsed ? item.title : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon
                        className={cn(
                          'flex-shrink-0 transition-colors',
                          isActive
                            ? 'text-white'
                            : 'text-gray-500 group-hover:text-gray-300',
                          !isHydrated || isCollapsed
                            ? 'h-5 w-5'
                            : 'h-[18px] w-[18px]'
                        )}
                      />
                    </div>

                    {isHydrated && !isCollapsed && (
                      <span
                        className="ml-3 text-sm font-medium"
                        suppressHydrationWarning={true}
                      >
                        {item.title}
                      </span>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isHydrated && isCollapsed && (
                      <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                        {item.title}
                      </div>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User profile section */}
        {user && (
          <div className="mt-auto border-t border-gray-800/50 p-3 overflow-hidden">
            <div
              className={cn(
                'flex items-center',
                isCollapsed && 'justify-center'
              )}
            >
              <Footer isCollapsed={isCollapsed} />
            </div>
          </div>
        )}
      </aside>

      {/* Content wrapper */}
      <div
        className={cn(
          'min-h-screen transition-all duration-300',
          isCollapsed ? 'md:ml-16' : 'md:ml-56'
        )}
      ></div>
    </div>
  );
}
