// types/index.ts - Complete TypeScript definitions based on API documentation

// ==================== USER TYPES ====================
export interface User {
  user_id: number;
  email: string;
  nama: string;
  umur?: number;
  jenis_kelamin?: "L" | "P";
  tinggi_badan?: number;
  berat_badan?: number;
  target_berat?: number;
  aktivitas?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  diet_goal?: "menurunkan" | "menjaga" | "menambah";
  alergi?: string;
  bmr?: number;
  target_kalori?: number;
  is_active: boolean;
  role: string;
  meal_preferences?: MealPreferences;
}

export interface MealPreferences {
  dietary_restrictions?: string[];
  allergies?: string[];
  preferred_cuisine?: string[];
  favorite_foods?: string[];
  avoid_foods?: string[];
  meal_timing?: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  portion_preference?: "small" | "medium" | "large";
}

// ==================== FOOD TYPES ====================
export interface Food {
  user_liked: undefined;
  user_rating: any;
  food_id: number;
  name?: string;
  nama_makanan: string;
  air?: number;
  energi: number;
  protein?: number;
  lemak?: number;
  karbohidrat?: number;
  serat?: number;
  natrium?: number;
  kalium?: number;
  category_id: number;
  category_name?: string;
  estimated_gi?: number;
  health_score?: number;
  nutrition_profile?: NutritionProfile;
  diet_suitability?: string;
  is_active: boolean;
  category?: FoodCategory;
  similarity_score?: number; // For similar foods
  portion: string;
  calories: number;
  base_calories_per_100g: number;
}

export interface NutritionProfile {
  high_protein: boolean;
  high_fiber: boolean;
  low_calorie: boolean;
  low_sodium: boolean;
  high_potassium: boolean;
}

export interface FoodCategory {
  category_id: number;
  category_name: string;
  category_code: string;
  description?: string;
}

// ==================== RATING TYPES ====================
export interface UserRating {
  rating_id: number;
  user_id: number;
  food_id: number;
  rating?: number;
  is_liked?: boolean;
  interaction_type?: string;
  confidence?: number;
  context?: any;
  created_at: string;
  updated_at: string;
  food_name?: string;
}

export interface RatingRequest {
  rating: number;
  is_liked?: boolean;
}

// ==================== RECOMMENDATION TYPES ====================
export interface RecommendationResponse {
  success: boolean;
  data: {
    recommendations: Food[];
    total_recommendations: number;
    method_used: RecommendationMethod;
    total_users: number;
    user_id: number;
  };
  message: string;
}

export type RecommendationMethod = "content_based" | "collaborative" | "hybrid";

export interface MethodInfo {
  success: boolean;
  data: {
    current_method: RecommendationMethod;
    total_users: number;
    users_needed_for_collaborative: number;
    collaborative_available: boolean;
    user_ratings_count: number;
    total_ratings_in_system: number;
    existing_endpoints: Record<string, string>;
    method_description: Record<RecommendationMethod, string>;
  };
}

export interface UserRecommendationStats {
  success: boolean;
  data: {
    total_ratings: number;
    liked_foods: number;
    disliked_foods: number;
    average_rating: number;
    rating_distribution: Record<string, number>;
    categories_rated: Record<string, number>;
    recommendations_received: number;
    rating_density: number;
    recommendation_readiness: {
      content_based_ready: boolean;
      collaborative_ready: boolean;
      suggestions: string[];
    };
  };
}

export interface RecommendationHistory {
  success: boolean;
  data: {
    history: RecommendationHistoryItem[];
    pagination: {
      page: number;
      per_page: number;
      total: number;
      pages: number;
      has_next: boolean;
      has_prev: boolean;
    };
  };
}

export interface RecommendationHistoryItem {
  history_id: number;
  food_id: number;
  recommendation_type: RecommendationMethod;
  similarity_score?: number;
  final_score?: number;
  is_clicked: boolean;
  recommended_at: string;
  food_info: {
    nama_makanan: string;
    category_id: number;
    energi: number;
    health_score?: number;
  };
}

export interface SimilarFoodsResponse {
  similar_foods: never[];
  success: boolean;
  data: {
    target_food: {
      food_id: number;
      nama_makanan: string;
      category_id: number;
    };
    similar_foods: Food[];
    total_found: number;
  };
}

export interface CollaborativeReadiness {
  success: boolean;
  data: {
    collaborative_available: boolean;
    user_ready_for_collaborative: boolean;
    requirements: {
      min_users: number;
      current_users: number;
      min_total_ratings: number;
      current_total_ratings: number;
      min_user_ratings: number;
      current_user_ratings: number;
    };
    recommendations: {
      suggested_method: RecommendationMethod;
      next_steps: string[];
    };
  };
}

export interface SystemStats {
  success: boolean;
  data: {
    system_overview: {
      total_users: number;
      total_foods: number;
      total_ratings: number;
      collaborative_available: boolean;
      current_method: RecommendationMethod;
      users_with_ratings: number;
      users_with_recommendations: number;
    };
    method_usage: Record<string, number>;
    rating_distribution: Record<string, number>;
    category_distribution: Record<string, number>;
    engagement_metrics: {
      rating_participation_rate: number;
      recommendation_usage_rate: number;
      average_ratings_per_user: number;
      average_recommendations_per_user: number;
    };
  };
}

// ==================== MEAL PLANNING TYPES ====================

export interface MealPlan {
  name: string;
  description: string;
  foods: Food[];
  total_calories: number;
  source: string;
}

export interface PersonalizationStatus {
  is_personalized: boolean;
  ml_method_used: string;
  snapshot_id: number;
  total_recommendations_used: number;
  breakfast_source: string;
  lunch_source: string;
  dinner_source: string;
}

