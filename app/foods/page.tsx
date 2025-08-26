"use client";

import { useState, useEffect } from "react";
import { foodService } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import FoodCard from "@/components/partials/Foodcard";
import { Food, FoodCategory } from "@/types";
import {
  Search,
  Filter,
  Loader2,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function FoodsPage() {
  const { isAuthenticated } = useAuth();
  const [foods, setFoods] = useState<Food[]>([]);
  const [categories, setCategories] = useState<FoodCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const itemsPerPage = 12;

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
        per_page: itemsPerPage,
      };
      if (selectedCategory) params.category_id = selectedCategory;
      if (searchTerm) params.search = searchTerm;

      const response = await foodService.getFoods(params);
      const foodsData = response.foods || response.data || [];

      // Auto-calculate pagination if not provided by backend
      if (response.total_pages && response.total) {
        setTotalPages(response.total_pages);
        setTotalItems(response.total);
      } else {
        // Fallback: estimate based on received data
        setTotalItems(foodsData.length);
        if (foodsData.length === itemsPerPage) {
          // Assume there might be more pages
          setTotalPages(currentPage + 1);
        } else {
          // This is likely the last page
          setTotalPages(currentPage);
        }
      }

      setFoods(foodsData);
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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when changing page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;

    // Handle case where we don't know exact total pages
    const displayPages = Math.max(totalPages, currentPage);

    if (displayPages <= maxVisiblePages) {
      for (let i = 1; i <= displayPages; i++) {
        pages.push(i);
      }
      // Add next page if current data suggests there might be more
      if (foods.length === itemsPerPage && !pages.includes(currentPage + 1)) {
        pages.push(currentPage + 1);
      }
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4);
        if (foods.length === itemsPerPage) {
          pages.push("...", "more");
        }
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1);
        if (foods.length === itemsPerPage) {
          pages.push("...", "more");
        }
      }
    }

    return pages;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8 mt-16">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Katalog Makanan Diet
          </h1>
          <p className="text-lg text-gray-600">
            Jelajahi berbagai makanan sehat untuk program diet Anda
          </p>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <form onSubmit={handleSearch} className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Search Input */}
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Cari makanan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 placeholder-gray-400"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>

              {/* Category Select */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-gray-700 bg-white min-w-48"
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

              {/* Search Button */}
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center justify-center gap-2 min-w-fit"
              >
                <Search className="w-4 h-4" />
                Cari
              </button>
            </div>
          </form>

          {/* Active Filters */}
          {(selectedCategory || searchTerm) && (
            <div className="flex flex-wrap gap-3">
              {searchTerm && (
                <span className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-blue-50 text-blue-700 border border-blue-200">
                  Pencarian: {searchTerm}
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-2 text-blue-500 hover:text-blue-700 hover:bg-blue-100 rounded-full p-1 transition-all"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {selectedCategory && (
                <span className="inline-flex items-center px-3 py-2 rounded-full text-sm bg-green-50 text-green-700 border border-green-200">
                  Kategori:{" "}
                  {
                    categories.find(
                      (c) => c.category_id.toString() === selectedCategory
                    )?.category_name
                  }
                  <button
                    onClick={() => setSelectedCategory("")}
                    className="ml-2 text-green-500 hover:text-green-700 hover:bg-green-100 rounded-full p-1 transition-all"
                  >
                    <X className="w-3 h-3" />
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
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-6 flex justify-between items-center">
              <p className="text-gray-600">
                Menampilkan {foods.length} makanan pada halaman {currentPage}
                {searchTerm && ` untuk "${searchTerm}"`}
              </p>
              {totalItems > 0 && (
                <p className="text-sm text-gray-500">
                  Total: {totalItems} makanan
                </p>
              )}
            </div>

            {/* Food Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {foods.map((food) => (
                <FoodCard
                  key={food.food_id}
                  food={food}
                  showRating={isAuthenticated}
                  onRatingUpdate={handleRatingUpdate}
                />
              ))}
            </div>

            {/* Pagination */}
            {(totalPages > 1 || foods.length === itemsPerPage) && (
              <div className="flex justify-center items-center space-x-2">
                {/* Previous Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Sebelumnya
                </button>

                {/* Page Numbers */}
                <div className="flex space-x-1">
                  {generatePageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        if (page === "more") {
                          handlePageChange(currentPage + 1);
                        } else if (typeof page === "number") {
                          handlePageChange(page);
                        }
                      }}
                      disabled={page === "..."}
                      className={`px-3 py-2 rounded-lg transition-all ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : page === "..."
                          ? "bg-transparent text-gray-400 cursor-default"
                          : page === "more"
                          ? "bg-green-100 text-green-700 hover:bg-green-200 border border-green-300"
                          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                      }`}
                    >
                      {page === "more" ? "Lainnya..." : page}
                    </button>
                  ))}
                </div>

                {/* Next Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={foods.length < itemsPerPage}
                  className={`flex items-center px-3 py-2 rounded-lg transition-all ${
                    foods.length < itemsPerPage
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-300"
                  }`}
                >
                  Selanjutnya
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
