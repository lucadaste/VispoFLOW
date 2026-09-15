import { NextRequest, NextResponse } from "next/server"

/** Proxies Geoapify address autocomplete so the API key never reaches the browser.
 *
 *  `type=state` and `type=county` (query param, not sent to Geoapify verbatim for county — see
 *  below) narrow a full-address search down to a state/county field's typeahead:
 *   - `state` maps straight to Geoapify's own `type=state` result filter.
 *   - `county` has no Geoapify request-level filter — `type` only accepts
 *     country/state/city/postcode/street/amenity/locality (confirmed: passing "county" is a 400).
 *     An unfiltered search for a county name is otherwise dominated by amenities/streets that
 *     happen to share it (e.g. "New Castle County Courthouse"), so this fetches more candidates
 *     than usual and keeps only the ones Geoapify's response itself tags `result_type: "county"`. */
export async function GET(req: NextRequest) {
  const text = req.nextUrl.searchParams.get("text")?.trim()
  const geoType = req.nextUrl.searchParams.get("type")
  if (!text || text.length < 3) {
    return NextResponse.json({ suggestions: [] })
  }

  const apiKey = process.env.GEOAPIFY_API_KEY
  if (!apiKey) {
    return NextResponse.json({ suggestions: [] })
  }

  const isCounty = geoType === "county"
  const url = new URL("https://api.geoapify.com/v1/geocode/autocomplete")
  url.searchParams.set("text", text)
  url.searchParams.set("format", "json")
  url.searchParams.set("limit", isCounty ? "15" : "5")
  url.searchParams.set("apiKey", apiKey)
  if (geoType === "state") {
    url.searchParams.set("type", "state")
    url.searchParams.set("filter", "countrycode:us")
  }
  // No countrycode filter for county: adding one paradoxically pushes the actual county entity
  // out of the results in favor of amenities sharing its name (verified against the live API —
  // e.g. "New Castle Coun" with the filter surfaces 15 amenities/streets and no county at all,
  // while the same query unfiltered ranks "New Castle County, DE" #1). Left unfiltered instead.

  const res = await fetch(url)
  if (!res.ok) {
    return NextResponse.json({ suggestions: [] })
  }

  const data = await res.json()
  let results: Array<{ formatted: string; place_id: string; result_type?: string }> = data.results ?? []
  if (isCounty) results = results.filter((r) => r.result_type === "county").slice(0, 5)

  const suggestions = results.map((r) => ({ formatted: r.formatted, placeId: r.place_id }))
  return NextResponse.json({ suggestions })
}
