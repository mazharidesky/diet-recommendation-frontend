"use client";

import { useState, useEffect } from "react";
import { Check, Clock, ChefHat, Sparkles } from "lucide-react";
import { MealPlan, MealType, MealPlanCardProps } from "@/types/index";

const MealPlanCard = ({
  mealPlan,
  mealType,
  isCompleted = false,
  onToggleComplete,
  mealTime,
}: MealPlanCardProps) => {
  const [completed, setCompleted] = useState(isCompleted);

  // // Update local state when prop changes
  // useEffect(() => {
  //   setCompleted(isCompleted);
  // }, [isCompleted]);

  // const handleToggleComplete = () => {
  //   const newCompleted = !completed;

  //   // Optimistically update local state first for immediate UI feedback
  //   setCompleted(newCompleted);

  //   // Then call the parent handler
  //   if (onToggleComplete) {
  //     onToggleComplete(mealType);
  //   }
  // };

  const getMealTypeInfo = (type: MealType) => {
    switch (type) {
      case "breakfast":
        return {
          label: "Sarapan",
          color: "bg-yellow-100 text-yellow-800 border-yellow-200",
          icon: "🌅",
        };
      case "lunch":
        return {
          label: "Makan Siang",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "☀️",
        };
      case "dinner":
        return {
          label: "Makan Malam",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: "🌙",
        };
      default:
        return {
          label: "Makanan",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "🍽️",
        };
    }
  };

  const mealInfo = getMealTypeInfo(mealType);

  const isPersonalized = mealPlan.source === "personalized_recommendations";

  return (
    <div
      className={`bg-white rounded-lg shadow-md border transition-all duration-300 ${
        completed
          ? "opacity-75 ring-2 ring-green-500 border-green-200"
          : "hover:shadow-lg border-gray-200"
      }`}
    >
      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">{mealInfo.icon}</span>
            <div>
              <div className="flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${mealInfo.color}`}
                >
                  {mealInfo.label}
                </span>
                {isPersonalized && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-100 to-pink-100 text-purple-800 border border-purple-200">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Personal
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mt-1">
                {mealPlan.name}
              </h3>
            </div>
          </div>

          {/* <button
            onClick={handleToggleComplete}
            className={`p-2 rounded-full transition-colors ${
              completed
                ? "bg-green-500 text-white shadow-md"
                : "bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white"
            }`}
            title={completed ? "Tandai belum selesai" : "Tandai selesai"}
          >
            <Check className="w-5 h-5" />~
          </button> */}
        </div>

        {/* Meal Time */}
        {mealTime && (
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
            <Clock className="w-4 h-4" />
            <span>{mealTime}</span>
          </div>
        )}

        {/* Description */}
        {mealPlan.description && (
          <p className="text-gray-600 text-sm mb-4">{mealPlan.description}</p>
        )}
      </div>

      {/* Foods List */}
      <div className="px-6 pb-4">
        <div className="space-y-2">
          {mealPlan.foods.map((food, index) => (
            <div
              key={food.food_id || index}
              className="flex items-center justify-between py-3 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center space-x-2 flex-1">
                <ChefHat className="w-4 h-4 text-gray-500 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-gray-900 block truncate">
                    {food.nama_makanan || food.name}
                  </span>
                  <span className="text-xs text-gray-500">
                    {food.portion} • {food.base_calories_per_100g} kcal/100g
                  </span>
                </div>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                <span className="text-sm font-semibold text-gray-900">
                  {food.calories} kcal
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Total Calories */}
      <div className="px-6 py-4 border-b rounded-lg bg-gray-50">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Kalori:
          </span>
          <span className="text-xl text-gray-500 font-bold text-primary-600">
            {mealPlan.total_calories} kcal
          </span>
        </div>
      </div>

      {/* Completion Status */}
      {completed && (
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center space-x-2 text-green-600 bg-green-50 rounded-lg py-2">
            <Check className="w-4 h-4" />
            <span className="text-sm font-medium">Selesai</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanCard;
