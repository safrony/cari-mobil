// src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Heart,
  Filter,
  Car,
  TrendingUp,
  Bell,
  Plus,
} from "lucide-react";

type Car = {
  id: string;
  brand: string;
  model: string;
  variant: string;
  year: number;
  mileage_km: number;
  transmission: string;
  fuel_type: string;
  color: string;
  price: number;
  city: string;
  source_platform: string;
  source_url: string;
  is_favorite: boolean;
  created_at: string;
  car_photos: { photo_url: string; is_primary: boolean }[];
};

export default function Home() {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({ total: 0, today: 0, favorites: 0 });

  // Filters
  const [filters, setFilters] = useState({
    brand: "",
    yearMin: "",
    yearMax: "",
    priceMin: "",
    priceMax: "",
    transmission: "",
    fuel_type: "",
  });

  useEffect(() => {
    fetchCars();
    fetchStats();
  }, [filters]);

  async function fetchCars() {
    setLoading(true);
    let query = supabase
      .from("cars")
      .select("*, car_photos(*)")
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(50);

    if (filters.brand) query = query.ilike("brand", `%${filters.brand}%`);
    if (filters.yearMin) query = query.gte("year", parseInt(filters.yearMin));
    if (filters.yearMax) query = query.lte("year", parseInt(filters.yearMax));
    if (filters.priceMin)
      query = query.gte("price", parseInt(filters.priceMin));
    if (filters.priceMax)
      query = query.lte("price", parseInt(filters.priceMax));
    if (filters.transmission)
      query = query.eq("transmission", filters.transmission);
    if (filters.fuel_type) query = query.eq("fuel_type", filters.fuel_type);
    if (search) {
      query = query.or(
        `brand.ilike.%${search}%,model.ilike.%${search}%,variant.ilike.%${search}%`,
      );
    }

    const { data, error } = await query;
    if (!error && data) setCars(data);
    setLoading(false);
  }

  async function fetchStats() {
    const today = new Date().toISOString().split("T")[0];

    const { count: total } = await supabase
      .from("cars")
      .select("*", { count: "exact", head: true });

    const { count: todayCount } = await supabase
      .from("cars")
      .select("*", { count: "exact", head: true })
      .gte("created_at", today);

    const { count: favs } = await supabase
      .from("cars")
      .select("*", { count: "exact", head: true })
      .eq("is_favorite", true);

    setStats({
      total: total || 0,
      today: todayCount || 0,
      favorites: favs || 0,
    });
  }

  async function toggleFavorite(carId: string, current: boolean) {
    await supabase
      .from("cars")
      .update({ is_favorite: !current })
      .eq("id", carId);

    setCars((prev) =>
      prev.map((c) => (c.id === carId ? { ...c, is_favorite: !current } : c)),
    );
  }

  function formatPrice(price: number) {
    if (!price) return "Hubungi";
    if (price >= 1000000000) return `Rp ${(price / 1000000000).toFixed(1)} M`;
    if (price >= 1000000) return `Rp ${(price / 1000000).toFixed(0)} jt`;
    return `Rp ${price.toLocaleString("id-ID")}`;
  }

  function formatMileage(km: number) {
    if (!km) return "-";
    return `${km.toLocaleString("id-ID")} km`;
  }

  function platformBadge(platform: string) {
    const colors: Record<string, string> = {
      olx: "bg-purple-500",
      fb_marketplace: "bg-blue-500",
      fb_group: "bg-blue-700",
      twitter: "bg-sky-500",
      instagram: "bg-pink-500",
      threads: "bg-gray-700",
      manual: "bg-green-500",
    };
    return colors[platform] || "bg-gray-500";
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Car className="text-emerald-400" size={24} />
              Mobil Bekas Bandung
            </h1>
            <a
              href="/input"
              className="bg-emerald-500 text-black px-3 py-1.5 rounded-lg 
                                        text-sm font-bold flex items-center gap-1"
            >
              <Plus size={16} /> Input Manual
            </a>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-2.5 text-gray-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Cari merk, model... (cth: Avanza 2020)"
              className="w-full pl-10 pr-12 py-2.5 bg-gray-800 rounded-xl 
                         border border-gray-700 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchCars()}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="absolute right-2 top-1.5 p-1.5 bg-gray-700 rounded-lg"
            >
              <Filter
                size={16}
                className={showFilters ? "text-emerald-400" : ""}
              />
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-3 p-4 bg-gray-800 rounded-xl grid grid-cols-2 gap-3 text-sm">
              <input
                placeholder="Merk"
                className="bg-gray-700 px-3 py-2 rounded-lg"
                value={filters.brand}
                onChange={(e) =>
                  setFilters({ ...filters, brand: e.target.value })
                }
              />
              <select
                className="bg-gray-700 px-3 py-2 rounded-lg"
                value={filters.transmission}
                onChange={(e) =>
                  setFilters({ ...filters, transmission: e.target.value })
                }
              >
                <option value="">Transmisi</option>
                <option value="Manual">Manual</option>
                <option value="Automatic">Automatic</option>
              </select>
              <input
                placeholder="Tahun min"
                type="number"
                className="bg-gray-700 px-3 py-2 rounded-lg"
                value={filters.yearMin}
                onChange={(e) =>
                  setFilters({ ...filters, yearMin: e.target.value })
                }
              />
              <input
                placeholder="Tahun max"
                type="number"
                className="bg-gray-700 px-3 py-2 rounded-lg"
                value={filters.yearMax}
                onChange={(e) =>
                  setFilters({ ...filters, yearMax: e.target.value })
                }
              />
              <input
                placeholder="Harga min (juta)"
                type="number"
                className="bg-gray-700 px-3 py-2 rounded-lg"
                value={filters.priceMin}
                onChange={(e) =>
                  setFilters({ ...filters, priceMin: e.target.value })
                }
              />
              <input
                placeholder="Harga max (juta)"
                type="number"
                className="bg-gray-700 px-3 py-2 rounded-lg"
                value={filters.priceMax}
                onChange={(e) =>
                  setFilters({ ...filters, priceMax: e.target.value })
                }
              />
              <select
                className="bg-gray-700 px-3 py-2 rounded-lg"
                value={filters.fuel_type}
                onChange={(e) =>
                  setFilters({ ...filters, fuel_type: e.target.value })
                }
              >
                <option value="">Bahan Bakar</option>
                <option value="Bensin">Bensin</option>
                <option value="Diesel">Diesel</option>
                <option value="Listrik">Listrik</option>
                <option value="Hybrid">Hybrid</option>
              </select>
              <button
                onClick={fetchCars}
                className="bg-emerald-500 text-black font-bold py-2 rounded-lg"
              >
                Cari
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <p className="text-2xl font-bold text-emerald-400">{stats.total}</p>
            <p className="text-xs text-gray-500">Total Mobil</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <p className="text-2xl font-bold text-blue-400">+{stats.today}</p>
            <p className="text-xs text-gray-500">Hari Ini</p>
          </div>
          <div className="bg-gray-900 rounded-xl p-3 text-center border border-gray-800">
            <p className="text-2xl font-bold text-red-400">{stats.favorites}</p>
            <p className="text-xs text-gray-500">Favorit</p>
          </div>
        </div>

        {/* Car List */}
        {loading ? (
          <div className="text-center py-20 text-gray-500">
            <div
              className="animate-spin w-8 h-8 border-2 border-emerald-400 
                            border-t-transparent rounded-full mx-auto mb-3"
            ></div>
            Memuat data...
          </div>
        ) : cars.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <Car size={48} className="mx-auto mb-3 opacity-30" />
            <p>Belum ada data mobil</p>
            <p className="text-sm mt-1">Mulai scraping atau input manual</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {cars.map((car) => (
              <div
                key={car.id}
                className="bg-gray-900 rounded-xl overflow-hidden 
                                           border border-gray-800 hover:border-gray-600 
                                           transition-colors"
              >
                {/* Photo */}
                <div className="h-48 bg-gray-800 relative">
                  {car.car_photos?.[0] ? (
                    <img
                      src={car.car_photos[0].photo_url}
                      alt={`${car.brand} ${car.model}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Car size={48} className="text-gray-700" />
                    </div>
                  )}

                  {/* Platform Badge */}
                  <span
                    className={`absolute top-2 left-2 px-2 py-0.5 rounded text-xs 
                                    font-bold text-white ${platformBadge(car.source_platform)}`}
                  >
                    {car.source_platform}
                  </span>

                  {/* Favorite Button */}
                  <button
                    onClick={() => toggleFavorite(car.id, car.is_favorite)}
                    className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full"
                  >
                    <Heart
                      size={18}
                      className={
                        car.is_favorite
                          ? "fill-red-500 text-red-500"
                          : "text-white"
                      }
                    />
                  </button>
                </div>

                {/* Info */}
                <div className="p-3">
                  <h3 className="font-bold text-lg">
                    {car.brand} {car.model} {car.variant}
                  </h3>
                  <p className="text-emerald-400 font-bold text-xl mt-1">
                    {formatPrice(car.price)}
                  </p>

                  <div className="flex flex-wrap gap-2 mt-2">
                    {car.year && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                        {car.year}
                      </span>
                    )}
                    {car.mileage_km && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                        {formatMileage(car.mileage_km)}
                      </span>
                    )}
                    {car.transmission && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                        {car.transmission}
                      </span>
                    )}
                    {car.fuel_type && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                        {car.fuel_type}
                      </span>
                    )}
                    {car.color && (
                      <span className="px-2 py-0.5 bg-gray-800 rounded text-xs">
                        {car.color}
                      </span>
                    )}
                  </div>

                  <div
                    className="flex justify-between items-center mt-3 pt-3 
                                  border-t border-gray-800"
                  >
                    <span className="text-xs text-gray-500">📍 {car.city}</span>
                    <a
                      href={car.source_url}
                      target="_blank"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      Lihat iklan asli →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
