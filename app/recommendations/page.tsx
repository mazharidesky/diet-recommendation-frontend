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
  UserCheck,
  Settings,
  CheckCircle,
  XCircle,
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
  const [hasGeneratedRecommendations, setHasGeneratedRecommendations] =
    useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/recommendations");
      return;
    }

    fetchInitialData();
  }, [isAuthenticated]);

  // Validasi apakah user sudah melengkapi data profil yang diperlukan
  const isProfileComplete = () => {
    return (
      user?.tinggi_badan &&
      user?.berat_badan &&
      user?.tinggi_badan > 0 &&
      user?.berat_badan > 0
    );
  };

  const getProfileCompletionStatus = () => {
    const requirements = [
      {
        label: "Tinggi Badan",
        completed: user?.tinggi_badan && user.tinggi_badan > 0,
        value: user?.tinggi_badan ? `${user.tinggi_badan} cm` : null,
      },
      {
        label: "Berat Badan",
        completed: user?.berat_badan && user.berat_badan > 0,
        value: user?.berat_badan ? `${user.berat_badan} kg` : null,
      },
      {
        label: "BMR (Otomatis)",
        completed: user?.bmr && user.bmr > 0,
        value: user?.bmr ? `${Math.round(user.bmr)} kalori/hari` : null,
      },
    ];

    return requirements;
  };

  const fetchInitialData = async () => {
    try {
      await Promise.all([fetchMethodInfo(), fetchUserStats()]);

      // Hanya fetch recommendations jika profil sudah lengkap dan user pernah generate
      if (isProfileComplete() && hasGeneratedRecommendations) {
        await fetchRecommendations();
      }
    } catch (error) {
      console.error("Error fetching initial data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    if (!isProfileComplete()) {
      toast.error(
        "Lengkapi profil Anda terlebih dahulu untuk mendapatkan rekomendasi"
      );
      return;
    }

    setLoadingRecommendations(true);
    try {
      const response = await recommendationService.getRecommendations({
        limit: 12,
      });

      if (response.success) {
        setRecommendations(response.data.recommendations || []);
        setHasGeneratedRecommendations(true);
        toast.success("Rekomendasi berhasil dibuat!");
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

  const handleGenerateRecommendations = () => {
    if (!isProfileComplete()) {
      toast.error("Lengkapi profil Anda terlebih dahulu");
      router.push("/profile");
      return;
    }
    fetchRecommendations();
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

  const profileStatus = getProfileCompletionStatus();
  const isComplete = isProfileComplete();

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

        {/* Profile Status Card */}
        <div
          className={`mb-8 p-6 rounded-lg shadow-md ${
            isComplete
              ? "bg-green-50 border border-green-200"
              : "bg-yellow-50 border border-yellow-200"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              {isComplete ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <AlertCircle className="w-6 h-6 text-yellow-600" />
              )}
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    isComplete ? "text-green-900" : "text-yellow-900"
                  }`}
                >
                  {isComplete ? "Profil Lengkap!" : "Lengkapi Profil Anda"}
                </h3>
                <p
                  className={`text-sm ${
                    isComplete ? "text-green-700" : "text-yellow-700"
                  }`}
                >
                  {isComplete
                    ? "Semua data yang diperlukan sudah lengkap. Anda dapat membuat rekomendasi makanan."
                    : "Beberapa data masih belum lengkap. Lengkapi untuk mendapatkan rekomendasi yang akurat."}
                </p>
              </div>
            </div>
            {!isComplete && (
              <button
                onClick={() => router.push("/profile")}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Lengkapi Profil</span>
              </button>
            )}
          </div>

          {/* Profile Requirements Checklist */}
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            {profileStatus.map((requirement, index) => (
              <div
                key={index}
                className="flex items-center space-x-3 p-3 bg-white rounded-lg"
              >
                {requirement.completed ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {requirement.label}
                  </p>
                  <p className="text-xs text-gray-600">
                    {requirement.completed && requirement.value
                      ? requirement.value
                      : "Belum diisi"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Generate Recommendations Button */}
            <button
              onClick={handleGenerateRecommendations}
              disabled={!isComplete || loadingRecommendations}
              className={`p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group ${
                isComplete
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`p-3 rounded-lg transition-transform duration-200 ${
                    isComplete
                      ? "bg-white bg-opacity-20 group-hover:scale-110"
                      : "bg-gray-200"
                  }`}
                >
                  {loadingRecommendations ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Zap className="w-6 h-6 text-blue-500" />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">
                    {loadingRecommendations
                      ? "Membuat Rekomendasi..."
                      : "Buat Rekomendasi"}
                  </h3>
                  <p className="text-sm opacity-90">
                    {isComplete
                      ? "Generate rekomendasi makanan personal"
                      : "Lengkapi profil terlebih dahulu"}
                  </p>
                </div>
              </div>
            </button>

            {/* Makanan Favorit Button */}
            <button
              onClick={() => router.push("/favorites")}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <Star className="w-6 h-6 text-orange-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Makanan Favorit</h3>
                  <p className="text-sm opacity-90">
                    Lihat makanan yang sudah disukai
                  </p>
                </div>
              </div>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => router.push("/profile")}
              className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-white bg-opacity-20 p-3 rounded-lg group-hover:scale-110 transition-transform duration-200">
                  <UserCheck className="w-6 h-6 text-purple-500" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">Kelola Profil</h3>
                  <p className="text-sm opacity-90">Update data pribadi Anda</p>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Method Info Card - Only show if profile is complete */}
        {isComplete && methodInfo && (
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
                onClick={handleGenerateRecommendations}
                disabled={loadingRecommendations}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <RefreshCw
                  className={`w-4 h-4 ${
                    loadingRecommendations ? "animate-spin" : ""
                  }`}
                />
                <span>Refresh</span>
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

        {/* User Progress - Only show if profile is complete */}
        {isComplete && userStats && (
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

          {!isComplete ? (
            <div className="text-center py-12">
              <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Lengkapi Profil Anda
              </h3>
              <p className="text-gray-600 mb-4">
                Isi tinggi badan dan berat badan untuk mendapatkan rekomendasi
                makanan yang personal
              </p>
              <button
                onClick={() => router.push("/profile")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Lengkapi Profil</span>
              </button>
            </div>
          ) : loadingRecommendations ? (
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
                Klik tombol "Buat Rekomendasi" di atas untuk mendapatkan
                rekomendasi makanan personal
              </p>
              <button
                onClick={handleGenerateRecommendations}
                disabled={!isComplete || loadingRecommendations}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-3 rounded-lg flex items-center space-x-2 mx-auto transition-colors"
              >
                <Zap className="w-4 h-4" />
                <span>Buat Rekomendasi</span>
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
