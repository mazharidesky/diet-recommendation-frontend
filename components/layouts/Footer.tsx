"use client";

import { ChevronUp, Utensils, Heart, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function Footer() {
  // Test 1: Coba tanpa state dulu
  // const [showBackToTop, setShowBackToTop] = useState(false);
  const currentYear = new Date().getFullYear();

  // Test 2: Comment useEffect dulu
  /*
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  */

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const quickLinks = [
    { name: "Beranda", href: "/" },
    { name: "Makanan", href: "/foods" },
  ];

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Test 3: Struktur basic dulu */}
        <div className="py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            {/* Brand Section */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Maridiet</h3>
                  <p className="text-blue-400 text-sm font-medium">
                    Smart Diet Assistant
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-sm">
                Sistem rekomendasi menu diet cerdas untuk gaya hidup sehat Anda
              </p>
            </div>

            {/* Quick Links */}
            <div className="text-center">
              <h4 className="text-lg font-semibold text-white mb-4">
                Tautan Cepat
              </h4>
              <div className="flex flex-wrap justify-center gap-4">
                {quickLinks.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-gray-400 hover:text-white text-sm"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact Info */}
            <div className="text-center md:text-right">
              <h4 className="text-lg font-semibold text-white mb-4">Kontak</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-center md:justify-end space-x-2 text-gray-400 text-sm">
                  <MapPin className="w-4 h-4" />
                  <span>Aceh, Indonesia</span>
                </div>
                <div className="flex items-center justify-center md:justify-end space-x-2 text-gray-400 text-sm">
                  <Mail className="w-4 h-4" />
                  <span>developer@maridiet.com</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="border-t border-gray-700 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              <span>© {currentYear} Maridiet. All rights reserved.</span>
            </div>

            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <span>Made in Lhokseumawe</span>
              <Heart className="text-red-600 w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Back to Top Button - Static dulu tanpa conditional */}

      <button
        onClick={scrollToTop}
        className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-110 z-50 flex items-center justify-center group"
        aria-label="Back to top"
      >
        <ChevronUp className="w-5 h-5 transform group-hover:-translate-y-1 transition-transform duration-300" />
      </button>
    </footer>
  );
}
