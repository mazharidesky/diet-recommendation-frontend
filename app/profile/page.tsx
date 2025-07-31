"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/lib/api";
import {
  ProfileUpdateForm,
  MedicalCondition,
  UserMedicalCondition,
} from "@/types";
import {
  User,
  Save,
  Heart,
  Activity,
  Target,
  AlertCircle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { toast } from "react-hot-toast";

export default function ProfilePage() {
  const router = useRouter();
  const { isAuthenticated, user, refreshUser } = useAuth();
  const [formData, setFormData] = useState<ProfileUpdateForm>({
    nama: "",
    umur: undefined,
    jenis_kelamin: undefined,
    tinggi_badan: undefined,
    berat_badan: undefined,
    target_berat: undefined,
    aktivitas: "moderate",
    diet_goal: "menjaga",
    alergi: "",
  });
  const [medicalConditions, setMedicalConditions] = useState<
    MedicalCondition[]
  >([]);
  const [userMedicalConditions, setUserMedicalConditions] = useState<
    UserMedicalCondition[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
      return;
    }

    fetchInitialData();
  }, [isAuthenticated, user]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // Set user data from context
      if (user) {
        setFormData({
          nama: user.nama || "",
          umur: user.umur,
          jenis_kelamin: user.jenis_kelamin,
          tinggi_badan: user.tinggi_badan,
          berat_badan: user.berat_badan,
          target_berat: user.target_berat,
          aktivitas: user.aktivitas || "moderate",
          diet_goal: user.diet_goal || "menjaga",
          alergi: user.alergi || "",
        });
      }

      // Fetch medical conditions
      const [conditionsResponse, userConditionsResponse] = await Promise.all([
        userService.getMedicalConditions(),
        userService.getMyMedicalConditions(),
      ]);

      setMedicalConditions(conditionsResponse.conditions || []);
      setUserMedicalConditions(userConditionsResponse.conditions || []);
    } catch (error) {
      console.error("Error fetching profile data:", error);
      toast.error("Gagal memuat data profil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await userService.updateProfile(formData);
      await refreshUser(); // Refresh user data in context
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  // const handleMedicalConditionToggle = async (condition: MedicalCondition) => {
  //   const isSelected = userMedicalConditions.some(
  //     (userCondition) => userCondition.medical_condition_id === condition.id
  //   );

  //   try {
  //     if (isSelected) {
  //       await userService.getMedicalConditions(
  //         condition.id,
  //         /* provide second argument here, e.g. */ null
  //       );
  //       setUserMedicalConditions((prev) =>
  //         prev.filter((uc) => uc.medical_condition_id !== condition.id)
  //       );
  //       toast.success(`${condition.nama} dihapus dari kondisi medis`);
  //     } else {
  //       await userService.getMedicalConditions(condition.id);
  //       setUserMedicalConditions((prev) => [
  //         ...prev,
  //         {
  //           // Use the properties required by UserMedicalCondition
  //           id: Date.now(), // temporary ID
  //           medical_condition_id: condition.condition_id,
  //           condition_id: condition.condition_id,
  //           condition_name: condition.condition_name,
  //           condition_code: condition.condition_code,
  //           severity: "unknown", // or set an appropriate default/severity if available
  //           // Add other properties if UserMedicalCondition requires them
  //         },
  //       ]);
  //       toast.success(`${condition.nama} ditambahkan ke kondisi medis`);
  //     }
  //   } catch (error) {
  //     console.error("Error updating medical condition:", error);
  //     toast.error("Gagal memperbarui kondisi medis");
  //   }
  // };

  const calculateBMI = () => {
    if (formData.berat_badan && formData.tinggi_badan) {
      const heightInM = formData.tinggi_badan / 100;
      return (formData.berat_badan / (heightInM * heightInM)).toFixed(1);
    }
    return null;
  };

  const getBMICategory = (bmi: string) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { label: "Kurus", color: "text-blue-600" };
    if (bmiValue < 25) return { label: "Normal", color: "text-green-600" };
    if (bmiValue < 30) return { label: "Berlebih", color: "text-yellow-600" };
    return { label: "Obesitas", color: "text-red-600" };
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Memuat profil...</p>
        </div>
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
          <p className="text-lg text-gray-600">
            Kelola informasi pribadi dan preferensi diet Anda
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex">
              <button
                onClick={() => setActiveTab("profile")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Informasi Pribadi</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("medical")}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === "medical"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4" />
                  <span>Kondisi Medis</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="p-6">
              <form onSubmit={handleProfileSubmit} className="space-y-6">
                {/* Basic Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Dasar
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        name="nama"
                        value={formData.nama}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="Nama lengkap Anda"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={user?.email || ""}
                        disabled
                        className="input-field bg-gray-100 text-gray-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Email tidak dapat diubah
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Umur
                      </label>
                      <input
                        type="number"
                        name="umur"
                        value={formData.umur || ""}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="25"
                        min="1"
                        max="120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Jenis Kelamin
                      </label>
                      <select
                        name="jenis_kelamin"
                        value={formData.jenis_kelamin || ""}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="">Pilih jenis kelamin</option>
                        <option value="L">Laki-laki</option>
                        <option value="P">Perempuan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Physical Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Informasi Fisik
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tinggi Badan (cm)
                      </label>
                      <input
                        type="number"
                        name="tinggi_badan"
                        value={formData.tinggi_badan || ""}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="170"
                        min="100"
                        max="250"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Berat Badan (kg)
                      </label>
                      <input
                        type="number"
                        name="berat_badan"
                        value={formData.berat_badan || ""}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="65"
                        min="30"
                        max="300"
                        step="0.1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Target Berat (kg)
                      </label>
                      <input
                        type="number"
                        name="target_berat"
                        value={formData.target_berat || ""}
                        onChange={handleInputChange}
                        className="input-field"
                        placeholder="60"
                        min="30"
                        max="300"
                        step="0.1"
                      />
                    </div>
                  </div>

                  {/* BMI Display */}
                  {bmi && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Activity className="w-5 h-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            BMI Anda:{" "}
                            <span className="text-blue-600">{bmi}</span>
                          </p>
                          {bmiCategory && (
                            <p className={`text-sm ${bmiCategory.color}`}>
                              Kategori: {bmiCategory.label}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Activity & Goals */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Aktivitas & Tujuan
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Activity className="w-4 h-4 inline mr-2" />
                        Tingkat Aktivitas
                      </label>
                      <select
                        name="aktivitas"
                        value={formData.aktivitas}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="sedentary">
                          Sedentary (Tidak aktif)
                        </option>
                        <option value="light">Light (Ringan)</option>
                        <option value="moderate">Moderate (Sedang)</option>
                        <option value="active">Active (Aktif)</option>
                        <option value="very_active">
                          Very Active (Sangat aktif)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Target className="w-4 h-4 inline mr-2" />
                        Tujuan Diet
                      </label>
                      <select
                        name="diet_goal"
                        value={formData.diet_goal}
                        onChange={handleInputChange}
                        className="input-field"
                      >
                        <option value="menurunkan">
                          Menurunkan Berat Badan
                        </option>
                        <option value="menjaga">Menjaga Berat Badan</option>
                        <option value="menambah">Menambah Berat Badan</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <AlertCircle className="w-4 h-4 inline mr-2" />
                    Alergi Makanan
                  </label>
                  <textarea
                    name="alergi"
                    value={formData.alergi}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder="Sebutkan alergi makanan yang Anda miliki (opsional)"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Pisahkan dengan koma jika lebih dari satu
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end pt-6">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center space-x-2"
                  >
                    {saving ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Medical Conditions Tab */}
          {activeTab === "medical" && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Kondisi Medis
                </h3>
                <p className="text-sm text-gray-600">
                  Pilih kondisi medis yang Anda miliki untuk mendapatkan
                  rekomendasi makanan yang sesuai
                </p>
              </div>

              <div className="space-y-3">
                {medicalConditions.map((condition) => {
                  const isSelected = userMedicalConditions.some(
                    (userCondition) =>
                      userCondition.condition_id === condition.condition_id
                  );

                  return (
                    <div
                      key={condition.condition_id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        isSelected
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      // onClick={() => handleMedicalConditionToggle(condition)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                              isSelected
                                ? "border-blue-500 bg-blue-500"
                                : "border-gray-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {condition.condition_name}
                            </h4>
                            {condition.description && (
                              <p className="text-sm text-gray-600">
                                {condition.description}
                              </p>
                            )}
                            {condition.dietary_focus && (
                              <p className="text-xs text-blue-600 mt-1">
                                Focus: {condition.dietary_focus}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {medicalConditions.length === 0 && (
                <div className="text-center py-8">
                  <Heart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">
                    Tidak ada kondisi medis tersedia
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
