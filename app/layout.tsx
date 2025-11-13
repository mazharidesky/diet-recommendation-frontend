import type { Metadata } from "next";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import Navbar from "@/components/layouts/Navbar";
import Footer from "@/components/layouts/Footer";
import "./globals.css";

export const metadata: Metadata = {
  // title: "Diet Recommendation System",
  // description:
  //   "Sistem Rekomendasi Menu Diet dengan AI - Temukan makanan sehat yang tepat untuk program diet Anda",
  // keywords: "diet, rekomendasi, makanan sehat, AI, machine learning, nutrisi",
  // authors: [{ name: "Diet Recommendation Team" }],
  metadataBase: new URL("https://maridiet.site"),
  title: "Mari Diet ",
  description:
    "Mari Diet – Sistem rekomendasi menu diet berbasis AI yang membantu kamu mencapai berat badan ideal dengan panduan nutrisi, tips olahraga, dan pola makan sehat berkelanjutan.",
  keywords: [
    "diet sehat",
    "program diet",
    "menu diet",
    "tips diet",
    "nutrisi seimbang",
    "gaya hidup sehat",
    "menurunkan berat badan",
    "kalkulator kalori",
    "makanan sehat",
  ],
  authors: [{ name: "Mari Diet" }],
  creator: "Mari Diet",
  publisher: "Mari Diet",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "Mari Diet",
    title: "Mari Diet | Mulai Perjalanan Diet Sehatmu Hari Ini",
    description:
      "Bersama MariDiet, kamu bisa mengatur pola makan dan gaya hidup yang lebih sehat. Mulai dari panduan gizi, rekomendasi makanan, hingga tips motivasi agar tetap konsisten menjalani diet.",
    url: "https://maridiet.site",
    locale: "id_ID",
    images: {
      url: "/logo.svg", // ubah sesuai lokasi banner/logo kamu
      width: 1200,
      height: 630,
      alt: "MariDiet - Hidup Sehat dengan Cara yang Benar",
    },
  },
  icons: {
    icon: "/logo.svg", // sesuaikan dengan path favicon kamu
  },
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
