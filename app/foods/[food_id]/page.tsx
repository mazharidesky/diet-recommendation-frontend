"use client";

import {
  useState,
  useEffect,
  useMemo, // Tambahkan useMemo
} from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { foodService, recommendationService } from "@/lib/api";
import { Food } from "@/types";
import {
  ArrowLeft,
  Star,
  Zap,
  Activity,
  Droplets,
  Flame,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Info, // Tambahkan icon Info
} from "lucide-react";
import { toast } from "react-hot-toast";

// --- FUNGSI UTILS (SAMA DENGAN FOOD CARD) ---

const filterWordsForDisplay = (text: string): string => {
  if (!text || typeof text !== "string") return text || "";
  const wordsToRemove = ["mentah", "masakan"];
  return text
    .split(",")
    .map((part) => {
      const words = part
        .trim()
        .split(/\s+/)
        .filter((word) => {
          const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
          return !wordsToRemove.includes(cleanWord);
        });
      return words.join(" ").trim();
    })
    .filter((part) => part.length > 0)
    .join(", ")
    .trim();
};

const analyzeDietSuitability = (diets: string[], food: Food) => {
  const safe: string[] = [];
  const warning: string[] = [];

  diets.forEach((diet) => {
    const d = diet.toLowerCase();
    let isRisky = false;

    // Logika Validasi Medis
    if (
      (d.includes("hypertension") || d.includes("heart")) &&
      (food.natrium || 0) > 200
    ) {
      isRisky = true;
    } else if (
      d.includes("obesity") &&
      ((food.energi || 0) > 200 || (food.estimated_gi || 0) > 70)
    ) {
      isRisky = true;
    } else if (d.includes("diabetes") && (food.estimated_gi || 0) > 55) {
      isRisky = true;
    }

    if (isRisky) {
      warning.push(diet);
    } else {
      safe.push(diet);
    }
  });

  return { safe, warning };
};

// --- KOMPONEN UTAMA ---

