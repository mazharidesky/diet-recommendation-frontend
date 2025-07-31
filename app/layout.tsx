import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Diet Recommendation System",
  description:
    "Sistem Rekomendasi Menu Diet dengan AI - Temukan makanan sehat yang tepat untuk program diet Anda",
  keywords: "diet, rekomendasi, makanan sehat, AI, machine learning, nutrisi",
  authors: [{ name: "Diet Recommendation Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full">
      <body className="h-full min-h-screen flex flex-col bg-gray-50">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              className: "",
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "8px",
                padding: "12px 16px",
              },
              success: {
                iconTheme: {
                  primary: "#10b981",
                  secondary: "#fff",
                },
                style: {
                  background: "#10b981",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#fff",
                },
                style: {
                  background: "#ef4444",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
