---
name: traffic-route-checker
description: Check traffic conditions, estimate travel time, compare routes, and recommend the best driving route. Uses live traffic-aware routing providers in priority order (Google Routes, HERE, Mapbox) with an OSRM/OpenStreetMap fallback when no traffic API is available. Returns traffic status, ETA, distance, best route, alternatives, the provider used, whether live traffic was included, and a recommendation.
version: 1.0.0
author: IonClaw
tags: [traffic, route, routing, eta, navigation, directions, congestion, travel-time, google-maps, here, mapbox, osrm, driving]
dependencies: [http_client]
requires: {}
---

# Traffic Route Checker

Check **traffic conditions**, estimate **travel time**, compare **routes**, and recommend the **best driving route** using supported map and routing providers.

This skill uses the built-in `http_client` tool to call routing APIs directly -- no external scripts or dependencies required.

---

## Main goal

Use this skill when the user asks for:

- current traffic conditions
- estimated travel time
- best route between two places
- route alternatives
- congestion level
- ETA with traffic
- whether it is better to leave now or later
- route comparison between providers
- fallback route calculation without live traffic

---

## Required Parameters

- **Origin** -- starting address or coordinates
- **Destination** -- target address or coordinates

## Optional Parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| **travel mode** | `driving` | Travel mode (driving is the only mode that supports live traffic) |
| **departure time** | `now` | When the trip starts; affects traffic-aware ETA |
| **route preference** | `fastest` | `fastest` or simplest/most direct |
| **region / country** | -- | Disambiguates ambiguous addresses |
| **provider** | auto | Force a specific provider instead of auto-selection |

If the user says "from here", use the user's current location **only** if the application already has location permission. If the origin or destination is unclear, **ask for clarification**.

---

## Supported providers

Use the providers in this priority order:

1. **Google Routes API**
2. **HERE Routing / Traffic APIs**
3. **Mapbox Directions API**
4. **OSRM / OpenStreetMap** (fallback, no live traffic)

---

## Environment variables

The project may define one or more of these variables:

```
GOOGLE_MAPS_API_KEY=
HERE_API_KEY=
MAPBOX_ACCESS_TOKEN=
OSRM_BASE_URL=
```

Keys can also be **provided directly by the user** in the prompt. If provided in the prompt, use those values; otherwise fall back to the environment variables.

If `OSRM_BASE_URL` is not defined, use the public OSRM demo server (`https://router.project-osrm.org`) **only** for testing or development -- never for production traffic.

---

## Provider selection logic

Use this decision order:

```
if GOOGLE_MAPS_API_KEY exists:
    use Google Routes API with traffic-aware routing

else if HERE_API_KEY exists:
    use HERE Routing / Traffic APIs

else if MAPBOX_ACCESS_TOKEN exists:
    use Mapbox Directions API with driving-traffic profile

else if OSRM_BASE_URL exists:
    use OSRM fallback without live traffic

else:
    explain that no route provider is configured
```

If the selected provider fails, fall through to the next provider in priority order.

---

## Provider priority rules

### 1. Google Routes API

Preferred first when `GOOGLE_MAPS_API_KEY` is available. Best for live traffic-aware routing, accurate ETA, route alternatives, and production/user-facing recommendations.

Recommended settings:

- `travelMode`: `DRIVE`
- `routingPreference`: `TRAFFIC_AWARE`
- `departureTime`: current time, unless the user specifies another time
- request route duration, distance, polyline, and route labels when available

Use `TRAFFIC_AWARE_OPTIMAL` **only** when the user explicitly wants the most accurate route and higher latency/cost is acceptable.

### 2. HERE APIs

Use when `HERE_API_KEY` is available and Google is unavailable or not preferred. Recommended for route calculation, ETA, traffic-aware routing, and enterprise/logistics scenarios. Request routing with traffic enabled whenever supported; use current departure time by default.

### 3. Mapbox Directions API

Use when `MAPBOX_ACCESS_TOKEN` is available and Google/HERE are unavailable or not preferred. Recommended for modern map apps, route drawing, turn-by-turn directions, and apps already using Mapbox maps.

For driving routes with traffic, use the `mapbox/driving-traffic` profile. Do **not** use the regular `driving` profile when the user specifically asks about current traffic, unless `driving-traffic` is unavailable.

### 4. OSRM fallback

