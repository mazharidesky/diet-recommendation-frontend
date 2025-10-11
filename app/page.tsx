"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { foodService, recommendationService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import FoodCard from "@/components/partials/Foodcard";
import { Food, FoodCategory, MethodInfo } from "@/types";
import {
  Utensils,
  Users,
  Star,
  TrendingUp,
  ArrowRight,
  Brain,
  Zap,
  Heart,
  Award,
  CheckCircle,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [featuredFoods, setFeaturedFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [methodInfo, setMethodInfo] = useState<MethodInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInitialData();
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    try {
      const [foodsResponse, categoriesResponse] = await Promise.all([
        foodService.getFoods({ per_page: 6 }),
        foodService.getCategories(),
      ]);

      setFeaturedFoods(foodsResponse.foods || []);
      setCategories(categoriesResponse.categories || []);

      // Get recommendation info if authenticated
      if (isAuthenticated) {
        try {
          const methodResponse = await recommendationService.getMethodInfo();
          setMethodInfo(methodResponse);
        } catch (error) {
          console.error("Error fetching method info:", error);
        }
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast.error("Gagal memuat data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 mt-16">
              Sistem Rekomendasi Menu Diet
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              Temukan makanan sehat yang tepat untuk program diet Anda
            </p>

            {/* Enhanced CTA based on auth status */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Link
                    href="/register"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                  >
                    Mulai Sekarang
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                  <Link
                    href="/foods"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                  >
                    <Utensils className="mr-2 w-5 h-5" />
                    Lihat Makanan
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/recommendations"
                    className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                  >
                    <Star className="mr-2 w-5 h-5" />
                    Dapatkan Rekomendasi
                  </Link>
                  {/* <Link
                    href="/meal-planning"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
                  >
                    <Award className="mr-2 w-5 h-5" />
                    Meal Planning
                  </Link> */}
                </>
              )}
            </div>

            {/* User welcome message */}
            {isAuthenticated && user && (
              <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
                <p className="text-blue-100">
                  Selamat datang{" "}
                  <span className="font-semibold">{user.nama}</span>!
                </p>
                {methodInfo && (
                  <p className="text-sm text-blue-200 mt-1">
                    Menggunakan metode{" "}
                    {methodInfo.data.current_method.replace("_", " ")} dengan{" "}
                    {methodInfo.data.total_users} pengguna aktif
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Teknologi AI Terdepan
            </h2>
            <p className="text-lg text-gray-600">
              Sistem rekomendasi yang cerdas dan terus belajar dari preferensi
              Anda
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Content-Based */}
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Content-Based Filtering
              </h3>
              <p className="text-gray-600">
                Rekomendasi berdasarkan karakteristik makanan dan profil
                kesehatan Anda
              </p>
            </div>

            {/* Collaborative */}
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Collaborative Filtering
              </h3>
              <p className="text-gray-600">
                Belajar dari pengguna dengan preferensi serupa untuk rekomendasi
                yang lebih akurat
              </p>
              {methodInfo && (
                <div className="mt-2">
                  {methodInfo.data.collaborative_available ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Aktif
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      Butuh{" "}
                      {methodInfo.data.users_needed_for_collaborative -
                        methodInfo.data.total_users}{" "}
                      pengguna lagi
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Hybrid */}
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Hybrid System
              </h3>
              <p className="text-gray-600">
                Kombinasi optimal dari berbagai metode untuk hasil terbaik
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* System Stats */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">500+</h3>
              <p className="text-gray-600">Variasi Makanan Sehat</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {methodInfo?.data.total_users || "50+"}
              </h3>
              <p className="text-gray-600">Pengguna Aktif</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                {methodInfo?.data.total_ratings_in_system || "1000+"}
              </h3>
              <p className="text-gray-600">Rating Makanan</p>
            </div>
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-2">
                AI-Powered
              </h3>
              <p className="text-gray-600">Sistem Rekomendasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Foods */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Makanan Diet Populer
            </h2>
            <p className="text-lg text-gray-600">
              Pilihan makanan sehat dengan rating tinggi dari pengguna
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {featuredFoods.map((food) => (
              <FoodCard
                key={food.food_id}
                food={food}
                showRating={isAuthenticated}
              />
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/foods"
              className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors inline-flex items-center"
            >
              Lihat Semua Makanan
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Preview */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Kategori Makanan
            </h2>
            <p className="text-lg text-gray-600">
              Jelajahi berbagai kategori makanan sehat
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.category_id}
                href={`/foods?category_id=${category.category_id}`}
                className="bg-white hover:bg-blue-50 p-6 rounded-lg text-center transition-colors group border border-gray-200 hover:border-blue-200"
              >
                <div className="bg-blue-100 group-hover:bg-blue-200 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Utensils className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">
                  {category.category_name}
                </h3>
                <p className="text-sm text-gray-600">
                  {category.description || "Kategori makanan sehat"}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Cara Kerja Sistem
            </h2>
            <p className="text-lg text-gray-600">
              Sistem rekomendasi berbasis AI untuk menu diet personal
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Daftar & Lengkapi Profil
              </h3>
              <p className="text-gray-600">
                Buat akun dan isi informasi kesehatan serta preferensi diet Anda
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Rating Makanan
              </h3>
              <p className="text-gray-600">
                Beri rating pada makanan yang Anda sukai untuk melatih sistem AI
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Dapatkan Rekomendasi
              </h3>
              <p className="text-gray-600">
                Terima rekomendasi makanan personal berdasarkan preferensi dan
                kesehatan Anda
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-16 bg-blue-600 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Siap Memulai Diet Sehat Anda?
            </h2>
            <p className="text-xl text-blue-100 mb-8">
              Bergabunglah dengan ribuan pengguna yang sudah merasakan
              manfaatnya
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                <Heart className="mr-2 w-5 h-5" />
                Daftar Gratis Sekarang
              </Link>
              <Link
                href="/foods"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors inline-flex items-center justify-center"
              >
                <Utensils className="mr-2 w-5 h-5" />
                Lihat Makanan Dulu
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
