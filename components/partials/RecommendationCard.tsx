"use client";

import { useState } from "react";
import { Star, TrendingUp, Users, Brain, Zap, Eye } from "lucide-react";
import { Food, RecommendationCardProps } from "@/types";
import FoodCard from "@/components/partials/Foodcard"; // Adjust import path as necessary

const RecommendationCard = ({
  recommendation,
  onRate,
  onSimilarFoods,
}: RecommendationCardProps) => {
  const [showDetails, setShowDetails] = useState(false);

  const getMethodIcon = (method?: string) => {
    switch (method) {
      case "collaborative":
        return <Users className="w-4 h-4" />;
      case "content_based":
        return <Brain className="w-4 h-4" />;
      case "hybrid":
        return <Zap className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const handleSimilarFoods = () => {
    if (onSimilarFoods) {
      onSimilarFoods(recommendation.food_id);
    }
  };

  return (
    <div className="relative">
      <FoodCard
        food={recommendation}
        showRating={true}
        onRatingUpdate={onRate}
        onClick={() => setShowDetails(!showDetails)}
      />

      {/* Recommendation Badge */}
      <div className="absolute top-2 right-2 z-10">
        <div className="bg-primary-500 text-white px-2 py-1 rounded-full flex items-center space-x-1 text-xs font-medium">
          {getMethodIcon()}
          <span>Rekomendasi</span>
        </div>
      </div>

      {/* Similar Foods Button */}
      {onSimilarFoods && (
        <div className="absolute bottom-2 right-2 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSimilarFoods();
            }}
            className="bg-white/90 hover:bg-white text-gray-700 px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 shadow-md transition-colors"
          >
            <Eye className="w-3 h-3" />
            <span>Lihat Serupa</span>
          </button>
        </div>
      )}

      {/* Detailed Info Modal */}
      {showDetails && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Detail Rekomendasi</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {recommendation.nama_makanan}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {recommendation.category?.category_name}
                  </p>
                </div>

                {recommendation.similarity_score && (
                  <div>
                    <span className="text-sm text-gray-600">Match Score:</span>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-primary-500 h-2 rounded-full"
                        style={{
                          width: `${recommendation.similarity_score * 100}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {(recommendation.similarity_score * 100).toFixed(1)}%
                      cocok dengan preferensi Anda
                    </span>
                  </div>
                )}

                {recommendation.nutrition_profile && (
                  <div>
                    <h5 className="font-medium text-gray-900 mb-2">
                      Profil Nutrisi:
                    </h5>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {recommendation.nutrition_profile.high_protein && (
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                          Tinggi Protein
                        </span>
                      )}
                      {recommendation.nutrition_profile.high_fiber && (
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Tinggi Serat
                        </span>
                      )}
                      {recommendation.nutrition_profile.low_calorie && (
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                          Rendah Kalori
                        </span>
                      )}
                      {recommendation.nutrition_profile.low_sodium && (
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                          Rendah Sodium
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <button
                    onClick={handleSimilarFoods}
                    className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600 transition-colors"
                  >
                    Lihat Makanan Serupa
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;
