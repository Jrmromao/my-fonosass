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

      {/* Sidebar with professional styling */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-40 h-screen flex flex-col bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 ease-in-out',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileMenuOpen
            ? 'translate-x-0 shadow-xl'
            : '-translate-x-full md:translate-x-0',
          className
        )}
        suppressHydrationWarning={true}
      >
        {/* Logo area */}
        <div
          className={`${!isHydrated || isCollapsed ? 'h-16' : 'h-20'} flex items-center border-b border-gray-200 dark:border-gray-800 transition-all duration-300`}
        >
          <div
            className={`flex items-center ${!isHydrated || isCollapsed ? 'justify-center w-full px-2' : 'space-x-3 px-4'}`}
          >
            <div
              className={`relative transition-all duration-300 ${
                !isHydrated || isCollapsed ? 'h-16 w-16' : 'h-24 w-24'
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
              <div className="flex flex-col">
                <span className="text-base font-bold text-gray-900 dark:text-white leading-tight">
                  {APP_NAME}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Fonoaudiologia
                </span>
              </div>
            )}
          </div>

          {/* Collapse toggle for desktop */}
          {isHydrated && !isCollapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto hidden md:flex text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
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
          className={`flex-1 overflow-y-auto transition-all duration-300 ${!isHydrated || isCollapsed ? 'px-2 py-4' : 'px-3 py-6'}`}
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
                        : 'px-4 py-3',
                      isActive
                        ? 'bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-800/60 dark:hover:to-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400'
                    )}
                    title={!isHydrated || isCollapsed ? item.title : undefined}
                  >
                    <div className="flex items-center gap-2">
                      <item.icon
                        className={cn(
                          'flex-shrink-0 transition-all duration-200',
                          isActive
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400',
                          !isHydrated || isCollapsed ? 'h-6 w-6' : 'h-5 w-5'
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
          <div className="mt-auto border-t border-gray-200 dark:border-gray-800 p-4">
            <div
              className={cn(
                'flex items-center',
                !isCollapsed && 'justify-between',
                isCollapsed && 'flex-col gap-3 items-center'
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
          isCollapsed ? 'md:ml-20' : 'md:ml-64'
        )}
      ></div>
    </div>
  );
}