Use **only** when no live traffic provider is available. Recommended for free/open-source routing, self-hosted route calculation, distance calculation, and approximate travel time.

**Important limitation:** OSRM does not provide real-time traffic by default. When using OSRM, clearly tell the user the result does not include live traffic.

---

## API Calls

All calls use the built-in `http_client` tool. No Python scripts, venv, or external binaries needed.

### 1. Google Routes API

```
http_client(
  method="POST",
  url="https://routes.googleapis.com/directions/v2:computeRoutes",
  headers="{\"Content-Type\": \"application/json\", \"X-Goog-Api-Key\": \"<GOOGLE_MAPS_API_KEY>\", \"X-Goog-FieldMask\": \"routes.duration,routes.distanceMeters,routes.description,routes.polyline.encodedPolyline,routes.routeLabels\"}",
  body="{\"origin\": {\"address\": \"ORIGIN_ADDRESS\"}, \"destination\": {\"address\": \"DESTINATION_ADDRESS\"}, \"travelMode\": \"DRIVE\", \"routingPreference\": \"TRAFFIC_AWARE\", \"computeAlternativeRoutes\": true, \"languageCode\": \"en-US\", \"units\": \"METRIC\"}"
)
```

Normalize the response into:

```json
{
  "provider": "google",
  "traffic_included": true,
  "duration_seconds": 0,
  "distance_meters": 0,
  "route_summary": "",
  "alternatives": []
}
```

### 2. HERE Routing API

Recommended input fields: origin lat/lng, destination lat/lng, `transportMode=car`, `routingMode=fast`, `departureTime=now`, `return=summary,polyline,actions,instructions`.

```
http_client(
  method="GET",
  url="https://router.hereapi.com/v8/routes?transportMode=car&origin=ORIGIN_LAT,ORIGIN_LON&destination=DEST_LAT,DEST_LON&routingMode=fast&departureTime=now&return=summary,polyline,actions,instructions&apikey=<HERE_API_KEY>"
)
```

Normalize the response into:

```json
{
  "provider": "here",
  "traffic_included": true,
  "duration_seconds": 0,
  "distance_meters": 0,
  "route_summary": "",
  "alternatives": []
}
```

### 3. Mapbox Directions API

Use the `mapbox/driving-traffic` profile. Recommended options: `alternatives=true`, `geometries=polyline`, `overview=full`, `steps=true`, `language=en`.

```
http_client(
  method="GET",
  url="https://api.mapbox.com/directions/v5/mapbox/driving-traffic/ORIGIN_LON,ORIGIN_LAT;DEST_LON,DEST_LAT?alternatives=true&geometries=polyline&overview=full&steps=true&language=en&access_token=<MAPBOX_ACCESS_TOKEN>"
)
```

Normalize the response into:

```json
{
  "provider": "mapbox",
  "traffic_included": true,
  "duration_seconds": 0,
  "distance_meters": 0,
  "route_summary": "",
  "alternatives": []
}
```

### 4. OSRM (fallback, no live traffic)

Endpoint pattern: `/route/v1/driving/{origin_lon},{origin_lat};{destination_lon},{destination_lat}`. Recommended options: `alternatives=true`, `overview=full`, `steps=true`, `geometries=polyline`.

```
http_client(
  method="GET",
  url="<OSRM_BASE_URL>/route/v1/driving/ORIGIN_LON,ORIGIN_LAT;DEST_LON,DEST_LAT?alternatives=true&overview=full&steps=true&geometries=polyline"
)
```

Normalize the response into:

```json
{
  "provider": "osrm",
  "traffic_included": false,
  "duration_seconds": 0,
  "distance_meters": 0,
  "route_summary": "",
  "alternatives": []
}
```

When using OSRM, always include this warning in the final answer:

> Traffic included: no. This estimate does not include live traffic.

---

## Workflow

1. Identify **origin** and **destination**; if unclear, ask the user. Apply defaults: travel mode `driving`, departure time `now`, preference `fastest`.
2. Resolve provider credentials: use values from the prompt if provided, otherwise from env vars.
3. Select the provider using the **provider selection logic** above.
4. Build the request and call `http_client` for the selected provider.
5. If the provider fails, fall through to the next provider in priority order.
6. Normalize the response into the common shape (`provider`, `traffic_included`, `duration_seconds`, `distance_meters`, `route_summary`, `alternatives`).
7. Apply the **final recommendation logic**.
8. Return the answer in the **expected output format**.
9. If all providers fail, tell the user no route could be calculated.

