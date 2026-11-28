import { NextResponse } from "next/server";
import { calculateSingleKundali, type SingleKundaliInput } from "@/lib/kundali";

export async function POST(req: Request) {
  try {
    const body: SingleKundaliInput = await req.json();

    if (!body || !body.dob) {
      return NextResponse.json(
        { ok: false, error: "Date of Birth is required for Janam Kundali generation." },
        { status: 400 }
      );
    }

    const result = calculateSingleKundali(body);

    return NextResponse.json({
      ok: true,
      source: "Vedic Astrology Engine (Ephemeris Sync)",
      ...result,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to calculate single person Kundali." },
      { status: 500 }
    );
  }
}
