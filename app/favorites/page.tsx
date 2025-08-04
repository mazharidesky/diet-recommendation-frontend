"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { foodService } from "@/lib/api";
import { UserRating } from "@/types";
import {
  Star,
  Heart,
  ThumbsUp,
  Trash2,
  Loader2,
  ArrowLeft,
  TrendingUp,
  Award,
  Filter,
  Search,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function FavoritesPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [userRatings, setUserRatings] = useState<UserRating[]>([]);
  const [filteredRatings, setFilteredRatings] = useState<UserRating[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"rating" | "name" | "recent">("rating");
  const [filterBy, setFilterBy] = useState<"all" | "liked" | "high_rated">(
    "all"
  );

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/favorites");
      return;
    }
    fetchUserRatings();
  }, [isAuthenticated]);

  useEffect(() => {
    filterAndSortRatings();
  }, [userRatings, searchTerm, sortBy, filterBy]);

  const fetchUserRatings = async () => {
    setLoading(true);
    try {
      const response = await foodService.getMyRatings();
      // Filter hanya makanan yang disukai (rating >= 4 atau is_liked = true)
      const favorites = response.ratings.filter(
        (rating) =>
          (typeof rating.rating === "number" && rating.rating >= 3.0) ||
          rating.is_liked === true
      );
      setUserRatings(favorites);
    } catch (error) {
      console.error("Error fetching user ratings:", error);
      toast.error("Gagal memuat makanan favorit");
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortRatings = () => {
    let filtered = [...userRatings];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (rating) =>
          rating.food_name &&
          rating.food_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case "liked":
        filtered = filtered.filter((rating) => rating.is_liked === true);
        break;
      case "high_rated":
        filtered = filtered.filter(
          (rating) => typeof rating.rating === "number" && rating.rating >= 4.5
        );
        break;
      // "all" doesn't need filtering
    }

    // Apply sorting
    switch (sortBy) {
      case "rating":
        filtered.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
        break;
      case "name":
        filtered.sort((a, b) =>
          (a.food_name ?? "").localeCompare(b.food_name ?? "")
        );
        break;
      case "recent":
        // Assuming there's a timestamp, otherwise keep current order
        break;
    }

    setFilteredRatings(filtered);
  };

  const removeFromFavorites = async (ratingId: number, foodName: string) => {
    try {
      // Menggunakan API client delete method
      await foodService.deleteRatings(ratingId);

      // Update state
      setUserRatings((prev) =>
        prev.filter((rating) => rating.rating_id !== ratingId)
      );
      toast.success(`${foodName} berhasil dihapus dari favorit`);
    } catch (error) {
      console.error("Error removing rating:", error);
      toast.error("Gagal menghapus dari favorit");
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 4.5)
      return { label: "Sangat Disukai", color: "bg-green-100 text-green-800" };
    if (rating >= 4.0)
      return { label: "Disukai", color: "bg-blue-100 text-blue-800" };
    return { label: "Cukup Disukai", color: "bg-yellow-100 text-yellow-800" };
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Makanan Favorit Saya
              </h1>
              <p className="text-lg text-gray-600">
                Koleksi makanan yang sudah Anda sukai dan beri rating tinggi
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">
              Memuat makanan favorit...
            </span>
          </div>
        ) : userRatings.length === 0 ? (
          <div className="text-center py-12">
            <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Belum ada makanan favorit
            </h3>
            <p className="text-gray-600 mb-6">
              Mulai beri rating tinggi (4-5 bintang) atau like pada makanan yang
              Anda sukai
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/foods")}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Jelajahi Makanan
              </button>
              <button
                onClick={() => router.push("/recommendations")}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg transition-colors"
              >
                Lihat Rekomendasi
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Search and Filter Bar */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Cari makanan favorit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {searchTerm && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <X className="h-4 w-4 text-gray-400" />
                    </button>
                  )}
                </div>

                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value as "rating" | "name" | "recent")
                  }
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="rating">Urutkan: Rating Tertinggi</option>
                  <option value="name">Urutkan: Nama A-Z</option>
                  <option value="recent">Urutkan: Terbaru</option>
                </select>

                {/* Filter Dropdown */}
                <select
                  value={filterBy}
                  onChange={(e) =>
                    setFilterBy(
                      e.target.value as "all" | "liked" | "high_rated"
                    )
                  }
                  className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                >
                  <option value="all">Semua Favorit</option>
                  <option value="liked">Hanya yang Di-Like</option>
                  <option value="high_rated">Rating ≥ 4.5</option>
                </select>
              </div>
            </div>

            {/* Results Summary */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Menampilkan {filteredRatings.length} dari {userRatings.length}{" "}
                makanan favorit
                {searchTerm && ` untuk "${searchTerm}"`}
              </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <Star className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Rating Rata-rata
                    </p>
                    <p className="text-2xl font-bold text-blue-600">
                      {userRatings.length > 0
                        ? (
                            userRatings.reduce(
                              (sum, r) =>
                                sum +
                                (typeof r.rating === "number" ? r.rating : 0),
                              0
                            ) / userRatings.length
                          ).toFixed(1)
                        : "0.0"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 p-3 rounded-lg">
                    <ThumbsUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Total Disukai
                    </p>
                    <p className="text-2xl font-bold text-green-600">
                      {userRatings.filter((r) => r.is_liked).length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Award className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Rating Tertinggi
                    </p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {userRatings.length > 0
                        ? Math.max(
                            ...userRatings
                              .map((r) => r.rating)
                              .filter(
                                (rating): rating is number =>
                                  typeof rating === "number"
                              )
                          ).toFixed(1)
                        : "0.0"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Favorites List */}
            {filteredRatings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md">
                <Filter className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Tidak ada hasil ditemukan
                </h3>
                <p className="text-gray-600 mb-4">
                  Coba ubah kriteria pencarian atau filter
                </p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterBy("all");
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredRatings.map((rating) => {
                  const ratingLabel = getRatingLabel(
                    typeof rating.rating === "number" ? rating.rating : 0
                  );

                  return (
                    <div
                      key={rating.rating_id}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          {/* Food Name and Rating */}
                          <div className="flex items-center space-x-3 mb-3">
                            <h4 className="font-bold text-gray-900 text-xl">
                              {rating.food_name}
                            </h4>

                            <div className="flex items-center space-x-2">
                              <div className="flex items-center space-x-1">
                                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                <span className="font-semibold text-gray-700 text-lg">
                                  {rating.rating}
                                </span>
                              </div>

                              {rating.is_liked && (
                                <div className="flex items-center space-x-1">
                                  <ThumbsUp className="w-4 h-4 text-blue-500 fill-current" />
                                  <span className="text-sm text-blue-600 font-medium">
                                    Disukai
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Visual Rating Stars */}
                          <div className="flex items-center space-x-2 mb-3">
                            <div className="flex space-x-1">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-4 h-4 ${
                                    star <=
                                    (typeof rating.rating === "number"
                                      ? rating.rating
                                      : 0)
                                      ? "text-yellow-400 fill-current"
                                      : "text-gray-300"
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-sm text-gray-600">
                              ({rating.rating} dari 5 bintang)
                            </span>
                          </div>

                          {/* Rating Category */}
                          <div className="flex items-center space-x-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${ratingLabel.color}`}
                            >
                              {ratingLabel.label}
                            </span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center space-x-3 ml-6">
                          <button
                            onClick={() =>
                              router.push(`/foods/${rating.food_id}`)
                            }
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
                          >
                            <span>Lihat Detail</span>
                          </button>

                          <button
                            onClick={() =>
                              removeFromFavorites(
                                rating.rating_id,
                                rating.food_name ?? "Makanan"
                              )
                            }
                            className="bg-red-100 hover:bg-red-200 text-red-700 text-sm py-2 px-3 rounded-lg transition-colors flex items-center space-x-1"
                            title="Hapus dari favorit"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
