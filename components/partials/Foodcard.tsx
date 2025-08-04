"use client";

import { useState, useCallback, memo } from "react";
import { Star, Heart, Zap, Utensils } from "lucide-react";
import { foodService, handleApiError } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { Food } from "@/types";
import { toast } from "react-hot-toast";

interface FoodCardProps {
  food: Food;
  showRating?: boolean;
  onRatingUpdate?: (foodId: number, rating: number) => void;
  onClick?: () => void;
}

const FoodCard = memo(function FoodCard({
  food,
  showRating = true,
  onRatingUpdate,
  onClick,
}: FoodCardProps) {
  const { isAuthenticated } = useAuth();
  const [rating, setRating] = useState(0);
  const [isLiked, setIsLiked] = useState<boolean | null>(null);
  const [isRating, setIsRating] = useState(false);

  const handleRating = useCallback(
    async (newRating: number) => {
      if (!isAuthenticated) {
        toast.error("Silakan login untuk memberikan rating");
        return;
      }

      setIsRating(true);
      try {
        await foodService.rateFood(food.food_id, {
          rating: newRating,
          is_liked: newRating >= 4,
        });

        setRating(newRating);
        setIsLiked(newRating >= 4);
        toast.success("Rating berhasil disimpan!");

        if (onRatingUpdate) {
          onRatingUpdate(food.food_id, newRating);
        }
      } catch (error) {
        toast.error(handleApiError(error));
      } finally {
        setIsRating(false);
      }
    },
    [isAuthenticated, food.food_id, onRatingUpdate]
  );

  const handleLike = useCallback(async () => {
    if (!isAuthenticated) {
      toast.error("Silakan login untuk menyukai makanan");
      return;
    }

    const newLikedState = !isLiked;
    setIsLiked(newLikedState);

    try {
      await foodService.rateFood(food.food_id, {
        rating: rating || (newLikedState ? 5 : 3),
        is_liked: newLikedState,
      });

      if (!rating) {
        setRating(newLikedState ? 5 : 3);
      }

      toast.success(
        newLikedState ? "Ditambahkan ke favorit!" : "Dihapus dari favorit"
      );
    } catch (error) {
      setIsLiked(!newLikedState);
      toast.error(handleApiError(error));
    }
  }, [isAuthenticated, isLiked, rating, food.food_id]);

  const handleCardClick = useCallback(() => {
    if (onClick) {
      onClick();
    }
  }, [onClick]);

  const getHealthScoreColor = useCallback((score?: number) => {
    if (!score) return "text-gray-600 bg-gray-100";
    if (score >= 80) return "text-green-600 bg-green-100";
    if (score >= 60) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
  }, []);

  const getNutritionColor = useCallback((value?: number, type?: string) => {
    if (!value) return "text-gray-600";

    switch (type) {
      case "protein":
        return value >= 10 ? "text-green-600" : "text-gray-600";
      case "serat":
        return value >= 3 ? "text-green-600" : "text-gray-600";
      case "lemak":
        return value <= 5 ? "text-green-600" : "text-orange-600";
      case "natrium":
        return value <= 100 ? "text-green-600" : "text-red-600";
      default:
        return "text-gray-600";
    }
  }, []);

  const formatDietSuitability = useCallback(
    (suitability?: string | string[] | null) => {
      try {
        if (!suitability) return [];

        if (Array.isArray(suitability)) {
          return suitability.slice(0, 3);
        }

        if (typeof suitability === "string") {
          return suitability
            .split(",")
            .map((s) => s.trim())
            .filter((s) => s.length > 0)
            .slice(0, 3);
        }

        if (typeof suitability === "object" && suitability !== null) {
          const values = Object.values(suitability);
          if (values.length > 0 && Array.isArray(values[0])) {
            return values[0].slice(0, 3);
          }
        }

        return [];
      } catch (error) {
        console.error("Error formatting diet suitability:", error, suitability);
        return [];
      }
    },
    []
  );

  // Safety check
  if (!food || !food.food_id) {
    return (
      <div className="bg-gray-100 rounded-lg p-4 text-center">
        <p className="text-gray-500">Data makanan tidak valid</p>
      </div>
    );
  }

  const dietSuitabilityList = formatDietSuitability(food.diet_suitability);

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden ${
        onClick ? "cursor-pointer transform hover:scale-105" : ""
      }`}
      {...(onClick && { onClick: handleCardClick })}
    >
      {/* Food Image Placeholder */}
      <div className="h-48 bg-gradient-to-r from-blue-100 to-blue-200 flex items-center justify-center relative">
        <div className="text-blue-600 text-center">
          <Utensils className="w-12 h-12 mx-auto mb-2" />
          <span className="text-sm font-medium">
            {food.category?.category_name || "Makanan"}
          </span>
        </div>

        {/* Similarity Score */}
        {food.similarity_score && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-medium">
            {(food.similarity_score * 100).toFixed(0)}% match
          </div>
        )}

        {/* Like Button */}
        {isAuthenticated && (
          <LikeButton isLiked={isLiked} onLike={handleLike} />
        )}
      </div>

      <div className="p-4">
        {/* Food Name */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
          {food.nama_makanan}
        </h3>

        {/* Health Score */}
        {food.health_score && (
          <div className="mb-3">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getHealthScoreColor(
                food.health_score
              )}`}
            >
              <Zap className="w-3 h-3 mr-1" />
              Health Score: {food.health_score}
            </span>
          </div>
        )}

        {/* Nutrition Info */}
        <NutritionInfo food={food} getNutritionColor={getNutritionColor} />

        {/* Diet Suitability */}
        {dietSuitabilityList.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {dietSuitabilityList.map((diet, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {diet}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Estimated GI */}
        {typeof food.estimated_gi === "number" && (
          <GlycemicIndex gi={food.estimated_gi} />
        )}

        {/* Rating Section */}
        {showRating && (
          <RatingSection
            isAuthenticated={isAuthenticated}
            rating={rating}
            isRating={isRating}
            onRating={handleRating}
          />
        )}
      </div>
    </div>
  );
});

