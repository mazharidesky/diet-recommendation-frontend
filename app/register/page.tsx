"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { RegisterForm } from "@/types";
import {
  Eye,
  EyeOff,
  User,
  Mail,
  Lock,
  Utensils,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function Register() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();
  const [formData, setFormData] = useState<
    RegisterForm & { confirmPassword: string }
  >({
    nama: "",
    email: "",
    password: "",
    confirmPassword: "",
    umur: undefined,
    jenis_kelamin: undefined,
    tinggi_badan: undefined,
    berat_badan: undefined,
    target_berat: undefined,
    aktivitas: "moderate",
    diet_goal: "menjaga",
    alergi: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Redirect jika sudah authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, router]);

  // Jangan render jika sudah authenticated
  if (isAuthenticated) {
    return null;
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!formData.nama || !formData.email || !formData.password) {
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        return;
      }
    }
    setStep(step + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return;
    }

    setIsLoading(true);

    const { confirmPassword, ...submitData } = formData;

    const processedData: RegisterForm = {
      ...submitData,
      umur: submitData.umur ? Number(submitData.umur) : undefined,
      tinggi_badan: submitData.tinggi_badan
        ? Number(submitData.tinggi_badan)
        : undefined,
      berat_badan: submitData.berat_badan
        ? Number(submitData.berat_badan)
        : undefined,
      target_berat: submitData.target_berat
        ? Number(submitData.target_berat)
        : undefined,
    };

    const success = await register(processedData);
    if (success) {
      router.push("/");
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-72 h-72 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-gradient-to-r from-blue-400/15 to-purple-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: "40px 40px",
            }}
          />
        </div>
      </div>

      <div className="max-w-md w-full mt-16 space-y-8 relative z-10">
        {/* Header */}
        <div className="text-center">
          <div className="relative mb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl flex items-center justify-center transform hover:scale-110 transition-all duration-500 hover:rotate-6 group">
              <Utensils className="h-8 w-8 text-white group-hover:scale-110 transition-transform duration-300" />
              <div className="absolute -inset-2 bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 rounded-3xl blur-lg opacity-30 group-hover:opacity-50 transition-opacity duration-300"></div>
            </div>

            <Sparkles className="absolute -top-2 -right-2 w-5 h-5 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute -bottom-2 -left-2 w-4 h-4 text-pink-400 animate-pulse delay-1000" />
          </div>

          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-purple-800 to-pink-800 bg-clip-text text-transparent mb-2">
            Daftar Akun Baru
          </h2>
          <p className="text-gray-600 mb-6">
            Atau{" "}
            <Link
              href="/login"
              className="font-semibold text-purple-600 hover:text-pink-600 transition-colors duration-300 group"
            >
              masuk ke akun yang sudah ada
              <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300 ml-1">
                →
              </span>
            </Link>
          </p>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                step >= 1
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              1
            </div>
            <div
              className={`w-16 h-1 rounded-full transition-all duration-300 ${
                step > 1
                  ? "bg-gradient-to-r from-purple-500 to-pink-500"
                  : "bg-gray-200"
              }`}
            />
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                step >= 2
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              2
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl shadow-purple-500/10 border border-white/20 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Basic Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Informasi Dasar
                  </h3>
                  <p className="text-sm text-gray-600">
                    Buat akun untuk memulai perjalanan sehat Anda
                  </p>
                </div>

                {/* Name Input */}
                <div className="group">
                  <label
                    htmlFor="nama"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Nama Lengkap <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="nama"
                      name="nama"
                      type="text"
                      required
                      value={formData.nama}
                      onChange={handleChange}
                      className="w-full px-4 py-4 pl-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 group-hover:bg-white/60"
                      placeholder="Nama lengkap Anda"
                    />
                    <User className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-purple-500 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Email Input */}
                <div className="group">
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Email <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-4 pl-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 group-hover:bg-white/60"
                      placeholder="nama@email.com"
                    />
                    <Mail className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-purple-500 transition-colors duration-300" />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Password Input */}
                <div className="group">
                  <label
                    htmlFor="password"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-4 pl-12 pr-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 group-hover:bg-white/60"
                      placeholder="Minimal 8 karakter"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-purple-500 transition-colors duration-300" />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300 p-1 rounded-lg hover:bg-gray-100"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="group">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Konfirmasi Password <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-4 pl-12 pr-12 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400 group-hover:bg-white/60"
                      placeholder="Ulangi password"
                    />
                    <Lock className="h-5 w-5 text-gray-400 absolute left-4 top-1/2 transform -translate-y-1/2 group-focus-within:text-purple-500 transition-colors duration-300" />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-300 p-1 rounded-lg hover:bg-gray-100"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-focus-within:opacity-10 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  {formData.password !== formData.confirmPassword &&
                    formData.confirmPassword && (
                      <p className="mt-2 text-sm text-red-600 flex items-center space-x-2">
                        <Lock className="h-4 w-4" />
                        <span>Password tidak cocok</span>
                      </p>
                    )}
                </div>

                {/* Next Button */}
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={
                    !formData.nama ||
                    !formData.email ||
                    !formData.password ||
                    formData.password !== formData.confirmPassword
                  }
                  className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-center space-x-2">
                    <span>Lanjutkan</span>
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" />
                  </div>
                </button>
              </div>
            )}

            {/* Step 2: Profile Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Informasi Profil (Opsional)
                  </h3>
                  <p className="text-sm text-gray-600">
                    Lengkapi untuk rekomendasi yang lebih akurat
                  </p>
                </div>

                {/* Age and Gender */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label
                      htmlFor="umur"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Umur
                    </label>
                    <input
                      id="umur"
                      name="umur"
                      type="number"
                      value={formData.umur || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900 placeholder-gray-400"
                      placeholder="25"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="jenis_kelamin"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Jenis Kelamin
                    </label>
                    <select
                      id="jenis_kelamin"
                      name="jenis_kelamin"
                      value={formData.jenis_kelamin || ""}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-gray-900"
                    >
                      <option value="">Pilih</option>
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 text-sm font-semibold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Kembali
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 group relative flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-purple-500/25"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-700 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative flex items-center space-x-2">
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Membuat Akun...</span>
                        </>
                      ) : (
                        <span>Daftar</span>
                      )}
                    </div>
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
        <div className="text-center">
          <p className="text-gray-600">
            Sudah punya akun?{" "}
            <Link
              href="/login"
              className="font-semibold text-blue-600 hover:text-purple-600 transition-colors duration-300 group"
            >
              Masuk sekarang
              <span className="inline-block transform group-hover:translate-x-1 transition-transform duration-300 ml-1">
                →
              </span>
            </Link>
          </p>
        </div>

        {/* Benefits Preview - Only on Step 1 */}
        {step === 1 && (
          <div className="grid grid-cols-2 gap-4 cursor-pointer ">
            {[
              {
                icon: "🎯",
                title: "Personal",
                desc: "Rekomendasi sesuai profil",
              },
              { icon: "📱", title: "Mobile", desc: "Akses dimana saja" },
              { icon: "🔒", title: "Secure", desc: "Data aman terjamin" },
              { icon: "🆓", title: "Free", desc: "Gratis untuk memulai" },
            ].map((benefit, index) => (
              <div
                key={index}
                className="bg-white/60 backdrop-blur-sm rounded-2xl p-4 text-center border border-white/30 hover:bg-white/80 transition-all duration-300 transform hover:scale-105"
              >
                <div className="text-2xl mb-2">{benefit.icon}</div>
                <div className="text-xs font-semibold text-gray-700">
                  {benefit.title}
                </div>
                <div className="text-xs text-gray-500">{benefit.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
