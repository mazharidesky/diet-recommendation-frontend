// lib/api.ts - Complete API client based on documentation

import axios, { AxiosInstance, AxiosResponse } from "axios";
import Cookies from "js-cookie";
import {
  // Auth types
  LoginForm,
  RegisterForm,
  LoginResponse,
  User,
  // Food types
  Food,
  FoodCategory,
  FoodsResponse,
  CategoriesResponse,
  UserRating,
  RatingRequest,
  RatingsResponse,
  // Recommendation types
  RecommendationResponse,
  MethodInfo,
  UserRecommendationStats,
  RecommendationHistory,
  SimilarFoodsResponse,
  CollaborativeReadiness,
  SystemStats,
  RecommendationParams,
  // Meal planning types
  GenerateMealPlanRequest,
  GenerateMealPlanResponse,
  WeeklyMealPlan,
  TodayMealStatus,
  MealCompletionRequest,
  MealCompletionResponse,
  WeeklyProgress,
  MealTimeRecommendations,
  QuickMealSuggestions,
  MealPreferences,
  DailyMealPlan,
  MealType,
  // Profile types
  ProfileUpdateForm,
  MedicalCondition,
  UserMedicalCondition,
  UpdateMedicalConditionsRequest,
  // Utility types
  ApiResponse,
  HealthCheckResponse,
  FoodSearchParams,
  PaginatedResponse,
} from "@/types";

class ApiClient {
  private client: AxiosInstance;
  private baseURL: string;

