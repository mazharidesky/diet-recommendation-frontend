"use client";

import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary-500">404</h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Halaman Tidak Ditemukan
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Maaf, halaman yang Anda cari tidak dapat ditemukan.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center bg-primary-500 hover:bg-primary-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
