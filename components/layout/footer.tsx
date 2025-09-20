"use client";
import { cn } from "@/lib/utils";
import { useClerk, useUser } from "@clerk/nextjs";
import {
  ChevronUp,
  HelpCircle,
  LogOut,
  User as UserIcon,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";

const formatUsername = (user: any): string => {
  if (!user) return "Usuário";
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  if (user.firstName) return user.firstName;
  if (user.emailAddresses?.[0]?.emailAddress) {
    const email = user.emailAddresses[0].emailAddress;
    const cleanEmail = email.split("+")[0];
    const localPart = cleanEmail.split("@")[0];
    return localPart
      .split(/[._]/)
      .map(
        (part: string) =>
          part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
      )
      .join(" ");
  }
  return "Usuário";
};

const getGravatarURL = (email: string | undefined, size: number = 80) => {
  if (!email) return null;
  // Use Clerk's built-in avatar or fallback to Gravatar
  return `https://www.gravatar.com/avatar/${email.trim().toLowerCase()}?s=${size}&d=mp`;
};

interface MenuItem {
  label: string;
  icon: React.ReactNode;
  action: () => void;
  variant?: "default" | "danger";
}

interface FooterProps {
  isCollapsed?: boolean;
}

const Footer = ({ isCollapsed = false }: FooterProps) => {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Show loading state until both mounted and user data is loaded
  if (!isMounted || !isLoaded || !user) {
    return (
      <div className="relative w-full">
        <div
          className={cn("flex items-center gap-3 w-full p-2 rounded-lg", {
            "justify-center": isCollapsed,
          })}
        >
          <div className="size-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          )}
        </div>
      </div>
    );
  }

  const username = formatUsername(user);
  const firstLetter = username.charAt(0).toUpperCase();
  const userEmail = user.emailAddresses?.[0]?.emailAddress;
  const gravatarURL = getGravatarURL(userEmail, 40);

  const createAction = (path: string) => () => {
    router.push(path);
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await signOut();
    router.push("/sign-in");
    router.refresh();
  };

  const menuItems: MenuItem[] = [
    {
      label: "Meu Perfil",
      icon: <UserIcon className="size-4" />,
      action: createAction("/dashboard/profile"),
    },

    {
      label: "Ajuda",
      icon: <HelpCircle className="size-4" />,
      action: createAction("/help"),
    },
    {
      label: "Sair",
      icon: <LogOut className="size-4" />,
      action: handleLogout,
      variant: "danger",
    },
  ];

  const AvatarTrigger = (
    <button
      onClick={() => setIsMenuOpen(!isMenuOpen)}
      aria-haspopup="true"
      aria-expanded={isMenuOpen}
      className={cn(
        "flex items-center gap-3 w-full p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-800",
        { "justify-center": isCollapsed },
      )}
    >
      <div className="relative flex items-center justify-center size-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg transition-all duration-200 overflow-hidden">
        {user.imageUrl ? (
          <img
            src={user.imageUrl}
            alt={`Avatar de ${username}`}
            className="w-full h-full object-cover"
          />
        ) : gravatarURL ? (
          <img
            src={gravatarURL}
            alt={`Avatar de ${username}`}
            className="w-full h-full object-cover"
          />
        ) : (
          firstLetter
        )}
      </div>
      {!isCollapsed && (
        <>
          <div className="flex-1 min-w-0 text-left">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
              {username}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              FonoSaaS
            </p>
          </div>
          <ChevronUp
            className={cn("size-4 text-gray-500 transition-transform", {
              "rotate-180": isMenuOpen,
            })}
          />
        </>
      )}
    </button>
  );

  const Menu = (
    <div
      role="menu"
      className={cn(
        "fixed bg-white dark:bg-gray-900 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700/50 z-[9999] min-w-[240px] transition-all duration-200 ease-in-out",
        "transform opacity-0 scale-95 pointer-events-none",
        isMenuOpen && "transform opacity-100 scale-100 pointer-events-auto",
        {
          "left-20 bottom-4": isCollapsed,
          "left-4 bottom-20": !isCollapsed,
        },
      )}
    >
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <p className="text-sm font-semibold text-gray-900 dark:text-white">
          {username}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
          {userEmail}
        </p>
        <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
          Almanaque da Fala
        </p>
      </div>
      <div className="py-2" role="none">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            role="menuitem"
            className={cn(
              "flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors duration-200 text-left",
              {
                "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800":
                  item.variant !== "danger",
                "text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20":
                  item.variant === "danger",
              },
            )}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div ref={menuRef} className="relative w-full z-[10000]">
      {Menu}
      {AvatarTrigger}
    </div>
  );
};

export default Footer;