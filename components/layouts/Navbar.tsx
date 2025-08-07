"use client";

import { useState, useCallback, memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Menu,
  X,
  User,
  LogOut,
  Home,
  Utensils,
  Star,
  Settings,
  Calendar,
} from "lucide-react";

const Navbar = memo(function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Makanan", href: "/foods", icon: Utensils },
    ...(isAuthenticated
      ? [
          { name: "Rekomendasi", href: "/recommendations", icon: Star },
          { name: "Meal Planning", href: "/mealplanning", icon: Calendar },
          { name: "Profil", href: "/profile", icon: Settings },
        ]
      : []),
  ];

  const isActiveRoute = useCallback(
    (href: string) => {
      if (href === "/") {
        return pathname === "/";
      }
      return pathname.startsWith(href);
    },
    [pathname]
  );

  const handleLogout = useCallback(() => {
    logout();
    setIsMobileMenuOpen(false);
  }, [logout]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <Utensils className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">Maridiet</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-10 md:flex md:space-x-8 ">
              {navigation.map((item) => (
                <NavLink
                  key={item.name}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                />
              ))}
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <AuthenticatedDesktopMenu user={user} onLogout={handleLogout} />
            ) : (
              <UnauthenticatedDesktopMenu />
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <MobileMenuButton
              isOpen={isMobileMenuOpen}
              onToggle={toggleMobileMenu}
            />
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <MobileMenu
          navigation={navigation}
          isAuthenticated={isAuthenticated}
          user={user}
          isActiveRoute={isActiveRoute}
          onLogout={handleLogout}
          onClose={closeMobileMenu}
        />
      )}
    </nav>
  );
});

// Separate components to avoid serialization issues
const NavLink = memo(function NavLink({
  item,
  isActive,
}: {
  item: { name: string; href: string; icon: any };
  isActive: boolean;
}) {
  return (
    <Link
      href={item.href}
      className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? "text-blue-600 bg-blue-50"
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
      }`}
    >
      <item.icon className="w-4 h-4" />
      <span>{item.name}</span>
    </Link>
  );
});

const AuthenticatedDesktopMenu = memo(function AuthenticatedDesktopMenu({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <div className="flex items-center space-x-4">
      <div className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user?.nama}
          </span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </div>
      <LogoutButton onLogout={onLogout} />
    </div>
  );
});

const UnauthenticatedDesktopMenu = memo(function UnauthenticatedDesktopMenu() {
  return (
    <div className="flex space-x-4">
      <Link
        href="/login"
        className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
      >
        Register
      </Link>
    </div>
  );
});

const LogoutButton = memo(function LogoutButton({
  onLogout,
}: {
  onLogout: () => void;
}) {
  return (
    <button
      onClick={onLogout}
      className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
      type="button"
    >
      <LogOut className="w-4 h-4" />
      <span>Logout</span>
    </button>
  );
});

const MobileMenuButton = memo(function MobileMenuButton({
  isOpen,
  onToggle,
}: {
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className="text-gray-600 hover:text-gray-900 p-2"
      type="button"
    >
      {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
    </button>
  );
});

const MobileMenu = memo(function MobileMenu({
  navigation,
  isAuthenticated,
  user,
  isActiveRoute,
  onLogout,
  onClose,
}: {
  navigation: Array<{ name: string; href: string; icon: any }>;
  isAuthenticated: boolean;
  user: any;
  isActiveRoute: (href: string) => boolean;
  onLogout: () => void;
  onClose: () => void;
}) {
  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
        {navigation.map((item) => (
          <MobileNavLink
            key={item.name}
            item={item}
            isActive={isActiveRoute(item.href)}
            onClose={onClose}
          />
        ))}

        {isAuthenticated ? (
          <MobileAuthenticatedMenu user={user} onLogout={onLogout} />
        ) : (
          <MobileUnauthenticatedMenu onClose={onClose} />
        )}
      </div>
    </div>
  );
});

const MobileNavLink = memo(function MobileNavLink({
  item,
  isActive,
  onClose,
}: {
  item: { name: string; href: string; icon: any };
  isActive: boolean;
  onClose: () => void;
}) {
  return (
    <Link
      href={item.href}
      className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
        isActive
          ? "text-blue-600 bg-blue-50"
          : "text-gray-700 hover:text-blue-600 hover:bg-gray-50"
      }`}
      onClick={onClose}
    >
      <item.icon className="w-4 h-4" />
      <span>{item.name}</span>
    </Link>
  );
});

const MobileAuthenticatedMenu = memo(function MobileAuthenticatedMenu({
  user,
  onLogout,
}: {
  user: any;
  onLogout: () => void;
}) {
  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center space-x-2 px-3 py-2">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-gray-900">
            {user?.nama}
          </span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="flex items-center space-x-2 text-red-600 hover:text-red-800 w-full px-3 py-2 rounded-md text-base font-medium"
        type="button"
      >
        <LogOut className="w-4 h-4" />
        <span>Logout</span>
      </button>
    </div>
  );
});

const MobileUnauthenticatedMenu = memo(function MobileUnauthenticatedMenu({
  onClose,
}: {
  onClose: () => void;
}) {
  return (
    <div className="border-t border-gray-200 pt-4 space-y-1">
      <Link
        href="/login"
        className="block text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium"
        onClick={onClose}
      >
        Login
      </Link>
      <Link
        href="/register"
        className="block bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-base font-medium"
        onClick={onClose}
      >
        Register
      </Link>
    </div>
  );
});

export default Navbar;
