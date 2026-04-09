// src/app/api/cars/submit/route.ts
import { createServiceClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    // Cek duplikat berdasarkan source_url
    if (body.source_url) {
      const { data: existing } = await supabase
        .from("cars")
        .select("id")
        .eq("source_url", body.source_url)
        .single();

      if (existing) {
        return NextResponse.json({
          success: true,
          message: "Already exists",
          isDuplicate: true,
          existingId: existing.id,
        });
      }
    }

    // Simpan mobil
    const { photos, ...carData } = body;
    const { data: car, error } = await supabase
      .from("cars")
      .insert(carData)
      .select()
      .single();

    if (error) throw error;

    // Simpan foto
    if (photos?.length > 0) {
      const photoRecords = photos.map((url: string, i: number) => ({
        car_id: car.id,
        photo_url: url,
        is_primary: i === 0,
        sort_order: i,
      }));

      await supabase.from("car_photos").insert(photoRecords);
    }

    // Simpan harga awal ke history
    if (car.price) {
      await supabase.from("price_history").insert({
        car_id: car.id,
        price: car.price,
      });
    }

    // Cek apakah cocok dengan alert
    await checkAlerts(supabase, car);

    return NextResponse.json({ success: true, id: car.id });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 },
    );
  }
}

async function checkAlerts(supabase: any, car: any) {
  const { data: alerts } = await supabase
    .from("alerts")
    .select("*")
    .eq("is_active", true);

  if (!alerts) return;

  for (const alert of alerts) {
    let match = true;
    if (
      alert.filter_brand &&
      !car.brand?.toLowerCase().includes(alert.filter_brand.toLowerCase())
    )
      match = false;
    if (
      alert.filter_model &&
      !car.model?.toLowerCase().includes(alert.filter_model.toLowerCase())
    )
      match = false;
    if (alert.filter_year_min && car.year < alert.filter_year_min)
      match = false;
    if (alert.filter_year_max && car.year > alert.filter_year_max)
      match = false;
    if (alert.filter_price_min && car.price < alert.filter_price_min)
      match = false;
    if (alert.filter_price_max && car.price > alert.filter_price_max)
      match = false;
    if (
      alert.filter_transmission &&
      car.transmission !== alert.filter_transmission
    )
      match = false;

    if (match) {
      await supabase.from("notifications").insert({
        alert_id: alert.id,
        car_id: car.id,
      });
    }
  }
}
