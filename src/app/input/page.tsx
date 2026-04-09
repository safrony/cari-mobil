// src/app/input/page.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function InputPage() {
  const [form, setForm] = useState({
    brand: "",
    model: "",
    variant: "",
    year: "",
    mileage_km: "",
    transmission: "",
    fuel_type: "",
    color: "",
    price: "",
    contact_name: "",
    contact_phone: "",
    city: "Bandung",
    source_url: "",
    original_description: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase.from("cars").insert({
      ...form,
      year: form.year ? parseInt(form.year) : null,
      mileage_km: form.mileage_km ? parseInt(form.mileage_km) : null,
      price: form.price ? parseInt(form.price) : null,
      source_platform: "manual",
    });

    if (error) {
      setMessage("❌ Gagal menyimpan: " + error.message);
    } else {
      setMessage("✅ Berhasil disimpan!");
      setForm({
        brand: "",
        model: "",
        variant: "",
        year: "",
        mileage_km: "",
        transmission: "",
        fuel_type: "",
        color: "",
        price: "",
        contact_name: "",
        contact_phone: "",
        city: "Bandung",
        source_url: "",
        original_description: "",
      });
    }
    setSaving(false);
    setTimeout(() => setMessage(""), 3000);
  }

  const inputClass =
    "w-full px-3 py-2.5 bg-gray-800 rounded-lg border border-gray-700 text-sm text-white";
  const labelClass = "block text-xs text-gray-400 mb-1 uppercase tracking-wide";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="sticky top-0 bg-gray-900 border-b border-gray-800 px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-800 rounded-lg">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-bold text-lg">Input Mobil Manual</h1>
        </div>
      </header>

      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-4 py-6 space-y-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Merk *</label>
            <input
              className={inputClass}
              placeholder="Toyota"
              required
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Model *</label>
            <input
              className={inputClass}
              placeholder="Avanza"
              required
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Varian</label>
            <input
              className={inputClass}
              placeholder="G AT"
              value={form.variant}
              onChange={(e) => setForm({ ...form, variant: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Tahun</label>
            <input
              className={inputClass}
              type="number"
              placeholder="2020"
              value={form.year}
              onChange={(e) => setForm({ ...form, year: e.target.value })}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Harga (Rp)</label>
          <input
            className={inputClass}
            type="number"
            placeholder="150000000"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Kilometer</label>
            <input
              className={inputClass}
              type="number"
              placeholder="50000"
              value={form.mileage_km}
              onChange={(e) => setForm({ ...form, mileage_km: e.target.value })}
            />
          </div>
          <div>
            <label className={labelClass}>Warna</label>
            <input
              className={inputClass}
              placeholder="Putih"
              value={form.color}
              onChange={(e) => setForm({ ...form, color: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Transmisi</label>
            <select
              className={inputClass}
              value={form.transmission}
              onChange={(e) =>
                setForm({ ...form, transmission: e.target.value })
              }
            >
              <option value="">-- Pilih --</option>
              <option value="Manual">Manual</option>
              <option value="Automatic">Automatic</option>
            </select>
          </div>
          <div>
            <label className={labelClass}>Bahan Bakar</label>
            <select
              className={inputClass}
              value={form.fuel_type}
              onChange={(e) => setForm({ ...form, fuel_type: e.target.value })}
            >
              <option value="">-- Pilih --</option>
              <option value="Bensin">Bensin</option>
              <option value="Diesel">Diesel</option>
              <option value="Listrik">Listrik</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Nama Kontak</label>
            <input
              className={inputClass}
              placeholder="Nama penjual"
              value={form.contact_name}
              onChange={(e) =>
                setForm({ ...form, contact_name: e.target.value })
              }
            />
          </div>
          <div>
            <label className={labelClass}>No. Telepon</label>
            <input
              className={inputClass}
              placeholder="08123456789"
              value={form.contact_phone}
              onChange={(e) =>
                setForm({ ...form, contact_phone: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>Kota</label>
          <input
            className={inputClass}
            placeholder="Bandung"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Link Iklan Asli</label>
          <input
            className={inputClass}
            placeholder="https://..."
            value={form.source_url}
            onChange={(e) => setForm({ ...form, source_url: e.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Deskripsi / Catatan</label>
          <textarea
            className={inputClass}
            rows={3}
            placeholder="Catatan tambahan..."
            value={form.original_description}
            onChange={(e) =>
              setForm({ ...form, original_description: e.target.value })
            }
          />
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-center font-bold 
                           ${message.startsWith("✅") ? "bg-green-900" : "bg-red-900"}`}
          >
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full py-3 bg-emerald-500 text-black font-bold rounded-xl 
                           flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Save size={18} />
          {saving ? "Menyimpan..." : "Simpan Mobil"}
        </button>
      </form>
    </div>
  );
}