export interface CompletionStatus {
  breakfast: boolean;
  lunch: boolean;
  dinner: boolean;
}

export interface MealTimes {
  breakfast: string;
  lunch: string;
  dinner: string;
}

export interface MealPlanResponse {
  plan_id: number;
  user_id: number;
  plan_date: string;
  approach: string;
  breakfast_plan: MealPlan;
  lunch_plan: MealPlan;
  dinner_plan: MealPlan;
  total_target_calories: number;
  actual_calories: number | null;
  completion_rate: number;
  completion_status: CompletionStatus;
  meal_times: MealTimes;
  personalization_status: PersonalizationStatus;
  snapshot_id: number;
  created_at: string;
  updated_at: string;
}

export type MealType = "breakfast" | "lunch" | "dinner";

export interface MealPlanCardProps {
  mealPlan: MealPlan;
  mealType: MealType;
  isCompleted?: boolean;
  onToggleComplete?: (mealType: MealType) => void | Promise<void>; // Support async
  mealTime?: string;
}

export interface GenerateMealPlanRequest {
  date?: string;
  approach?: "balanced" | "breakfast_heavy" | "lunch_heavy";
  force_regenerate?: boolean;
  use_ml?: boolean;
}

// ==================== MEDICAL CONDITION TYPES ====================
export interface MedicalCondition {
  id: any;
  condition_id: number;
  condition_name: string;
  condition_code: string;
  description?: string;
  dietary_focus?: string;
}

export interface UserMedicalCondition {
  condition_id: number;
  condition_name: string;
  condition_code: string;
  severity: "ringan" | "sedang" | "berat";
  notes?: string;
}

export interface UpdateMedicalConditionsRequest {
  conditions: {
    condition_id: number;
    severity?: "ringan" | "sedang" | "berat";
    notes?: string;
  }[];
}

// ==================== API RESPONSE TYPES ====================
export interface ApiResponse<T = any> {
  success?: boolean;
  message?: string;
  meal_plan: MealPlanResponse;
  ml_info?: {
    is_ml_powered: boolean;
    method_used: string;
    recommendations_count: number;
  };
  tips: string[];
  data?: T;
  error?: string;
  total?: number;
}

export interface LoginResponse {
  message: string;
  token: string;
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
  has_next?: boolean;
  has_prev?: boolean;
}

export interface FoodsResponse {
  data: Food[];
  total_pages: number;
  foods: Food[];
  total: number;
  pages: number;
  current_page: number;
  per_page: number;
}

export interface CategoriesResponse {
  categories: FoodCategory[];
}

export interface RatingsResponse {
  ratings: UserRating[];
}

// ==================== FORM TYPES ====================
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  nama: string;
  email: string;
  password: string;
  confirmPassword?: string;
  umur?: number;
  jenis_kelamin?: "L" | "P";
  tinggi_badan?: number;
  berat_badan?: number;
  target_berat?: number;
  aktivitas?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  diet_goal?: "menurunkan" | "menjaga" | "menambah";
  alergi?: string;
}

export interface ProfileUpdateForm {
  nama?: string;
  umur?: number;
  jenis_kelamin?: "L" | "P";
  tinggi_badan?: number;
  berat_badan?: number;
  target_berat?: number;
  aktivitas?: "sedentary" | "light" | "moderate" | "active" | "very_active";
  diet_goal?: "menurunkan" | "menjaga" | "menaikkan"; // ✅ Ubah dari "menambah" ke "menaikkan"
  bmr?: number;
  target_kalori?: number;
  alergi?: string;
}

// ==================== UTILITY TYPES ====================
export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  database?: "connected" | "disconnected";
  message?: string;
  error?: string;
  recommendation_system?: {
    total_users: number;
    current_method: RecommendationMethod;
    collaborative_available: boolean;
    database_connected: boolean;
  };
  timestamp: string;
}

// ==================== COMPONENT PROP TYPES ====================
export interface FoodCardProps {
  food: Food;
  showRating?: boolean;
  onRatingUpdate?: (foodId: number, rating: number) => void;
  onClick?: () => void;
}

export interface RecommendationCardProps {
  recommendation: Food;
  onRate?: (foodId: number, rating: number) => void;
  onSimilarFoods?: (foodId: number) => void;
}

// ==================== ERROR TYPES ====================
export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: any;
}

// ==================== LOADING STATE TYPES ====================
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data?: T | null;
}

// ==================== SEARCH & FILTER TYPES ====================
export interface FoodSearchParams {
  page?: number;
  per_page?: number;
  category_id?: number;
  search?: string;
}

export interface RecommendationParams {
  limit?: number;
  method?: RecommendationMethod;
}

// ==================== ANALYTICS TYPES ====================
export interface UserEngagementMetrics {
  total_ratings: number;
  recommendations_received: number;
  click_through_rate: number;
  average_session_duration: number;
  favorite_categories: string[];
}

export interface RecommendationPerformance {
  method: RecommendationMethod;
  accuracy_score: number;
  user_satisfaction: number;
  click_through_rate: number;
  conversion_rate: number;
}

// ==================== ENUM TYPES ====================
export enum ActivityLevel {
  SEDENTARY = "sedentary",
  LIGHT = "light",
  MODERATE = "moderate",
  ACTIVE = "active",
  VERY_ACTIVE = "very_active",
}

export enum DietGoal {
  LOSE = "menurunkan",
  MAINTAIN = "menjaga",
  GAIN = "menambah",
}

export enum Gender {
  MALE = "L",
  FEMALE = "P",
}

export enum Severity {
  MILD = "ringan",
  MODERATE = "sedang",
  SEVERE = "berat",
}