// Separate components to avoid serialization issues
const LikeButton = memo(function LikeButton({
  isLiked,
  onLike,
}: {
  isLiked: boolean | null;
  onLike: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onLike();
      }}
      className="absolute top-2 left-2 p-2 rounded-full bg-white/80 hover:bg-white transition-colors"
      type="button"
    >
      <Heart
        className={`w-5 h-5 ${
          isLiked ? "text-red-500 fill-current" : "text-gray-600"
        }`}
      />
    </button>
  );
});

const NutritionInfo = memo(function NutritionInfo({
  food,
  getNutritionColor,
}: {
  food: Food;
  getNutritionColor: (value?: number, type?: string) => string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
      <div className="flex justify-between">
        <span className="text-gray-600">Kalori:</span>
        <span className="font-medium text-gray-500">
          {food.energi || 0} kcal
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Protein:</span>
        <span
          className={`font-medium ${getNutritionColor(
            food.protein,
            "protein"
          )}`}
        >
          {food.protein || 0}g
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Lemak:</span>
        <span
          className={`font-medium ${getNutritionColor(food.lemak, "lemak")}`}
        >
          {food.lemak || 0}g
        </span>
      </div>
      <div className="flex justify-between">
        <span className="text-gray-600">Serat:</span>
        <span
          className={`font-medium ${getNutritionColor(food.serat, "serat")}`}
        >
          {food.serat || 0}g
        </span>
      </div>
    </div>
  );
});

const GlycemicIndex = memo(function GlycemicIndex({ gi }: { gi: number }) {
  const getGICategory = (value: number) => {
    if (value <= 55) return { label: "Rendah", color: "text-green-600" };
    if (value <= 70) return { label: "Sedang", color: "text-yellow-600" };
    return { label: "Tinggi", color: "text-red-600" };
  };

  const category = getGICategory(gi);

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Glycemic Index:</span>
        <span className={`text-sm font-medium ${category.color}`}>
          {gi} ({category.label})
        </span>
      </div>
    </div>
  );
});

const RatingSection = memo(function RatingSection({
  isAuthenticated,
  rating,
  isRating,
  onRating,
}: {
  isAuthenticated: boolean;
  rating: number;
  isRating: boolean;
  onRating: (rating: number) => void;
}) {
  if (!isAuthenticated) {
    return (
      <div className="border-t pt-3 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Login untuk memberikan rating
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }}
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          type="button"
        >
          Login Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="border-t pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Beri Rating:</span>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <StarButton
              key={star}
              starValue={star}
              currentRating={rating}
              isRating={isRating}
              onRate={onRating}
            />
          ))}
        </div>
      </div>
      {rating > 0 && (
        <div className="text-xs text-gray-500 text-right mt-1">
          Rating: {rating}/5
        </div>
      )}
    </div>
  );
});

const StarButton = memo(function StarButton({
  starValue,
  currentRating,
  isRating,
  onRate,
}: {
  starValue: number;
  currentRating: number;
  isRating: boolean;
  onRate: (rating: number) => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onRate(starValue);
      }}
      disabled={isRating}
      className={`p-1 rounded transition-colors ${
        starValue <= currentRating
          ? "text-yellow-400 hover:text-yellow-500"
          : "text-gray-300 hover:text-yellow-400"
      } ${isRating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      type="button"
    >
      <Star className="w-4 h-4 fill-current" />
    </button>
  );
});

export default FoodCard;
