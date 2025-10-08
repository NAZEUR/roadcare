import { NextResponse } from "next/server";

export async function POST(request) {
  const { start, end } = await request.json(); // { start: [lng, lat], end: [lng, lat] }

  if (!start || !end) {
    return NextResponse.json(
      { error: "Start and end coordinates are required" },
      { status: 400 }
    );
  }

  const apiKey = process.env.NEXT_PUBLIC_ORS_API_KEY;
  const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${apiKey}&start=${start.join(
    ","
  )}&end=${end.join(",")}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error.message);
    }

    const summary = data.features[0].properties.summary;
    const distanceKm = (summary.distance / 1000).toFixed(2); // in km
    const durationMin = (summary.duration / 60).toFixed(1); // in minutes

    return NextResponse.json({ distance: distanceKm, duration: durationMin });
  } catch (error) {
    console.error("Routing API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch route data" },
      { status: 500 }
    );
  }
}
