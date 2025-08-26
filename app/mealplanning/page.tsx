"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import MealPlanCard from "@/components/partials/MealPlanCard";
import { mealPlanningService, handleApiError } from "@/lib/api";
import {
  MealPlanResponse,
  MealType,
  GenerateMealPlanRequest,
} from "@/types/index";

const MealPlanningPage = () => {
  const [mealPlan, setMealPlan] = useState<MealPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [approach, setApproach] = useState<
    "balanced" | "breakfast_heavy" | "lunch_heavy"
  >("balanced");
  const [useML, setUseML] = useState(true);
  const [tips, setTips] = useState<string[]>([]);
  const [mlInfo, setMlInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [completionLoading, setCompletionLoading] = useState<
    Record<MealType, boolean>
  >({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  // Load meal plan on component mount and date change
  useEffect(() => {
    loadMealPlan(selectedDate);
  }, [selectedDate]);

  const loadMealPlan = async (date: string) => {
    try {
      setLoading(true);
      setError(null);

      const result = await mealPlanningService.getDailyPlan(date);

      if (result && result.meal_plan) {
        setMealPlan(result.meal_plan);
      } else {
        setMealPlan(null);
      }
    } catch (err) {
      console.error("Error loading meal plan:", err);
      // Check if it's a 404 error (no meal plan found)
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        (err as any).response?.status === 404
      ) {
        setMealPlan(null);
      } else {
        setError(handleApiError(err));
      }
    } finally {
      setLoading(false);
    }
  };

  const generateMealPlan = async (forceRegenerate: boolean = false) => {
    try {
      setLoading(true);
      setError(null);

      const requestBody: GenerateMealPlanRequest = {
        date: selectedDate,
        approach,
        force_regenerate: forceRegenerate,
        use_ml: useML,
      };

      const data = await mealPlanningService.generateDailyPlan(requestBody);

      setMealPlan(data.meal_plan);
      setTips(data.tips || []);
      setMlInfo(data.ml_info || null);
    } catch (err) {
      console.error("Error generating meal plan:", err);
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const toggleMealCompletion = async (mealType: MealType) => {
    if (!mealPlan) return;

    try {
      // Set loading state untuk meal type ini
      setCompletionLoading((prev) => ({ ...prev, [mealType]: true }));

      const currentStatus = mealPlan.completion_status[mealType];

      // Optimistically update local state first
      setMealPlan((prev) =>
        prev
          ? {
              ...prev,
              completion_status: {
                ...prev.completion_status,
                [mealType]: !currentStatus,
              },
            }
          : null
      );

      // Make API call
      const result = await mealPlanningService.markMealCompleted(
        selectedDate,
        mealType,
        !currentStatus
      );

      // Update with server response
      setMealPlan((prev) =>
        prev
          ? {
              ...prev,
              completion_status: result.completion_status,
              completion_rate: result.completion_rate,
            }
          : null
      );
    } catch (err) {
      console.error("Error updating meal completion:", err);
      setError(handleApiError(err));

      // Revert optimistic update on error
      if (mealPlan) {
        setMealPlan((prev) =>
          prev
            ? {
                ...prev,
                completion_status: {
                  ...prev.completion_status,
                  [mealType]: mealPlan.completion_status[mealType], // Revert to original state
                },
              }
            : null
        );
      }
    } finally {
      setCompletionLoading((prev) => ({ ...prev, [mealType]: false }));
    }
  };

  const getApproachLabel = (approach: string) => {
    switch (approach) {
      case "balanced":
        return "Seimbang";
      case "breakfast_heavy":
        return "Sarapan Besar";
      case "lunch_heavy":
        return "Makan Siang Besar";
      default:
        return "Seimbang";
    }
  };

  const getCompletionStats = () => {
    if (!mealPlan || !mealPlan.completion_status)
      return { completed: 0, total: 3 };

    const completed = Object.values(mealPlan.completion_status).filter(
      (status) => status
    ).length;
    return { completed, total: 3 };
  };

  const completionStats = getCompletionStats();

  // Handler untuk regenerate dengan force
  const handleRegenerate = () => generateMealPlan(true);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 mt-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Meal Planning
          </h1>
          <p className="text-gray-600">
            Rencanakan makanan harian Anda dengan rekomendasi AI yang
            dipersonalisasi
          </p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            {/* Date Picker */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className=" w-4 h-4 inline mr-1" />
                Tanggal
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Approach Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Target className="w-4 h-4 inline mr-1" />
                Pendekatan
              </label>
              <select
                value={approach}
                onChange={(e) => setApproach(e.target.value as any)}
                className="w-full px-3 py-2 text-gray-500 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="balanced">Seimbang</option>
                <option value="breakfast_heavy">Sarapan Besar</option>
                <option value="lunch_heavy">Makan Siang Besar</option>
              </select>
            </div>

            {/* ML Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Sparkles className="w-4 h-4 inline mr-1" />
                AI Personalisasi
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="useML"
                  checked={useML}
                  onChange={(e) => setUseML(e.target.checked)}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="useML" className="text-sm text-gray-700">
                  Gunakan AI
                </label>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <button
                onClick={() => generateMealPlan(false)}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                {mealPlan ? "Update" : "Buat"}
              </button>

              {mealPlan && (
                <button
                  onClick={handleRegenerate}
                  disabled={loading}
                  className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">
              {mealPlan ? "Mengupdate meal plan..." : "Membuat meal plan..."}
            </p>
          </div>
        )}

        {/* Meal Plan Content */}
        {!loading && mealPlan && (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              {/* Total Calories */}
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center space-x-2 mb-1">
                  <Target className="w-4 h-4 text-orange-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Target Kalori
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {mealPlan.total_target_calories}
                </p>
                <p className="text-xs text-gray-500">kcal</p>
              </div>

              {/* Completion Rate */}
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center space-x-2 mb-1">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Progress
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">
                  {completionStats.completed}/{completionStats.total}
                </p>
                <p className="text-xs text-gray-500">makanan selesai</p>
              </div>

              {/* Approach */}
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center space-x-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Pendekatan
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {getApproachLabel(mealPlan.approach)}
                </p>
              </div>

              {/* ML Status */}
              <div className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-center space-x-2 mb-1">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                  <span className="text-sm font-medium text-gray-700">
                    AI Status
                  </span>
                </div>
                <p className="text-lg font-bold text-gray-900">
                  {mealPlan.personalization_status?.is_personalized
                    ? "Aktif"
                    : "Template"}
                </p>
                {mlInfo && (
                  <p className="text-xs text-gray-500">{mlInfo.method_used}</p>
                )}
              </div>
            </div>

            {/* Meal Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <MealPlanCard
                mealPlan={mealPlan.breakfast_plan}
                mealType="breakfast"
                isCompleted={mealPlan.completion_status?.breakfast || false}
                onToggleComplete={toggleMealCompletion}
                mealTime={mealPlan.meal_times?.breakfast}
              />
              <MealPlanCard
                mealPlan={mealPlan.lunch_plan}
                mealType="lunch"
                isCompleted={mealPlan.completion_status?.lunch || false}
                onToggleComplete={toggleMealCompletion}
                mealTime={mealPlan.meal_times?.lunch}
              />
              <MealPlanCard
                mealPlan={mealPlan.dinner_plan}
                mealType="dinner"
                isCompleted={mealPlan.completion_status?.dinner || false}
                onToggleComplete={toggleMealCompletion}
                mealTime={mealPlan.meal_times?.dinner}
              />
            </div>

            {/* Tips Section */}
            {tips.length > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Sparkles className="w-5 h-5 text-purple-500 mr-2" />
                  Tips Hari Ini
                </h3>
                <div className="space-y-2">
                  {tips.map((tip, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <span className="text-purple-500 font-bold text-sm mt-0.5">
                        •
                      </span>
                      <p className="text-sm text-gray-700">{tip}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && !mealPlan && (
          <div className="text-center py-12">
            <div className="bg-white rounded-lg shadow-sm border p-8">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Belum Ada Meal Plan
              </h3>
              <p className="text-gray-600 mb-6">
                Buat meal plan untuk tanggal {selectedDate} dengan mengklik
                tombol "Buat" di atas
              </p>
              <button
                onClick={() => generateMealPlan()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                <span>Buat Meal Plan</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlanningPage;
