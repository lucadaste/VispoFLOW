import { NextRequest, NextResponse } from "next/server"

/** Proxies Geoapify address autocomplete so the API key never reaches the browser. */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim()
  if (!text || text.length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ suggestions: [] })
  }

  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete")
  url.searchParams.set("text", text)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", "5")
  url.searchParams.set("apiKey", apiKey)

  const res = await fetch(url)
  if (!res.ok) {
    return NextResponse.json({ suggestions: [] })
  }

  const data = await res.json()
  const suggestions = (data.results ?? []).map((r: { formatted: string; place_id: string }) => ({
    formatted: r.formatted,
    placeId: r.place_id,
  }))

  return NextResponse.json({ suggestions })
}
