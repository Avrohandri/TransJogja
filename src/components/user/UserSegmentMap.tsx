"use client";
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icons — done once at module level
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LEAFLET_SHADOW = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: LEAFLET_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: LEAFLET_SHADOW,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export interface SegmentData {
  fromName: string;
  toName: string;
  fromCoord: [number, number];
  toCoord: [number, number];
}

/** Fit map bounds whenever segment changes */
function FitBounds({ coords }: { coords: [number, number][] }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length >= 2) {
      const bounds = L.latLngBounds(coords.map(c => L.latLng(c[0], c[1])));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
    }
  }, [coords, map]);
  return null;
}

export default function UserSegmentMap({ segment }: { segment: SegmentData | null }) {
  const [roadPolyline, setRoadPolyline] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!segment) {
      setRoadPolyline([]);
      return;
    }

    setLoading(true);
    const { fromCoord, toCoord } = segment;
    // OSRM expects lon,lat
    const coordStr = `${fromCoord[1]},${fromCoord[0]};${toCoord[1]},${toCoord[0]}`;
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

    fetch(url)
      .then(res => res.json())
      .then(json => {
        if (json.code === "Ok" && json.routes?.[0]) {
          const coords: [number, number][] = json.routes[0].geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon]
          );
          setRoadPolyline(coords);
        } else {
          // Fallback: straight line
          setRoadPolyline([fromCoord, toCoord]);
        }
      })
      .catch(() => {
        setRoadPolyline([fromCoord, toCoord]);
      })
      .finally(() => setLoading(false));
  }, [segment]);

  const routePolyline = useMemo(() => roadPolyline, [roadPolyline]);

  // Default center (Yogyakarta area)
  const center: [number, number] = segment
    ? [
        (segment.fromCoord[0] + segment.toCoord[0]) / 2,
        (segment.fromCoord[1] + segment.toCoord[1]) / 2,
      ]
    : [-7.7881, 110.4312];

  const boundsCoords: [number, number][] = segment
    ? [segment.fromCoord, segment.toCoord]
    : [];

  return (
    <MapContainer
      center={center}
      zoom={14}
      style={{ height: "100%", width: "100%", zIndex: 0 }}
      zoomControl={false}
      preferCanvas={true}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        maxZoom={19}
        keepBuffer={4}
      />

      {/* Fit bounds to segment */}
      {boundsCoords.length >= 2 && <FitBounds coords={boundsCoords} />}

      {/* Road-following polyline */}
      {routePolyline.length > 0 && (
        <>
          {/* Outer glow */}
          <Polyline
            positions={routePolyline}
            color="#004d40"
            weight={10}
            opacity={0.2}
          />
          {/* Main route line */}
          <Polyline
            positions={routePolyline}
            color="#006c49"
            weight={5}
            opacity={0.9}
          />
        </>
      )}

      {/* Loading fallback: dashed straight line */}
      {loading && segment && (
        <Polyline
          positions={[segment.fromCoord, segment.toCoord]}
          color="#006c49"
          weight={4}
          opacity={0.5}
          dashArray="8 6"
        />
      )}

      {/* Start marker */}
      {segment && (
        <Marker position={segment.fromCoord} icon={startIcon}>
          <Popup>
            <div style={{ minWidth: 140 }}>
              <strong style={{ color: "#006c49" }}>🟢 Asal</strong>
              <br />
              <span style={{ fontSize: 13, color: "#191c1e", fontWeight: 600 }}>{segment.fromName}</span>
            </div>
          </Popup>
        </Marker>
      )}

      {/* End marker */}
      {segment && (
        <Marker position={segment.toCoord} icon={endIcon}>
          <Popup>
            <div style={{ minWidth: 140 }}>
              <strong style={{ color: "#ba1a1a" }}>🔴 Tujuan</strong>
              <br />
              <span style={{ fontSize: 13, color: "#191c1e", fontWeight: 600 }}>{segment.toName}</span>
            </div>
          </Popup>
        </Marker>
      )}
    </MapContainer>
  );
}