  constructor() {
    this.baseURL =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000, // 10 second timeout
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - Add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = Cookies.get("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor - Handle auth errors
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          Cookies.remove("token");
          if (typeof window !== "undefined") {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // ==================== AUTHENTICATION API ====================

  async register(userData: RegisterForm): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(
      "/auth/register",
      userData
    );
    return response.data;
  }

  async login(credentials: LoginForm): Promise<LoginResponse> {
    const response = await this.client.post<LoginResponse>(
      "/auth/login",
      credentials
    );
    return response.data;
  }

  async getProfile(): Promise<{ user: User }> {
    const response = await this.client.get<{ user: User }>("/auth/profile");
    return response.data;
  }

  // ==================== FOODS API ====================

  async getFoods(params?: FoodSearchParams): Promise<FoodsResponse> {
    const response = await this.client.get<FoodsResponse>("/foods/", {
      params,
    });
    return response.data;
  }

  async getFood(id: number): Promise<{ food: Food }> {
    const response = await this.client.get<{ food: Food }>(`/foods/${id}`);
    return response.data;
  }

  async getCategories(): Promise<CategoriesResponse> {
    const response = await this.client.get<CategoriesResponse>(
      "/foods/categories"
    );
    return response.data;
  }

  async rateFood(
    id: number,
    rating: RatingRequest
  ): Promise<{ message: string }> {
    const response = await this.client.post<{ message: string }>(
      `/foods/${id}/rate`,
      rating
    );
    return response.data;
  }

  async getMyRatings(): Promise<RatingsResponse> {
    const response = await this.client.get<RatingsResponse>(
      "/foods/my-ratings"
    );
    return response.data;
  }

  // ==================== ENHANCED RECOMMENDATION API ====================

  // Main smart recommendation endpoint
  async getSmartRecommendations(
    params?: RecommendationParams
  ): Promise<RecommendationResponse> {
    const response = await this.client.get<RecommendationResponse>(
      "/recommendations/",
      { params }
    );
    return response.data;
  }

  async getContentBasedRecommendations(params?: RecommendationParams): Promise<{
    recommendations: Food[];
    total: number;
    recommendation_type: string;
  }> {
    const response = await this.client.get("/recommendations/content-based", {
      params,
    });
    return response.data;
  }

  async getCollaborativeRecommendations(
    params?: RecommendationParams
  ): Promise<{
    recommendations: Food[];
    total: number;
    recommendation_type: string;
    total_users_in_system: number;
  }> {
    const response = await this.client.get("/recommendations/collaborative", {
      params,
    });
    return response.data;
  }

  async getHybridRecommendations(params?: RecommendationParams): Promise<{
    recommendations: Food[];
    total: number;
    recommendation_type: string;
    total_users_in_system: number;
    collaborative_available: boolean;
  }> {
    const response = await this.client.get("/recommendations/hybrid", {
      params,
    });
    return response.data;
  }

  async getRecommendationsForCondition(
    conditionCode: string,
    limit: number = 10
  ): Promise<{
    recommendations: Food[];
    condition: string;
    total: number;
  }> {
    const response = await this.client.get(
      `/recommendations/for-condition/${conditionCode}`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  // Recommendation analytics and info
  async getMethodInfo(): Promise<MethodInfo> {
    const response = await this.client.get<MethodInfo>(
      "/recommendations/method-info"
    );
    return response.data;
  }

  async getUserRecommendationStats(): Promise<UserRecommendationStats> {
    const response = await this.client.get<UserRecommendationStats>(
      "/recommendations/user-recommendation-stats"
    );
    return response.data;
  }

  async getRecommendationHistory(params?: {
    page?: number;
    per_page?: number;
    type?: string;
  }): Promise<RecommendationHistory> {
    const response = await this.client.get<RecommendationHistory>(
      "/recommendations/recommendation-history",
      { params }
    );
    return response.data;
  }

  async trackRecommendationClick(
    historyId: number
  ): Promise<{ success: boolean; message: string }> {
    const response = await this.client.post<{
      success: boolean;
      message: string;
    }>("/recommendations/click-recommendation", {
      history_id: historyId,
    });
    return response.data;
  }

  async getSimilarFoods(
    foodId: number,
    limit: number = 5
  ): Promise<SimilarFoodsResponse> {
    const response = await this.client.get<SimilarFoodsResponse>(
      `/recommendations/similar-foods/${foodId}`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  async validateCollaborativeReadiness(): Promise<CollaborativeReadiness> {
    const response = await this.client.get<CollaborativeReadiness>(
      "/recommendations/validate-collaborative"
    );
    return response.data;
  }

  async getSystemStats(): Promise<SystemStats> {
    const response = await this.client.get<SystemStats>(
      "/recommendations/system-stats"
    );
    return response.data;
  }

  async getRecommendationHealth(): Promise<HealthCheckResponse> {
    const response = await this.client.get<HealthCheckResponse>(
      "/recommendations/health"
    );
    return response.data;
  }

  // ==================== MEAL PLANNING API ====================

  async generateDailyMealPlan(
    request: GenerateMealPlanRequest
  ): Promise<GenerateMealPlanResponse> {
    const response = await this.client.post<GenerateMealPlanResponse>(
      "/meal-planning/generate-plan",
      request
    );
    return response.data;
  }

  async generateWeeklyMealPlan(request: {
    start_date?: string;
    approach?: string;
  }): Promise<{
    message: string;
    start_date: string;
    end_date: string;
    weekly_plans: any[];
    approach: string;
  }> {
    const response = await this.client.post(
      "/meal-planning/generate-weekly-plan",
      request
    );
    return response.data;
  }

  async getDailyMealPlan(date: string): Promise<{
    date: string;
    meal_plan: DailyMealPlan;
  }> {
    const response = await this.client.get(`/meal-planning/plan/${date}`);
    return response.data;
  }

  async getWeeklyMealPlans(startDate: string): Promise<WeeklyMealPlan> {
    const response = await this.client.get<WeeklyMealPlan>(
      `/meal-planning/plans/week/${startDate}`
    );
    return response.data;
  }

  async markMealCompleted(
    request: MealCompletionRequest
  ): Promise<MealCompletionResponse> {
    const response = await this.client.post<MealCompletionResponse>(
      "/meal-planning/mark-completed",
      request
    );
    return response.data;
  }

  async getTodayMealStatus(): Promise<TodayMealStatus> {
    const response = await this.client.get<TodayMealStatus>(
      "/meal-planning/today-status"
    );
    return response.data;
  }

  async updateSpecificMeal(
    date: string,
    mealType: MealType,
    mealData: any
  ): Promise<{
    message: string;
    updated_plan: DailyMealPlan;
  }> {
    const response = await this.client.put(
      `/meal-planning/plan/${date}/meal/${mealType}`,
      {
        meal_data: mealData,
      }
    );
    return response.data;
  }

  async getWeeklyProgress(startDate: string): Promise<WeeklyProgress> {
    const response = await this.client.get<WeeklyProgress>(
      `/meal-planning/progress/weekly/${startDate}`
    );
    return response.data;
  }

  async getMealTimeRecommendations(): Promise<MealTimeRecommendations> {
    const response = await this.client.get<MealTimeRecommendations>(
      "/meal-planning/meal-times"
    );
    return response.data;
  }

  async getQuickMealSuggestions(): Promise<QuickMealSuggestions> {
    const response = await this.client.get<QuickMealSuggestions>(
      "/meal-planning/quick-suggestions"
    );
    return response.data;
  }

  async getMealPreferences(): Promise<{ preferences: MealPreferences }> {
    const response = await this.client.get<{ preferences: MealPreferences }>(
      "/meal-planning/preferences"
    );
    return response.data;
  }

  async updateMealPreferences(preferences: MealPreferences): Promise<{
    message: string;
    preferences: MealPreferences;
  }> {
    const response = await this.client.put("/meal-planning/preferences", {
      preferences,
    });
    return response.data;
  }

  // ==================== USER MANAGEMENT API ====================

  async updateProfile(data: ProfileUpdateForm): Promise<{
    message: string;
    user: User;
  }> {
    const response = await this.client.put("/users/profile", data);
    return response.data;
  }

  async getMedicalConditions(): Promise<{ conditions: MedicalCondition[] }> {
    const response = await this.client.get<{ conditions: MedicalCondition[] }>(
      "/users/medical-conditions"
    );
    return response.data;
  }

  async updateMedicalConditions(data: UpdateMedicalConditionsRequest): Promise<{
    message: string;
  }> {
    const response = await this.client.post<{ message: string }>(
      "/users/medical-conditions",
      data
    );
    return response.data;
  }

  async getMyMedicalConditions(): Promise<{
    conditions: UserMedicalCondition[];
    has_medical_conditions: boolean;
    message: string;
  }> {
    const response = await this.client.get("/users/my-medical-conditions");
    return response.data;
  }

  // ==================== SYSTEM API ====================

  async healthCheck(): Promise<HealthCheckResponse> {
    const response = await this.client.get<HealthCheckResponse>("/health");
    return response.data;
  }

  // ==================== UTILITY METHODS ====================

  // Generic method for custom endpoints
  async get<T = any>(url: string, params?: any): Promise<T> {
    const response = await this.client.get<T>(url, { params });
    return response.data;
  }

  async post<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.post<T>(url, data);
    return response.data;
  }

  async put<T = any>(url: string, data?: any): Promise<T> {
    const response = await this.client.put<T>(url, data);
    return response.data;
  }

  async delete<T = any>(url: string): Promise<T> {
    const response = await this.client.delete<T>(url);
    return response.data;
  }

  // Get current base URL
  getBaseURL(): string {
    return this.baseURL;
  }

  // Update auth token
  setAuthToken(token: string): void {
    Cookies.set("token", token, { expires: 7 });
  }

  // Remove auth token
  removeAuthToken(): void {
    Cookies.remove("token");
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!Cookies.get("token");
  }
}

// ==================== API SERVICE CLASSES ====================

class AuthService {
  constructor(private api: ApiClient) {}

  async login(credentials: LoginForm): Promise<LoginResponse> {
    console.log("🔥 AuthService.login called with:", {
      email: credentials.email,
    });

    try {
      const response = await this.api.login(credentials);
      console.log("🔥 API response:", response);

      // PENTING: Simpan token setelah login berhasil
      if (response.token) {
        console.log(
          "🔥 Storing token:",
          response.token.substring(0, 20) + "..."
        );
        this.api.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error("🔥 AuthService.login error:", error);
      throw error;
    }
  }

  async register(userData: RegisterForm): Promise<LoginResponse> {
    console.log("🔥 AuthService.register called");

    try {
      const response = await this.api.register(userData);
      console.log("🔥 Register response:", response);

      // PENTING: Simpan token setelah register berhasil
      if (response.token) {
        console.log(
          "🔥 Storing token after register:",
          response.token.substring(0, 20) + "..."
        );
        this.api.setAuthToken(response.token);
      }

      return response;
    } catch (error) {
      console.error("🔥 AuthService.register error:", error);
      throw error;
    }
  }

  async getProfile(): Promise<{ user: User }> {
    return this.api.getProfile();
  }

  async logout(): Promise<void> {
    console.log("🔥 Logging out - removing token");
    this.api.removeAuthToken();
  }

  isAuthenticated(): boolean {
    const isAuth = this.api.isAuthenticated();
    console.log("🔥 isAuthenticated check:", isAuth);
    return isAuth;
  }
}

class FoodService {
  constructor(private api: ApiClient) {}

  async getFoods(params?: FoodSearchParams): Promise<FoodsResponse> {
    return this.api.getFoods(params);
  }

  async getFood(id: number): Promise<{ food: Food }> {
    return this.api.getFood(id);
  }

  async getCategories(): Promise<CategoriesResponse> {
    return this.api.getCategories();
  }

  async rateFood(
    id: number,
    rating: RatingRequest
  ): Promise<{ message: string }> {
    return this.api.rateFood(id, rating);
  }

  async getMyRatings(): Promise<RatingsResponse> {
    return this.api.getMyRatings();
  }
}

class RecommendationService {
  constructor(private api: ApiClient) {}

  // Main recommendation methods
  async getRecommendations(
    params?: RecommendationParams
  ): Promise<RecommendationResponse> {
    return this.api.getSmartRecommendations(params);
  }

  async getContentBased(params?: RecommendationParams) {
    return this.api.getContentBasedRecommendations(params);
  }

  async getCollaborative(params?: RecommendationParams) {
    return this.api.getCollaborativeRecommendations(params);
  }

  async getHybrid(params?: RecommendationParams) {
    return this.api.getHybridRecommendations(params);
  }

  async getForCondition(conditionCode: string, limit?: number) {
    return this.api.getRecommendationsForCondition(conditionCode, limit);
  }

  // Analytics and tracking
  async getMethodInfo(): Promise<MethodInfo> {
    return this.api.getMethodInfo();
  }

  async getUserStats(): Promise<UserRecommendationStats> {
    return this.api.getUserRecommendationStats();
  }

  async getHistory(params?: {
    page?: number;
    per_page?: number;
    type?: string;
  }) {
    return this.api.getRecommendationHistory(params);
  }

  async trackClick(historyId: number) {
    return this.api.trackRecommendationClick(historyId);
  }

  async getSimilarFoods(
    foodId: number,
    limit?: number
  ): Promise<SimilarFoodsResponse> {
    return this.api.getSimilarFoods(foodId, limit);
  }

  async validateCollaborative(): Promise<CollaborativeReadiness> {
    return this.api.validateCollaborativeReadiness();
  }

  async getSystemStats(): Promise<SystemStats> {
    return this.api.getSystemStats();
  }
}

class MealPlanningService {
  constructor(private api: ApiClient) {}

  async generateDailyPlan(
    request: GenerateMealPlanRequest
  ): Promise<GenerateMealPlanResponse> {
    return this.api.generateDailyMealPlan(request);
  }

  async generateWeeklyPlan(request: {
    start_date?: string;
    approach?: string;
  }) {
    return this.api.generateWeeklyMealPlan(request);
  }

  async getDailyPlan(date: string) {
    return this.api.getDailyMealPlan(date);
  }

  async getWeeklyPlans(startDate: string): Promise<WeeklyMealPlan> {
    return this.api.getWeeklyMealPlans(startDate);
  }

  async markMealCompleted(
    request: MealCompletionRequest
  ): Promise<MealCompletionResponse> {
    return this.api.markMealCompleted(request);
  }

  async getTodayStatus(): Promise<TodayMealStatus> {
    return this.api.getTodayMealStatus();
  }

  async updateMeal(date: string, mealType: MealType, mealData: any) {
    return this.api.updateSpecificMeal(date, mealType, mealData);
  }

  async getWeeklyProgress(startDate: string): Promise<WeeklyProgress> {
    return this.api.getWeeklyProgress(startDate);
  }

  async getMealTimes(): Promise<MealTimeRecommendations> {
    return this.api.getMealTimeRecommendations();
  }

  async getQuickSuggestions(): Promise<QuickMealSuggestions> {
    return this.api.getQuickMealSuggestions();
  }

  async getPreferences(): Promise<{ preferences: MealPreferences }> {
    return this.api.getMealPreferences();
  }

  async updatePreferences(preferences: MealPreferences) {
    return this.api.updateMealPreferences(preferences);
  }
}

// Tambahkan function untuk test API secara manual
const debugProfileUpdate = async () => {
  const token = document.cookie.split("token=")[1]?.split(";")[0];

  // Test dengan data minimal dulu
  const minimalData = {
    nama: "Azhari Desky",
    umur: 22,
    jenis_kelamin: "L",
  };

  console.log("🔍 Testing minimal data:", minimalData);

  try {
    const response = await fetch("http://localhost:5000/api/users/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(minimalData),
    });

    console.log("✅ Response status:", response.status);
    const data = await response.json();
    console.log("✅ Response data:", data);

    if (!response.ok) {
      console.error("❌ Error response:", data);
    }
  } catch (error) {
    console.error("❌ Network error:", error);
  }
};

// Test dengan data lengkap tapi nilai 0 instead of null
const testFullData = async () => {
  const token = document.cookie.split("token=")[1]?.split(";")[0];

  const fullData = {
    nama: "Azhari Desky",
    umur: 22,
    jenis_kelamin: "L",
    tinggi_badan: 0, // Coba dengan 0 instead of null
    berat_badan: 0,
    target_berat: 0,
    aktivitas: "very_active",
    diet_goal: "menambah",
    alergi: "",
  };

  console.log("🔍 Testing full data with zeros:", fullData);

  try {
    const response = await fetch("http://localhost:5000/api/users/profile", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fullData),
    });

    console.log("✅ Response status:", response.status);
    const data = await response.json();
    console.log("✅ Response data:", data);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};

class UserService {
  constructor(private api: ApiClient) {}

  async updateProfile(data: ProfileUpdateForm) {
    return this.api.updateProfile(data);
  }

  async getMedicalConditions(): Promise<{ conditions: MedicalCondition[] }> {
    return this.api.getMedicalConditions();
  }

  async updateMedicalConditions(data: UpdateMedicalConditionsRequest) {
    return this.api.updateMedicalConditions(data);
  }

  async getMyMedicalConditions() {
    return this.api.getMyMedicalConditions();
  }
}

// ==================== MAIN API INSTANCE ====================

// Create singleton API client
const apiClient = new ApiClient();

// Create service instances
export const authService = new AuthService(apiClient);
export const foodService = new FoodService(apiClient);
export const recommendationService = new RecommendationService(apiClient);
export const mealPlanningService = new MealPlanningService(apiClient);
export const userService = new UserService(apiClient);

// Export the main API client for direct access if needed
export default apiClient;

// Export individual services for easy importing
export {
  AuthService,
  FoodService,
  RecommendationService,
  MealPlanningService,
  UserService,
};

// ==================== UTILITY FUNCTIONS ====================

// Helper function to handle API errors
export const handleApiError = (error: any): string => {
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.message) {
    return error.message;
  }
  return "Terjadi kesalahan pada server";
};

// Helper function to check if error is network error
export const isNetworkError = (error: any): boolean => {
  return !error.response && error.request;
};

// Helper function to check if error is server error
export const isServerError = (error: any): boolean => {
  return error.response && error.response.status >= 500;
};

// Helper function to check if error is client error
export const isClientError = (error: any): boolean => {
  return (
    error.response &&
    error.response.status >= 400 &&
    error.response.status < 500
  );
};
