"use client";
import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { halteService, Halte } from "@/services/halteService";
import { OptimizationResult } from "@/services/optimizationService";
import { fetchRoadPolyline, RUTE_14_HALTE_COORDS, RUTE_14_GEOJSON_POLYLINE } from "@/utils/roadRoute";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LEAFLET_SHADOW = 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png';

const HALTE_ICONS = {
  optimal: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
    shadowUrl: LEAFLET_SHADOW,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
  nonOptimal: new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
    shadowUrl: LEAFLET_SHADOW,
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
  }),
};

// Auto-fit to bounds
function FitBounds({ haltes }: { haltes: Halte[] }) {
    const map = useMap();
    useEffect(() => {
        if (haltes.length > 0) {
            const bounds = L.latLngBounds(haltes.map(h => [h.latitude, h.longitude]));
            map.fitBounds(bounds, { padding: [30, 30] });
        }
    }, [haltes, map]);
    return null;
}

const MAP_CENTER: [number, number] = [-7.7281, 110.4312];

interface OptimizationMapProps {
    optimizationResults: OptimizationResult[] | null;
    showOnlyOptimal: boolean;
}

export default function OptimizationMap({ optimizationResults, showOnlyOptimal }: OptimizationMapProps) {
    const [haltes, setHaltes] = useState<Halte[]>([]);
    const [roadPolyline, setRoadPolyline] = useState<[number, number][]>([]);
    const [routeLoading, setRouteLoading] = useState(true);

    useEffect(() => {
        halteService.getHaltesByRoute("RUTE_14").then(setHaltes);
        fetchRoadPolyline(RUTE_14_HALTE_COORDS).then(coords => {
            setRoadPolyline(coords);
            setRouteLoading(false);
        });
    }, []);

    const routePolyline = useMemo(() => roadPolyline, [roadPolyline]);

    // Build a lookup map from halte index → result
    const resultMap = useMemo(() => {
        if (!optimizationResults) return null;
        const m = new Map<number, OptimizationResult>();
        optimizationResults.forEach(r => m.set(r.halteIndex, r));
        return m;
    }, [optimizationResults]);

    // Filter haltes when showOnlyOptimal is true
    const visibleHaltes = useMemo(() => {
        if (!resultMap || !showOnlyOptimal) return haltes;
        return haltes.filter((_, idx) => {
            const r = resultMap.get(idx);
            return r ? r.isOptimal : true;
        });
    }, [haltes, resultMap, showOnlyOptimal]);

    return (
        <MapContainer
            center={MAP_CENTER}
            zoom={12}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            zoomControl={true}
            preferCanvas={true}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                maxZoom={19}
                keepBuffer={4}
            />

            <FitBounds haltes={visibleHaltes} />

            {/* Road-following polyline */}
            {routePolyline.length > 0 && (
                <>
                    <Polyline positions={routePolyline} color="#004d40" weight={10} opacity={0.15} />
                    <Polyline positions={routePolyline} color="#006c49" weight={5} opacity={0.85} />
                </>
            )}

            {/* Fallback while OSRM loading */}
            {routeLoading && (
                <Polyline
                    positions={RUTE_14_GEOJSON_POLYLINE}
                    color="#006c49"
                    weight={4}
                    opacity={0.5}
                    dashArray="8 6"
                />
            )}

            {/* Halte Markers with optimization coloring */}
            {visibleHaltes.map((halte) => {
                // Find the actual index in the full haltes array
                const actualIdx = haltes.indexOf(halte);
                const result = resultMap?.get(actualIdx);
                const hasResults = resultMap !== null;
                const isOptimal = result ? result.isOptimal : true;

                // If no results yet, show default markers
                const icon = hasResults
                    ? (isOptimal ? HALTE_ICONS.optimal : HALTE_ICONS.nonOptimal)
                    : HALTE_ICONS.optimal;

                return (
                    <Marker
                        key={halte.halteId}
                        position={[halte.latitude, halte.longitude]}
                        icon={icon}
                    >
                        <Popup>
                            <div style={{ minWidth: 200 }}>
                                <strong style={{ color: hasResults ? (isOptimal ? "#006c49" : "#ba1a1a") : "#00342b" }}>
                                    {isOptimal ? "✅" : "❌"} {halte.namaHalte}
                                </strong>
                                <br />
                                <span style={{ fontSize: 12, color: "#3f4945" }}>
                                    Halte #{halte.urutan} — Rute 14
                                </span>
                                {result && (
                                    <>
                                        <hr style={{ margin: "6px 0", border: "none", borderTop: "1px solid #e0e3e5" }} />
                                        <div style={{ fontSize: 12 }}>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "#3f4945" }}>Rata-rata Demand:</span>
                                                <strong>{result.averageDemand}</strong>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "#3f4945" }}>Total Demand:</span>
                                                <strong>{result.totalDemand.toLocaleString()}</strong>
                                            </div>
                                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                <span style={{ color: "#3f4945" }}>Z-Score:</span>
                                                <strong style={{ color: result.zScore >= 0 ? "#006c49" : "#ba1a1a" }}>
                                                    {result.zScore > 0 ? "+" : ""}{result.zScore}
                                                </strong>
                                            </div>
                                            <div style={{
                                                marginTop: 4,
                                                padding: "3px 8px",
                                                borderRadius: 6,
                                                textAlign: "center",
                                                fontWeight: 700,
                                                fontSize: 11,
                                                background: isOptimal ? "#dcfce7" : "#fee2e2",
                                                color: isOptimal ? "#006c49" : "#ba1a1a",
                                            }}>
                                                {isOptimal ? "OPTIMAL" : "TIDAK OPTIMAL"}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </Popup>
                    </Marker>
                );
            })}

            {/* Pulse rings for non-optimal haltes when results are available */}
            {resultMap && haltes.map((halte, idx) => {
                const result = resultMap.get(idx);
                if (!result || result.isOptimal) return null;
                if (showOnlyOptimal) return null; // hidden when filtering
                return (
                    <CircleMarker
                        key={`pulse-${halte.halteId}`}
                        center={[halte.latitude, halte.longitude]}
                        radius={16}
                        pathOptions={{
                            color: "#ba1a1a",
                            fillColor: "#ba1a1a",
                            fillOpacity: 0.12,
                            weight: 2,
                            dashArray: "4 4",
                        }}
                    />
                );
            })}
        </MapContainer>
    );
}