export default function FoodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [food, setFood] = useState<Food | null>(null);
  const [similarFoods, setSimilarFoods] = useState<Food[]>([]); // Biarkan state ini meski UI dikomentar
  const [loading, setLoading] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [submittingRating, setSubmittingRating] = useState(false);

  const foodId = parseInt(params.food_id as string);

  useEffect(() => {
    if (foodId) {
      fetchFoodDetail();
    }
  }, [foodId]);

  useEffect(() => {
    if (food && isAuthenticated) {
      fetchSimilarFoods();
    }
  }, [food, isAuthenticated]);

  const fetchFoodDetail = async () => {
    setLoading(true);
    try {
      const response = await foodService.getFood(foodId);
      setFood(response.food);

      if (response.food.user_rating) {
        setUserRating(Number(response.food.user_rating));
      }
      if (response.food.user_liked !== undefined) {
        setIsLiked(response.food.user_liked);
      }
    } catch (error) {
      console.error("Error fetching food detail:", error);
      toast.error("Gagal memuat detail makanan");
      router.push("/foods");
    } finally {
      setLoading(false);
    }
  };

  const fetchSimilarFoods = async () => {
    if (!food) return;
    setLoadingSimilar(true);
    try {
      const response = await recommendationService.getSimilarFoods(
        food.food_id,
        4
      );
      setSimilarFoods(response.similar_foods || []);
    } catch (error) {
      console.error("Error fetching similar foods:", error);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleRating = async (rating: number) => {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk memberikan rating");
      return;
    }
    setSubmittingRating(true);
    try {
      await foodService.rateFood(foodId, { rating });
      setUserRating(rating);
      toast.success("Rating berhasil disimpan!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Gagal menyimpan rating");
    } finally {
      setSubmittingRating(false);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-blue-600 bg-blue-100";
    if (score >= 40) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getGIColor = (gi: number) => {
    if (gi <= 55) return "text-green-600 bg-green-100";
    if (gi <= 70) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  };

  const getGILabel = (gi: number) => {
    if (gi <= 55) return "Rendah";
    if (gi <= 70) return "Sedang";
    return "Tinggi";
  };

  // --- LOGIKA UTILS UNTUK FORMATTING DATA ---
  const formatDietSuitability = (suitability?: string | string[] | null) => {
    try {
      if (!suitability) return [];
      let result: string[] = [];

      if (Array.isArray(suitability)) {
        result = suitability;
      } else if (typeof suitability === "string") {
        result = suitability.split(",");
      } else if (typeof suitability === "object" && suitability !== null) {
        const values = Object.values(suitability);
        if (values.length > 0 && Array.isArray(values[0])) {
          result = values[0];
        }
      }
      return result
        .map((item) =>
          filterWordsForDisplay(typeof item === "string" ? item : "")
        )
        .filter((item) => item.length > 0);
    } catch (error) {
      return [];
    }
  };

  // Analisis Diet (Memoized)
  const dietAnalysis = useMemo(() => {
    if (!food) return { safe: [], warning: [] };
    const rawList = formatDietSuitability(food.diet_suitability);
    return analyzeDietSuitability(rawList, food);
  }, [food]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat detail makanan...</p>
        </div>
      </div>
    );
  }

  if (!food) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Makanan tidak ditemukan
          </h3>
          <button
            onClick={() => router.push("/foods")}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Kembali ke Katalog
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 mt-16">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Kembali</span>
          </button>

          <div className="bg-white rounded-xl shadow-lg p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Food Info */}
              <div className="w-full">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {filterWordsForDisplay(food.nama_makanan)}
                    </h1>
                    <p className="text-lg text-gray-600">
                      Kategori:{" "}
                      {filterWordsForDisplay(food.category_name || "")}
                    </p>
                  </div>

                  {/* Health Score Badge */}
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center ${getHealthScoreColor(
                      food.health_score || 0
                    )}`}
                  >
                    <Zap className="w-4 h-4 mr-2" />
                    Health Score: {food.health_score || 0}/100
                  </div>
                </div>

                {/* Rating & Like Section */}
                {isAuthenticated && (
                  <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Berikan Rating & Like
                    </h3>

                    {/* Star Rating */}
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-sm text-gray-600">Rating:</span>
                      <div className="flex space-x-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(star)}
                            disabled={submittingRating}
                            className={`w-8 h-8 ${
                              star <= userRating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300 hover:text-yellow-300"
                            } transition-colors disabled:opacity-50`}
                          >
                            <Star className="w-full h-full" />
                          </button>
                        ))}
                      </div>
                      {userRating > 0 && (
                        <span className="text-sm text-gray-600">
                          ({userRating}/5)
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Nutrition Facts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Basic Nutrition */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Flame className="w-6 h-6 mr-2 text-orange-500" />
              Informasi Gizi (per 100g)
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Energi
                  </span>
                </div>
                <p className="text-2xl font-bold text-orange-600">
                  {food.energi}
                </p>
                <p className="text-xs text-gray-600">kkal</p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Protein
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-600">
                  {food.protein || 0}
                </p>
                <p className="text-xs text-gray-600">gram</p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="w-4 h-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Karbohidrat
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-600">
                  {food.karbohidrat || 0}
                </p>
                <p className="text-xs text-gray-600">gram</p>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <Droplets className="w-4 h-4 text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">
                    Lemak
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-600">
                  {food.lemak || 0}
                </p>
                <p className="text-xs text-gray-600">gram</p>
              </div>
            </div>

            {/* Additional Nutrients */}
            <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Serat</span>
                <span className="font-medium text-gray-400">
                  {food.serat || 0}g
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Air</span>
                <span className="font-medium text-gray-400">
                  {food.air || 0}g
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Natrium</span>
                <span className="font-medium text-gray-400">
                  {food.natrium || 0}mg
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-100">
                <span className="text-gray-600">Kalium</span>
                <span className="font-medium text-gray-400">
                  {food.kalium || 0}mg
                </span>
              </div>
            </div>
          </div>

          {/* Health Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Shield className="w-6 h-6 mr-2 text-green-500" />
              Analisis Kesehatan
            </h2>

            {/* Glycemic Index */}
            {typeof food.estimated_gi === "number" && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Indeks Glikemik
                  </span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getGIColor(
                      food.estimated_gi
                    )}`}
                  >
                    {food.estimated_gi} - {getGILabel(food.estimated_gi)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      food.estimated_gi <= 55
                        ? "bg-green-500"
                        : food.estimated_gi <= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(food.estimated_gi, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-2 flex items-center">
                  <Info className="w-3 h-3 mr-1" />
                  Semakin rendah IG, semakin stabil gula darah.
                </p>
              </div>
            )}

            {/* Nutrition Profile */}
            {food.nutrition_profile && (
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Profil Nutrisi
                </h3>
                <div className="space-y-2">
                  {Object.entries(food.nutrition_profile).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center justify-between"
                      >
                        <span className="text-sm text-gray-600 capitalize">
                          {key.replace("_", " ")}
                        </span>
                        <div className="flex items-center space-x-1">
                          {value ? (
                            <CheckCircle className="w-4 h-4 text-green-500" />
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-gray-200"></div>
                          )}
                          <span className="text-xs text-gray-500">
                            {value ? "Ya" : "Tidak"}
                          </span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}

            {/* Diet Suitability (UPDATED LOGIC) */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">
                Rekomendasi Diet
              </h3>

              {/* Jika tidak ada data sama sekali */}
              {dietAnalysis.safe.length === 0 &&
                dietAnalysis.warning.length === 0 && (
                  <p className="text-sm text-gray-500 italic">
                    Belum ada data rekomendasi spesifik.
                  </p>
                )}

              {/* Kelompok AMAN (Hijau) */}
              {dietAnalysis.safe.length > 0 && (
                <div className="mb-4">
                  <span className="text-xs text-gray-500 block mb-2">
                    Sangat cocok untuk:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {dietAnalysis.safe.map((diet, index) => (
                      <span
                        key={`safe-${index}`}
                        className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center"
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {diet}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Kelompok PERINGATAN (Merah/Oranye) */}
              {dietAnalysis.warning.length > 0 && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mt-3">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 mr-2 shrink-0" />
                    <div>
                      <h4 className="text-sm font-semibold text-red-800 mb-1">
                        Perhatian Diperlukan
                      </h4>
                      <p className="text-xs text-red-600 mb-3">
                        Bahan ini mengandung Kalori, IG, atau Natrium yang cukup
                        tinggi untuk kondisi berikut:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {dietAnalysis.warning.map((diet, index) => (
                          <span
                            key={`warn-${index}`}
                            className="px-2 py-1 bg-white text-red-700 border border-red-200 text-xs font-medium rounded-md shadow-sm"
                          >
                            {diet}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Similar Foods */}
        {/* {isAuthenticated && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <TrendingUp className="w-6 h-6 mr-2 text-blue-500" />
              Makanan Serupa
            </h2>

            {loadingSimilar ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                <span className="ml-2 text-gray-600">
                  Memuat makanan serupa...
                </span>
              </div>
            ) : similarFoods.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {similarFoods.map((similarFood) => (
                  <div
                    key={similarFood.food_id}
                    onClick={() =>
                      router.push(
                        `/recommendations/similar-foods/${similarFood.food_id}`
                      )
                    }
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="h-32 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                      🍽️
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm mb-1 line-clamp-2">
                      {similarFood.nama_makanan}
                    </h3>
                    <p className="text-xs text-gray-600 mb-2">
                      {similarFood.category_name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-orange-600 font-medium">
                        {similarFood.energi} kkal
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${getHealthScoreColor(
                          similarFood.health_score || 0
                        )}`}
                      >
                        {similarFood.health_score || 0}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">
                Tidak ada makanan serupa yang ditemukan
              </p>
            )}
          </div>
        )} */}
      </div>
    </div>
  );
}
