"use client";

import { Utensils } from "lucide-react";
import { JSX } from "react/jsx-dev-runtime";

export default function Footer(): JSX.Element {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
              <Utensils className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold">Maridiet</span>
          </div>
          <p className="text-gray-400 mb-2">Sistem Rekomendasi Menu Diet</p>
          <p className="text-gray-500 text-sm">
            © 2024 Diet Recommendation System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
