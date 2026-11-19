'use client';
import { Button } from '@/components/ui/button';
import { useUserRole } from '@/hooks/useUserRole';
import { cn } from '@/lib/utils';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  BarChart2,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FolderCog,
  Menu,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Logo } from '@/components/brand/Logo';
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
    { title: 'Painel', icon: BarChart2, href: '/dashboard' },
    { title: 'Biblioteca', icon: BookOpen, href: '/dashboard/biblioteca' },
    // Admin only
    ...(userRole.role === 'ADMIN'
      ? [
          {
            title: 'Recursos',
            icon: FolderCog,
            href: '/dashboard/resources',
          },
          {
            title: 'Correções LGPD',
            icon: ShieldCheck,
            href: '/dashboard/correcoes',
          },
          {
            title: 'Auditoria',
            icon: ClipboardList,
            href: '/dashboard/auditoria',
          },
        ]
      : []),
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
      className="md:hidden fixed top-4 left-4 z-50 rounded-full bg-white shadow-md hover:bg-neutral-100"
      onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
    >
      {isMobileMenuOpen ? (
        <X className="h-5 w-5 text-neutral-700" />
      ) : (
        <Menu className="h-5 w-5 text-neutral-700" />
      )}
    </Button>
  );

  return (
    <div suppressHydrationWarning={true}>
      <MobileMenuButton />

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40 transition-opacity duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          // "Lúdico refinado": a white rounded card floating on the lavender.
          'fixed top-0 left-0 z-40 h-screen p-3 bg-violet-100 transition-all duration-200',
          isCollapsed ? 'w-20' : 'w-64',
          isMobileMenuOpen
            ? 'translate-x-0'
            : '-translate-x-full md:translate-x-0',
          className
        )}
        suppressHydrationWarning={true}
      >
        <div className="relative flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-sm">
          {/* Logo area. The collapse/expand toggle lives here in both states:
              beside the logo when open, right under it when collapsed. */}
          <div
            className={cn(
              'flex items-center',
              !isHydrated || isCollapsed
                ? 'flex-col justify-center gap-1 pt-4'
                : 'h-28'
            )}
          >
            {!isHydrated || isCollapsed ? (
              <Logo size="icon" href="/dashboard" priority />
            ) : (
              <div className="flex flex-1 justify-center pl-9">
                <Logo size="lg" href="/dashboard" priority />
              </div>
            )}

            {isHydrated && (
              <Button
                variant="ghost"
                size="sm"
                aria-label={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                title={isCollapsed ? 'Expandir menu' : 'Recolher menu'}
                aria-expanded={!isCollapsed}
                className={cn(
                  'hidden h-7 w-7 rounded-md p-0 text-neutral-600 hover:bg-violet-50 hover:text-violet-950 md:flex',
                  !isCollapsed && 'ml-auto mr-2'
                )}
                onClick={() => setIsCollapsed(!isCollapsed)}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" aria-hidden />
                ) : (
                  <ChevronLeft className="h-4 w-4" aria-hidden />
                )}
              </Button>
            )}
          </div>

          {/* Nav items with professional styling */}
          <nav
            className={`flex-1 overflow-y-auto overflow-x-hidden transition-all duration-300 ${!isHydrated || isCollapsed ? 'px-2 py-4' : 'px-4 py-4'}`}
          >
            <ul className="space-y-2">
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
                        'flex items-center rounded-2xl font-semibold transition-all duration-200 group relative',
                        !isHydrated || isCollapsed
                          ? 'justify-center p-2.5'
                          : 'px-4 py-3',
                        isActive
                          ? 'bg-sun-300 text-violet-950'
                          : 'text-neutral-600 hover:bg-violet-50 hover:text-violet-950'
                      )}
                      title={
                        !isHydrated || isCollapsed ? item.title : undefined
                      }
                    >
                      <div className="flex items-center gap-2">
                        <item.icon
                          className={cn(
                            'flex-shrink-0 transition-colors',
                            isActive
                              ? 'text-violet-950'
                              : 'text-neutral-600 group-hover:text-violet-950',
                            'h-5 w-5'
                          )}
                        />
                      </div>

                      {isHydrated && !isCollapsed && (
                        <span
                          className="ml-3 text-sm"
                          suppressHydrationWarning={true}
                        >
                          {item.title}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* User profile section */}
          {user && (
            <div className="mt-auto border-t border-violet-100 p-3 overflow-hidden">
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
        </div>
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
