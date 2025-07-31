"use client";

import { useState } from "react";
import { Check, Clock, ChefHat } from "lucide-react";
import { MealPlan, MealType, MealPlanCardProps } from "@/types";

const MealPlanCard = ({
  mealPlan,
  mealType,
  isCompleted = false,
  onToggleComplete,
}: MealPlanCardProps) => {
  const [completed, setCompleted] = useState(isCompleted);

  const handleToggleComplete = () => {
    const newCompleted = !completed;
    setCompleted(newCompleted);
    if (onToggleComplete) {
      onToggleComplete(mealType);
    }
  };

  const getMealTypeInfo = (type: MealType) => {
    switch (type) {
      case "breakfast":
        return {
          label: "Sarapan",
          color: "bg-yellow-100 text-yellow-800",
          icon: "🌅",
        };
      case "lunch":
        return {
          label: "Makan Siang",
          color: "bg-blue-100 text-blue-800",
          icon: "☀️",
        };
      case "dinner":
        return {
          label: "Makan Malam",
          color: "bg-purple-100 text-purple-800",
          icon: "🌙",
        };
      default:
        return {
          label: "Makanan",
          color: "bg-gray-100 text-gray-800",
          icon: "🍽️",
        };
    }
  };

  const mealInfo = getMealTypeInfo(mealType);

  return (
    <div
      className={`bg-white rounded-lg shadow-md p-6 transition-all duration-300 ${
        completed ? "opacity-75 ring-2 ring-green-500" : "hover:shadow-lg"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{mealInfo.icon}</span>
          <div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${mealInfo.color}`}
            >
              {mealInfo.label}
            </span>
            <h3 className="text-lg font-semibold text-gray-900 mt-1">
              {mealPlan.name}
            </h3>
          </div>
        </div>

        <button
          onClick={handleToggleComplete}
          className={`p-2 rounded-full transition-colors ${
            completed
              ? "bg-green-500 text-white"
              : "bg-gray-200 text-gray-600 hover:bg-green-500 hover:text-white"
          }`}
        >
          <Check className="w-5 h-5" />
        </button>
      </div>

      {/* Description */}
      {mealPlan.description && (
        <p className="text-gray-600 text-sm mb-4">{mealPlan.description}</p>
      )}

      {/* Foods List */}
      <div className="space-y-2 mb-4">
        {mealPlan.foods.map((food, index) => (
          <div
            key={index}
            className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center space-x-2">
              <ChefHat className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-900">
                {food.name}
              </span>
              <span className="text-xs text-gray-500">({food.portion})</span>
            </div>
            <span className="text-sm font-medium text-gray-700">
              {food.calories} kcal
            </span>
          </div>
        ))}
      </div>

      {/* Total Calories */}
      <div className="border-t pt-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">
            Total Kalori:
          </span>
          <span className="text-lg font-bold text-primary-600">
            {mealPlan.total_calories} kcal
          </span>
        </div>
      </div>

      {/* Completion Status */}
      {completed && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-green-600">
          <Check className="w-4 h-4" />
          <span className="text-sm font-medium">Selesai</span>
        </div>
      )}
    </div>
  );
};

export default MealPlanCard;
