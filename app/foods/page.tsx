"use client";

import { useState, useEffect } from "react";
import { foodService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import FoodCard from "@/components/partials/Foodcard";
import { Food, FoodCategory } from "@/types";
import { Search, Filter, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function FoodsPage() {
  const { isAuthenticated } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchFoods();
  }, [searchTerm, selectedCategory, currentPage]);

  const fetchCategories = async () => {
    try {
      const response = await foodService.getCategories();
      setCategories(response.categories || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchFoods = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: currentPage,
        per_page: 12,
      };
      if (selectedCategory) params.category_id = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await foodService.getFoods(params);
      setFoods(response.foods || []);
    } catch (error) {
      console.error("Error fetching foods:", error);
      toast.error("Gagal memuat data makanan");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchFoods();
  };

  const handleRatingUpdate = (foodId: number, rating: number) => {
    setFoods(
      foods.map((food) =>
        food.food_id === foodId ? { ...food, user_rating: rating } : food
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Katalog Makanan Diet
          </h1>
          <p className="text-lg text-gray-600">
            Jelajahi berbagai makanan sehat untuk program diet Anda
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Cari makanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="input-field"
              >
                <option value="">Semua Kategori</option>
                {categories.map((category) => (
                  <option
                    key={category.category_id}
                    value={category.category_id}
                  >
                    {category.category_name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-primary">
                <Search className="w-4 h-4 mr-2" />
                Cari
              </button>
            </div>
          </form>

          {/* Active Filters */}
          {(selectedCategory || searchTerm) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  Pencarian: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              )}
              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  Kategori:{" "}
                  {
                    categories.find(
                      (c) => c.category_id.toString() === selectedCategory
                    )?.category_name
                  }
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-2 text-green-600 hover:text-green-800"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            <span className="ml-2 text-gray-600">Memuat makanan...</span>
          </div>
        ) : foods.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Tidak ada makanan ditemukan
            </h3>
            <p className="text-gray-600 mb-4">
              Coba ubah kata kunci pencarian atau filter kategori
            </p>
            <button
              onClick={() => {
                setSearchTerm("");
                setSelectedCategory("");
                setCurrentPage(1);
              }}
              className="btn-secondary"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-gray-600">
                Menampilkan {foods.length} makanan
                {searchTerm && ` untuk "${searchTerm}"`}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {foods.map((food) => (
                <FoodCard
                  key={food.food_id}
                  food={food}
                  showRating={isAuthenticated}
                  onRatingUpdate={handleRatingUpdate}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
