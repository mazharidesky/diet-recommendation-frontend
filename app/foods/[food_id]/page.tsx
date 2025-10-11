"use client";

import {
  useState,
  useEffect,
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactNode,
  ReactPortal,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { foodService, recommendationService } from "@/lib/api";
import { Food } from "@/types";
import {
  ArrowLeft,
  Star,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Info,
  Zap,
  Activity,
  Droplets,
  Flame,
  Target,
  Shield,
  AlertTriangle,
  CheckCircle,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function FoodDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuth();
  const [food, setFood] = useState<Food | null>(null);
  const [similarFoods, setSimilarFoods] = useState<Food[]>([]);
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

      // Set existing rating jika ada
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

  const handleLike = async (liked: boolean) => {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk menyukai makanan");
      return;
    }

    setSubmittingRating(true);
    try {
      await foodService.rateFood(foodId, {
        is_liked: liked,
        rating: 0,
      });
      setIsLiked(liked);
      toast.success(liked ? "Makanan disukai!" : "Like dihapus");
    } catch (error) {
      console.error("Error submitting like:", error);
      toast.error("Gagal menyimpan like");
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
              {/* Food Image Placeholder */}
              {/* Food Info */}
              <div className="lg:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {food.nama_makanan}
                    </h1>
                    <p className="text-lg text-gray-600">
                      Kategori: {food.category_name}
                    </p>
                  </div>

                  {/* Health Score Badge */}
                  <div
                    className={`px-4 py-2 rounded-full text-sm font-semibold ${getHealthScoreColor(
                      food.health_score || 0
                    )}`}
                  >
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

                    {/* Like/Dislike */}
                    {/* <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLike(true)}
                        disabled={submittingRating}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all disabled:opacity-50 ${
                          isLiked === true
                            ? "bg-blue-100 text-blue-700"
                            : "bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600"
                        }`}
                      >
                        <ThumbsUp className="w-4 h-4" />
                        <span>Suka</span>
                      </button>

                      <button
                        onClick={() => handleLike(false)}
                        disabled={submittingRating}
                        className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all disabled:opacity-50 ${
                          isLiked === false
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600"
                        }`}
                      >
                        <ThumbsDown className="w-4 h-4" />
                        <span>Tidak Suka</span>
                      </button>
                    </div> */}
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
            {food.estimated_gi && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">
                    Indeks Glikemik
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${getGIColor(
                      food.estimated_gi
                    )}`}
                  >
                    {getGILabel(food.estimated_gi)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      food.estimated_gi <= 55
                        ? "bg-green-500"
                        : food.estimated_gi <= 70
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                    style={{ width: `${Math.min(food.estimated_gi, 100)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Nilai: {food.estimated_gi}
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

            {/* Diet Suitability */}
            {food.diet_suitability && (
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">
                  Cocok untuk Diet
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(Array.isArray(food.diet_suitability)
                    ? food.diet_suitability
                    : [food.diet_suitability]
                  ).map((diet, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full"
                    >
                      {diet}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
