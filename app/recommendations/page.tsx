"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { recommendationService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import FoodCard from "@/components/partials/Foodcard";
import { Food, MethodInfo, UserRecommendationStats } from "@/types";
import {
  Star,
  RefreshCw,
  Brain,
  Users,
  Zap,
  AlertCircle,
  TrendingUp,
  Award,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function RecommendationsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [recommendations, setRecommendations] = useState<Food[]>([]);
  const [methodInfo, setMethodInfo] = useState<MethodInfo | null>(null);
  const [userStats, setUserStats] = useState<UserRecommendationStats | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/recommendations");
      return;
    }

    fetchInitialData();
  }, [isAuthenticated]);

  const fetchInitialData = async () => {
    try {
      await Promise.all([
        fetchRecommendations(),
        fetchMethodInfo(),
        fetchUserStats(),
      ]);
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await recommendationService.getRecommendations({
        limit: 12,
      });

      if (response.success) {
        setRecommendations(response.data.recommendations || []);
      } else {
        toast.error("Gagal mendapatkan rekomendasi");
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
      toast.error("Gagal mendapatkan rekomendasi");
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const fetchMethodInfo = async () => {
    try {
      const response = await recommendationService.getMethodInfo();
      setMethodInfo(response);
    } catch (error) {
      console.error("Error fetching method info:", error);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await recommendationService.getUserStats();
      setUserStats(response);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "content_based":
        return <Brain className="w-5 h-5" />;
      case "collaborative":
        return <Users className="w-5 h-5" />;
      case "hybrid":
        return <Zap className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat rekomendasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Rekomendasi Personal
          </h1>
          <p className="text-lg text-gray-600">
            Makanan yang dipersonalisasi khusus untuk Anda, {user?.nama}
          </p>
        </div>

        {/* Method Info Card */}
        {methodInfo && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getMethodIcon(methodInfo.data.current_method)}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Metode:{" "}
                    {methodInfo.data.current_method
                      .replace("_", " ")
                      .toUpperCase()}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Sistem menggunakan {methodInfo.data.total_users} data
                    pengguna
                  </p>
                </div>
              </div>
              <button
                onClick={fetchRecommendations}
                disabled={loadingRecommendations}
                className="btn-primary"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    loadingRecommendations ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Star className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Rating Anda</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {methodInfo.data.user_ratings_count}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Users className="w-4 h-4 text-green-600" />
                  <span className="font-medium">Total Pengguna</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {methodInfo.data.total_users}
                </p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                  <span className="font-medium">Collaborative</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {methodInfo.data.collaborative_available ? "Aktif" : "Tidak"}
                </p>
              </div>
            </div>

            {!methodInfo.data.collaborative_available && (
              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-800">
                      Collaborative Filtering Belum Tersedia
                    </h4>
                    <p className="text-sm text-yellow-700 mt-1">
                      Butuh{" "}
                      {methodInfo.data.users_needed_for_collaborative -
                        methodInfo.data.total_users}{" "}
                      pengguna lagi untuk mengaktifkan fitur collaborative
                      filtering.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Progress */}
        {userStats && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Progress Rekomendasi Anda
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Rating Progress
                  </span>
                  <span className="text-sm text-gray-600">
                    {userStats.data.total_ratings}/10
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(
                        (userStats.data.total_ratings / 10) * 100,
                        100
                      )}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Rating lebih banyak untuk rekomendasi yang lebih akurat
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Makanan Disukai</span>
                  <span className="font-medium text-green-600">
                    {userStats.data.liked_foods}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rating Rata-rata</span>
                  <span className="font-medium">
                    {userStats.data.average_rating}/5
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Rekomendasi Diterima</span>
                  <span className="font-medium text-blue-600">
                    {userStats.data.recommendations_received}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Rekomendasi untuk Anda ({recommendations.length})
            </h3>
            {loadingRecommendations && (
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            )}
          </div>

          {loadingRecommendations ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="bg-gray-50 rounded-lg overflow-hidden animate-pulse"
                >
                  <div className="h-48 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recommendations.length === 0 ? (
            <div className="text-center py-12">
              <Award className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Rekomendasi
              </h3>
              <p className="text-gray-600 mb-4">
                Mulai beri rating pada makanan untuk mendapatkan rekomendasi
                personal
              </p>
              <button
                onClick={() => router.push("/foods")}
                className="btn-primary"
              >
                Jelajahi Makanan
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {recommendations.map((food) => (
                <FoodCard key={food.food_id} food={food} showRating={true} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