---

## Expected output format

Always answer in a simple and useful format:

```
Traffic status: light / moderate / heavy / unknown
Estimated time: X minutes
Distance: X km
Best route: route summary
Alternatives: route alternatives if available
Provider used: provider name
Traffic included: yes / no
Recommendation: leave now / wait / avoid this route / use alternative route
```

---

## Final recommendation logic

```
if traffic_included is false:
    recommend cautiously and explain that live traffic was not checked

if duration is much longer than normal:
    recommend waiting or using an alternative route

if alternatives are available and one is clearly faster:
    recommend the fastest route

if all routes are similar:
    recommend the simplest or most direct route

if provider returns incidents or heavy congestion:
    recommend avoiding the affected route
```

---

## Skill Usage

### Check traffic to a place
```
traffic-route-checker: origin: home | destination: downtown
```

### Best route between two addresses
```
traffic-route-checker: origin: São Gonçalo | destination: Copacabana
```

### Should I leave now?
```
traffic-route-checker: origin: home | destination: work | departure: now
```

### Force a specific provider
```
traffic-route-checker: origin: A | destination: B | provider: mapbox
```

### Fallback without live traffic
```
traffic-route-checker: origin: A | destination: B | provider: osrm
```

---

## Input examples

The skill should activate for prompts like:

- How is the traffic to downtown?
- What is the best route to the airport?
- Should I leave now?
- How long does it take from São Gonçalo to Copacabana?
- Check traffic from home to work.
- Find the fastest route with traffic.
- Compare Google, HERE, Mapbox and OSRM.
- Use OSRM if no traffic API is available.

---

## Practical Examples

### Traffic-aware route (Google)
```
Traffic status: moderate
Estimated time: 38 minutes
Distance: 24.7 km
Best route: Via RJ-104
Alternatives: One alternative found, around 6 minutes slower
Provider used: Google Routes API
Traffic included: yes
Recommendation: Leave now. The main route is still the best option.
```

### OSRM fallback (no live traffic)
```
Traffic status: unknown
Estimated time: 31 minutes
Distance: 22.1 km
Best route: Fastest route calculated by OSRM
Alternatives: One alternative found
Provider used: OSRM
Traffic included: no
Recommendation: This is only an approximate route. Live traffic was not checked.
```

---

## Response rules

- When traffic is included: `Traffic included: yes`
- When traffic is not included: `Traffic included: no`
- When a provider fails: try the next provider in priority order.
- When all providers fail, say: *"I could not calculate the route because no configured provider returned a valid response."*
- When no live traffic API is available, say: *"Live traffic data is not available with the current provider. I can only estimate route distance and approximate travel time."*

---

## Privacy rules

1. Do **not** store user route history.
2. Do **not** expose exact coordinates unless needed.
3. Do **not** reveal API keys.
4. Do **not** log full addresses unless the application explicitly needs logs for debugging.
5. Do **not** send the user's current location to an external API unless the app has permission.

---

## Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 / 403 Unauthorized | Invalid or missing API key | Verify the provider's API key / env var |
| 400 Bad Request | Malformed origin/destination | Check address format or coordinates |
| 404 Not Found | No route between points | Verify the locations are routable by car |
| 429 Too Many Requests | Rate/quota exceeded | Wait or fall through to the next provider |
| ZERO_RESULTS / no routes | No drivable path | Inform the user no route was found |

---

## Important Skill Rules

1. **origin** and **destination** are always required; ask the user if either is missing or unclear.
2. **Never invent traffic data** -- do not guess live traffic conditions.
3. Follow the **provider priority order**: Google → HERE → Mapbox → OSRM.
4. Prefer **traffic-aware routing** whenever the selected provider supports it.
5. When using **OSRM**, always state that the result does **not** include live traffic.
6. If a provider fails, **fall through** to the next provider in priority order; never report success on failure.
7. Resolve API keys from the prompt or env vars; never log or expose them.
8. Default travel mode is **driving**, departure time is **now**, preference is **fastest**.
9. Use the built-in `http_client` tool for all API calls -- do **not** use external scripts, curl, or Python.
10. Always return the **provider used** and whether **traffic was included** so the user knows how reliable the estimate is.
