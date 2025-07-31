import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAuth } from "@/contexts/AuthContext";
import { User, Save } from "lucide-react";
import toast from "react-hot-toast";

export default function Profile() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    nama: "",
    umur: "",
    jenis_kelamin: "",
    tinggi_badan: "",
    berat_badan: "",
    target_berat: "",
    aktivitas: "moderate",
    diet_goal: "menjaga",
    alergi: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/profile");
      return;
    }

    if (user) {
      setFormData({
        nama: user.nama || "",
        umur: user.umur?.toString() || "",
        jenis_kelamin: user.jenis_kelamin || "",
        tinggi_badan: user.tinggi_badan?.toString() || "",
        berat_badan: user.berat_badan?.toString() || "",
        target_berat: user.target_berat?.toString() || "",
        aktivitas: user.aktivitas || "moderate",
        diet_goal: user.diet_goal || "menjaga",
        alergi: user.alergi || "",
      });
      setLoading(false);
    }
  }, [isAuthenticated, user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Simulate API call - replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Profil berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal memperbarui profil");
    } finally {
      setSaving(false);
    }
  };

  const calculateBMI = () => {
    if (formData.berat_badan && formData.tinggi_badan) {
      const heightInM = Number(formData.tinggi_badan) / 100;
      return (Number(formData.berat_badan) / (heightInM * heightInM)).toFixed(
        1
      );
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profil Saya</h1>
          <p className="text-lg text-gray-600">
            Kelola informasi pribadi dan preferensi diet Anda
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-500"
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
                    value={formData.umur}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                    value={formData.jenis_kelamin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
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
                    value={formData.tinggi_badan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="170"
                    step="0.1"
                    min="50"
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
                    value={formData.berat_badan}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="65"
                    step="0.1"
                    min="20"
                    max="300"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Target Berat (kg)
                  </label>
                  <input
                    type="number"
                    name="target_berat"
                    value={formData.target_berat}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                    placeholder="60"
                    step="0.1"
                    min="20"
                    max="300"
                  />
                </div>
              </div>

              {/* BMI Display */}
              {bmi && (
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      BMI Anda:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-gray-900">
                        {bmi}
                      </span>
                      <span
                        className={`text-sm font-medium ${bmiCategory?.color}`}
                      >
                        ({bmiCategory?.label})
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Diet Preferences */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Preferensi Diet
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tingkat Aktivitas
                  </label>
                  <select
                    name="aktivitas"
                    value={formData.aktivitas}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="sedentary">
                      Tidak Aktif (Jarang Olahraga)
                    </option>
                    <option value="light">Ringan (Olahraga 1-3x/minggu)</option>
                    <option value="moderate">
                      Sedang (Olahraga 3-5x/minggu)
                    </option>
                    <option value="active">Aktif (Olahraga 6-7x/minggu)</option>
                    <option value="very_active">
                      Sangat Aktif (Olahraga 2x/hari)
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tujuan Diet
                  </label>
                  <select
                    name="diet_goal"
                    value={formData.diet_goal}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="menurunkan">Menurunkan Berat Badan</option>
                    <option value="menjaga">Menjaga Berat Badan</option>
                    <option value="menambah">Menambah Berat Badan</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alergi Makanan
                </label>
                <input
                  type="text"
                  name="alergi"
                  value={formData.alergi}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Contoh: kacang, seafood, susu"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Pisahkan dengan koma jika ada beberapa alergi
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="border-t pt-6">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-500 hover:bg-primary-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {saving ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>{saving ? "Menyimpan..." : "Simpan Perubahan"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
