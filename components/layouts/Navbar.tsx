"use client";

import { useState, useCallback, memo, useEffect } from "react";
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
  ChevronDown,
} from "lucide-react";

const Navbar = memo(function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navigation = [
    { name: "Beranda", href: "/", icon: Home },
    { name: "Makanan", href: "/foods", icon: Utensils },
    ...(isAuthenticated
      ? [
          { name: "Rekomendasi", href: "/recommendations", icon: Star },
          { name: "Rencana Menu", href: "/mealplanning", icon: Calendar },
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
    setIsUserMenuOpen(false);
  }, [logout]);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/80 backdrop-blur-lg shadow-lg border-b border-white/20"
          : "bg-white/95 backdrop-blur-sm shadow-sm border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Desktop Navigation */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Maridiet
                </span>
                <span className="text-xs text-gray-500 font-medium -mt-1">
                  Smart Diet
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:ml-12 md:flex md:space-x-2">
              {navigation.map((item, index) => (
                <NavLink
                  key={item.name}
                  item={item}
                  isActive={isActiveRoute(item.href)}
                  index={index}
                />
              ))}
            </div>
          </div>

          {/* Desktop Auth */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated ? (
              <AuthenticatedDesktopMenu
                user={user}
                onLogout={handleLogout}
                isUserMenuOpen={isUserMenuOpen}
                toggleUserMenu={toggleUserMenu}
              />
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
      <MobileMenuOverlay
        isOpen={isMobileMenuOpen}
        navigation={navigation}
        isAuthenticated={isAuthenticated}
        user={user}
        isActiveRoute={isActiveRoute}
        onLogout={handleLogout}
        onClose={closeMobileMenu}
      />
    </nav>
  );
});

// Modern NavLink with smooth animations
const NavLink = memo(function NavLink({
  item,
  isActive,
  index,
}: {
  item: { name: string; href: string; icon: any };
  isActive: boolean;
  index: number;
}) {
  return (
    <Link
      href={item.href}
      className={`relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 transform hover:scale-105 ${
        isActive
          ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg shadow-blue-500/25"
          : "text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <item.icon
        className={`w-4 h-4 transition-transform duration-300 ${
          isActive ? "scale-110" : ""
        }`}
      />
      <span>{item.name}</span>

      {/* Active indicator */}
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full animate-pulse" />
      )}
    </Link>
  );
});

// Enhanced user menu with dropdown
const AuthenticatedDesktopMenu = memo(function AuthenticatedDesktopMenu({
  user,
  onLogout,
  isUserMenuOpen,
  toggleUserMenu,
}: {
  user: any;
  onLogout: () => void;
  isUserMenuOpen: boolean;
  toggleUserMenu: () => void;
}) {
  return (
    <div className="relative">
      <button
        onClick={toggleUserMenu}
        className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-50 transition-all duration-300 group"
      >
        <div className="relative">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
        </div>
        <div className="hidden lg:flex flex-col items-start">
          <span className="text-sm font-semibold text-gray-900">
            {user?.nama}
          </span>
          <span className="text-xs text-gray-500">{user?.email}</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform duration-300 ${
            isUserMenuOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isUserMenuOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 animate-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">{user?.nama}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
          </div>

          <Link
            href="/profile"
            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors duration-200"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-500">
              Profil Saya
            </span>
          </Link>

          <button
            onClick={onLogout}
            className="flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors duration-200 w-full text-left"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-600">Logout</span>
          </button>
        </div>
      )}
    </div>
  );
});

// Enhanced auth buttons
const UnauthenticatedDesktopMenu = memo(function UnauthenticatedDesktopMenu() {
  return (
    <div className="flex space-x-3">
      <Link
        href="/login"
        className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 rounded-xl hover:bg-gray-50 transition-all duration-300 transform hover:scale-105"
      >
        Masuk
      </Link>
      <Link
        href="/register"
        className="relative px-6 py-2.5 text-sm font-medium text-white rounded-xl transition-all duration-300 transform hover:scale-105 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        <span className="relative z-10">Daftar</span>
      </Link>
    </div>
  );
});

// Enhanced mobile menu button
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
      className="relative w-10 h-10 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors duration-300 flex items-center justify-center group"
      type="button"
    >
      <div className="relative w-5 h-5">
        <span
          className={`absolute h-0.5 w-5 bg-gray-600 transform transition-all duration-300 ${
            isOpen ? "rotate-45 top-2" : "top-1"
          }`}
        />
        <span
          className={`absolute h-0.5 w-5 bg-gray-600 transform transition-all duration-300 ${
            isOpen ? "opacity-0" : "top-2"
          }`}
        />
        <span
          className={`absolute h-0.5 w-5 bg-gray-600 transform transition-all duration-300 ${
            isOpen ? "-rotate-45 top-2" : "top-3"
          }`}
        />
      </div>
    </button>
  );
});

// Enhanced mobile menu with overlay
const MobileMenuOverlay = memo(function MobileMenuOverlay({
  isOpen,
  navigation,
  isAuthenticated,
  user,
  isActiveRoute,
  onLogout,
  onClose,
}: {
  isOpen: boolean;
  navigation: Array<{ name: string; href: string; icon: any }>;
  isAuthenticated: boolean;
  user: any;
  isActiveRoute: (href: string) => boolean;
  onLogout: () => void;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
        onClick={onClose}
      />

      {/* Menu */}
      <div className="fixed top-16 left-0 right-0 bg-white/95 backdrop-blur-lg border-b border-gray-200 z-50 md:hidden animate-in slide-in-from-top duration-300">
        <div className="px-4 py-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {navigation.map((item, index) => (
            <MobileNavLink
              key={item.name}
              item={item}
              isActive={isActiveRoute(item.href)}
              onClose={onClose}
              index={index}
            />
          ))}

          {isAuthenticated ? (
            <MobileAuthenticatedMenu user={user} onLogout={onLogout} />
          ) : (
            <MobileUnauthenticatedMenu onClose={onClose} />
          )}
        </div>
      </div>
    </>
  );
});

const MobileNavLink = memo(function MobileNavLink({
  item,
  isActive,
  onClose,
  index,
}: {
  item: { name: string; href: string; icon: any };
  isActive: boolean;
  onClose: () => void;
  index: number;
}) {
  return (
    <Link
      href={item.href}
      className={`flex items-center space-x-4 px-4 py-4 rounded-2xl text-base font-medium transition-all duration-300 ${
        isActive
          ? "text-white bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg"
          : "text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50"
      }`}
      onClick={onClose}
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
          isActive ? "bg-white/20" : "bg-gray-100"
        }`}
      >
        <item.icon className="w-5 h-5" />
      </div>
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
    <div className="border-t border-gray-200 pt-6 mt-6">
      <div className="flex items-center space-x-4 px-4 py-4 mb-4">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
          <User className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="font-semibold text-gray-900">{user?.nama}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>
      </div>

      <Link
        href="/profile"
        className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-gray-50 transition-colors duration-200 mb-2"
      >
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <Settings className="w-5 h-5 text-gray-500" />
        </div>
        <span className="font-medium">Profil Saya</span>
      </Link>

      <button
        onClick={onLogout}
        className="flex items-center space-x-4 px-4 py-4 rounded-2xl hover:bg-red-50 transition-colors duration-200 w-full text-left"
        type="button"
      >
        <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
          <LogOut className="w-5 h-5 text-red-500" />
        </div>
        <span className="font-medium text-red-600">Logout</span>
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
    <div className="border-t border-gray-200 pt-6 mt-6 space-y-3">
      <Link
        href="/login"
        className="block text-center py-4 rounded-2xl font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
        onClick={onClose}
      >
        Login
      </Link>
      <Link
        href="/register"
        className="block text-center py-4 rounded-2xl font-medium text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-[1.02]"
        onClick={onClose}
      >
        Register
      </Link>
    </div>
  );
});

export default Navbar;
