"use client";
import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, CircleMarker, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { halteService, Halte } from "@/services/halteService";
import { busLocationService, BusLocation } from "@/services/busLocationService";
import {
    fetchRoadPolyline,
    CLUSTER_1_HALTE_COORDS,
    CLUSTER_2_HALTE_COORDS,
    TRANSIT_HALTE_INDEX,
} from "@/utils/roadRoute";

// Fix Leaflet marker icons — done once at module level
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Cluster colour palette ────────────────────────────────────────────────────
// Cluster 1 (Simpang Pasar Jangkang → Terminal Pakem) : Medium-light Blue
// Cluster 2 (TJ Adisucipto → Simpang Pasar Jangkang) : Lighter Green
// Transit   (Simpang Pasar Jangkang)                  : Soft Amber-Yellow

export const CLUSTER_COLORS = {
  cluster1: { line: "#2980d9", glow: "#1a5fa8" },   // medium-light blue
  cluster2: { line: "#22c55e", glow: "#15803d" },   // lighter green
  transit:  { line: "#f59e0b", glow: "#d97706" },   // soft amber-yellow
};

const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [36, 36], iconAnchor: [18, 18], popupAnchor: [0, -18],
});

/** Returns the cluster label string for popup display. */
function getClusterLabel(idx: number): string {
  if (idx === TRANSIT_HALTE_INDEX) return "Transit — Cluster 1 & 2";
  return idx < TRANSIT_HALTE_INDEX ? "Cluster 2 — TJ Adisucipto → Simpang Jangkang" : "Cluster 1 — Simpang Jangkang → Terminal Pakem";
}

// ─────────────────────────────────────────────────────────────────────────────

function LocateControl() {
    const map = useMap();
    useEffect(() => {
        const locateBtn = new L.Control({ position: 'bottomright' });
        locateBtn.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            div.innerHTML = `<button style="background:white; border:none; padding:10px; border-radius:8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); cursor:pointer; margin-bottom:8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00342b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            </button>`;
            div.onclick = () => { map.locate({ setView: true, maxZoom: 16 }); };
            return div;
        };
        locateBtn.addTo(map);
        return () => { locateBtn.remove(); };
    }, [map]);
    return null;
}

const MAP_CENTER: [number, number] = [-7.7281, 110.4312];

export default function UserMap({ isDetail = false }: { isDetail?: boolean }) {
    const [haltes, setHaltes] = useState<Halte[]>([]);
    const [buses, setBuses]   = useState<BusLocation[]>([]);

    // Two independent OSRM polylines
    const [c1Polyline, setC1Polyline] = useState<[number, number][]>([]);
    const [c2Polyline, setC2Polyline] = useState<[number, number][]>([]);
    const [c1Loading,  setC1Loading]  = useState(true);
    const [c2Loading,  setC2Loading]  = useState(true);

    // ── Gimmick animated bus ─────────────────────────────────────────
    const [busProgress, setBusProgress] = useState(0);
    const c1PathRef = useRef<{ pos: [number, number], halteIdx?: number }[]>([]);
    const c2PathRef = useRef<{ pos: [number, number], halteIdx?: number }[]>([]);

    useEffect(() => {
        halteService.getHaltesByRoute("RUTE_14").then(setHaltes);

        const unsub = busLocationService.subscribeLiveBuses("RUTE_14", setBuses);

        // Fetch both cluster road geometries in parallel
        Promise.all([
            fetchRoadPolyline(CLUSTER_1_HALTE_COORDS),
            fetchRoadPolyline(CLUSTER_2_HALTE_COORDS),
        ]).then(([c1, c2]) => {
            setC1Polyline(c1);
            setC2Polyline(c2);
            setC1Loading(false);
            setC2Loading(false);
        });

        return () => unsub();
    }, []);

    // Inject CSS for gimmick bus pulse animation (once per mount)
    useEffect(() => {
        const styleId = 'bus-gimmick-style';
        if (!document.getElementById(styleId)) {
            const el = document.createElement('style');
            el.id = styleId;
            el.textContent = `
                @keyframes busGimmickPulse {
                    0%,100% { box-shadow:0 0 14px rgba(220,20,60,.75),0 3px 8px rgba(0,0,0,.35); transform:scale(1); }
                    50%      { box-shadow:0 0 28px rgba(220,20,60,1),0 3px 10px rgba(0,0,0,.4); transform:scale(1.09); }
                }
                .bus-gimmick-dot {
                    display:flex; align-items:center; justify-content:center;
                    width:38px; height:38px;
                    background-color: white;
                    border-radius:50%; border:3px solid #DC143C;
                    box-shadow:0 0 14px rgba(220,20,60,.75),0 3px 8px rgba(0,0,0,.35);
                    animation:busGimmickPulse 1.4s ease-in-out infinite;
                }
                .bus-icon-mask {
                    width: 22px; height: 22px;
                    background-color: #DC143C;
                    mask-image: url('/gambar/icon%20bis.png');
                    mask-size: contain;
                    mask-repeat: no-repeat;
                    mask-position: center;
                    -webkit-mask-image: url('/gambar/icon%20bis.png');
                    -webkit-mask-size: contain;
                    -webkit-mask-repeat: no-repeat;
                    -webkit-mask-position: center;
                }
            `;
            document.head.appendChild(el);
        }
        return () => { document.getElementById('bus-gimmick-style')?.remove(); };
    }, []);

    // Build bus paths with simulated stops
    useEffect(() => {
        const buildPathWithStops = (
            polyLine: [number, number][],
            haltes: [number, number][],
            halteIndices: number[]
        ) => {
            const path: { pos: [number, number], halteIdx?: number }[] = [];
            
            // Precompute closest polyline index for each halte to act as a "stop"
            const stopIndices = new Map<number, number>(); // polyIdx -> globalHalteIdx
            for (let i = 0; i < haltes.length; i++) {
                const h = haltes[i];
                let min = Infinity;
                let polyIdx = 0;
                for (let j = 0; j < polyLine.length; j++) {
                    const d = (polyLine[j][0] - h[0]) ** 2 + (polyLine[j][1] - h[1]) ** 2;
                    if (d < min) { min = d; polyIdx = j; }
                }
                stopIndices.set(polyIdx, halteIndices[i]);
            }

            // Number of duplicated frames per stop (~2 seconds stop)
            const PAUSE_FRAMES = 35; 

            for (let i = 0; i < polyLine.length; i++) {
                path.push({ pos: polyLine[i] });
                if (stopIndices.has(i)) {
                    // Duplicate the coordinate to make the bus pause here
                    for (let p = 0; p < PAUSE_FRAMES; p++) {
                        path.push({ pos: polyLine[i], halteIdx: stopIndices.get(i) });
                    }
                }
            }
            return path;
        };

        if (c1Polyline.length > 0) {
            // Cluster 1 (reversed): Pakem -> Jangkang (indices 33 down to 17)
            const c1Indices = Array.from({length: 17}, (_, i) => 33 - i);
            c1PathRef.current = buildPathWithStops([...c1Polyline].reverse(), [...CLUSTER_1_HALTE_COORDS].reverse(), c1Indices);
        }
        if (c2Polyline.length > 0) {
            // Cluster 2: Adisucipto -> Jangkang (indices 0 to 17)
            const c2Indices = Array.from({length: 18}, (_, i) => i);
            c2PathRef.current = buildPathWithStops(c2Polyline, CLUSTER_2_HALTE_COORDS, c2Indices);
        }
    }, [c1Polyline, c2Polyline]);

    // Tick bus progress every 50 ms — extremely slow (approx 1 hour per loop)
    useEffect(() => {
        const id = setInterval(() => setBusProgress(p => (p + 0.000015) % 1), 50);
        return () => clearInterval(id);
    }, []);

    // Memoised so polylines don't re-render on bus updates
    const poly1 = useMemo(() => c1Polyline, [c1Polyline]);
    const poly2 = useMemo(() => c2Polyline, [c2Polyline]);

    // Straight-line fallback segments while OSRM loads
    const fallback1 = useMemo(() => CLUSTER_1_HALTE_COORDS, []);
    const fallback2 = useMemo(() => CLUSTER_2_HALTE_COORDS, []);

    // Interpolate gimmick buses lat/lng
    const bus1Pos = useMemo<{ pos: [number, number], halteIdx?: number } | null>(() => {
        const path = c1PathRef.current;
        if (path.length < 2) return null;
        const exact = busProgress * (path.length - 1);
        const lo = Math.floor(exact);
        const hi = Math.min(lo + 1, path.length - 1);
        const t = exact - lo;
        return {
            pos: [ path[lo].pos[0] + (path[hi].pos[0] - path[lo].pos[0]) * t, path[lo].pos[1] + (path[hi].pos[1] - path[lo].pos[1]) * t ],
            halteIdx: path[lo].halteIdx
        };
    }, [busProgress]);

    const bus2Pos = useMemo<{ pos: [number, number], halteIdx?: number } | null>(() => {
        const path = c2PathRef.current;
        if (path.length < 2) return null;
        const exact = busProgress * (path.length - 1);
        const lo = Math.floor(exact);
        const hi = Math.min(lo + 1, path.length - 1);
        const t = exact - lo;
        return {
            pos: [ path[lo].pos[0] + (path[hi].pos[0] - path[lo].pos[0]) * t, path[lo].pos[1] + (path[hi].pos[1] - path[lo].pos[1]) * t ],
            halteIdx: path[lo].halteIdx
        };
    }, [busProgress]);

    // Ruby-red custom mask divIcon — created once
    const gimmickBusIcon = useMemo(() => L.divIcon({
        html: `<div class="bus-gimmick-dot"><div class="bus-icon-mask"></div></div>`,
        className: '',
        iconSize: [38, 38],
        iconAnchor: [19, 19],
    }), []);

    return (
        <MapContainer
            center={MAP_CENTER}
            zoom={12}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            zoomControl={false}
            preferCanvas={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                maxZoom={19}
                keepBuffer={4}
            />

            {/* ── Cluster 1 polyline — Blue ───────────────────────────────── */}
            {poly1.length > 0 && (
                <>
                    <Polyline positions={poly1} color={CLUSTER_COLORS.cluster1.glow} weight={10} opacity={0.18} />
                    <Polyline positions={poly1} color={CLUSTER_COLORS.cluster1.line} weight={5}  opacity={0.92} />
                </>
            )}
            {c1Loading && (
                <Polyline positions={fallback1} color={CLUSTER_COLORS.cluster1.line} weight={4} opacity={0.45} dashArray="8 6" />
            )}

            {/* ── Cluster 2 polyline — Light Green ─────────────────────────── */}
            {poly2.length > 0 && (
                <>
                    <Polyline positions={poly2} color={CLUSTER_COLORS.cluster2.glow} weight={10} opacity={0.18} />
                    <Polyline positions={poly2} color={CLUSTER_COLORS.cluster2.line} weight={5}  opacity={0.92} />
                </>
            )}
            {c2Loading && (
                <Polyline positions={fallback2} color={CLUSTER_COLORS.cluster2.line} weight={4} opacity={0.45} dashArray="8 6" />
            )}

            {/* ── Halte Markers — compact circle per cluster colour ────────── */}
            {haltes.map((halte, idx) => {
                const isTransit = idx === TRANSIT_HALTE_INDEX;
                const clusterColor =
                    isTransit                ? CLUSTER_COLORS.transit.line  :
                    idx < TRANSIT_HALTE_INDEX ? CLUSTER_COLORS.cluster2.line :
                                               CLUSTER_COLORS.cluster1.line;

                return (
                    <CircleMarker
                        key={halte.halteId}
                        center={[halte.latitude, halte.longitude]}
                        radius={isTransit ? 10 : 7}
                        pathOptions={{
                            pane: "markerPane",
                            color: "#ffffff",
                            fillColor: clusterColor,
                            fillOpacity: 1,
                            weight: isTransit ? 3 : 2,
                        }}
                    >
                        <Popup>
                            <div style={{ minWidth: 180 }}>
                                <strong style={{ color: clusterColor }}>
                                    {isTransit ? "🔀 " : ""}{halte.namaHalte}
                                </strong>
                                <br />
                                <span style={{ fontSize: 11, color: "#3f4945" }}>
                                    Halte #{halte.urutan} — Rute 14
                                </span>
                                <br />
                                <span style={{
                                    display: "inline-block",
                                    marginTop: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: clusterColor + "22",
                                    color: clusterColor,
                                }}>
                                    {getClusterLabel(idx)}
                                </span>
                            </div>
                        </Popup>
                    </CircleMarker>
                );
            })}

            {/* ── Bus Markers (real-time) ──────────────────────────────────── */}
            {buses.map(bus => (
                <Marker key={bus.busId} position={[bus.latitude, bus.longitude]} icon={busIcon}>
                    <Popup>
                        <strong>Bus {bus.busId}</strong><br />
                        Kecepatan: {bus.speed} km/h
                    </Popup>
                </Marker>
            ))}

            {/* ── Gimmick buses (Cluster 1 & 2 towards Jangkang) ─────────── */}
            {bus1Pos && (
                <Marker position={bus1Pos.pos} icon={gimmickBusIcon} interactive={true}>
                    <Popup>
                        {bus1Pos.halteIdx !== undefined && haltes[bus1Pos.halteIdx] ? (
                            <div style={{ minWidth: 180, textAlign: 'left' }}>
                                <strong style={{ color: "#DC143C" }}>🚌 Bus TransJogja</strong>
                                <br />
                                <span style={{ fontSize: 11, color: "#3f4945" }}>
                                    Sedang berhenti di:<br />
                                    <span style={{ color: bus1Pos.halteIdx === TRANSIT_HALTE_INDEX ? CLUSTER_COLORS.transit.line : CLUSTER_COLORS.cluster1.line, fontWeight: 600 }}>
                                        {bus1Pos.halteIdx === TRANSIT_HALTE_INDEX ? "🔀 " : ""}{haltes[bus1Pos.halteIdx].namaHalte}
                                    </span>
                                </span>
                                <br />
                                <span style={{
                                    display: "inline-block",
                                    marginTop: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: (bus1Pos.halteIdx === TRANSIT_HALTE_INDEX ? CLUSTER_COLORS.transit.line : CLUSTER_COLORS.cluster1.line) + "22",
                                    color: bus1Pos.halteIdx === TRANSIT_HALTE_INDEX ? CLUSTER_COLORS.transit.line : CLUSTER_COLORS.cluster1.line,
                                }}>
                                    {getClusterLabel(bus1Pos.halteIdx)}
                                </span>
                            </div>
                        ) : (
                            <div style={{ minWidth: 180, textAlign: 'left' }}>
                                <strong style={{ color: "#DC143C" }}>🚌 Bus TransJogja</strong>
                                <br />
                                <span style={{ fontSize: 11, color: "#3f4945" }}>
                                    Sedang dalam perjalanan
                                </span>
                                <br />
                                <span style={{
                                    display: "inline-block",
                                    marginTop: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: "#DC143C22",
                                    color: "#DC143C",
                                }}>
                                    Arah: Simpang Jangkang
                                </span>
                            </div>
                        )}
                    </Popup>
                </Marker>
            )}
            {bus2Pos && (
                <Marker position={bus2Pos.pos} icon={gimmickBusIcon} interactive={true}>
                    <Popup>
                        {bus2Pos.halteIdx !== undefined && haltes[bus2Pos.halteIdx] ? (
                            <div style={{ minWidth: 180, textAlign: 'left' }}>
                                <strong style={{ color: "#DC143C" }}>🚌 Bus TransJogja</strong>
                                <br />
                                <span style={{ fontSize: 11, color: "#3f4945" }}>
                                    Sedang berhenti di:<br />
                                    <span style={{ color: bus2Pos.halteIdx === TRANSIT_HALTE_INDEX ? CLUSTER_COLORS.transit.line : CLUSTER_COLORS.cluster2.line, fontWeight: 600 }}>
                                        {bus2Pos.halteIdx === TRANSIT_HALTE_INDEX ? "🔀 " : ""}{haltes[bus2Pos.halteIdx].namaHalte}
                                    </span>
                                </span>
                                <br />
                                <span style={{
                                    display: "inline-block",
                                    marginTop: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: (bus2Pos.halteIdx === TRANSIT_HALTE_INDEX ? CLUSTER_COLORS.transit.line : CLUSTER_COLORS.cluster2.line) + "22",
                                    color: bus2Pos.halteIdx === TRANSIT_HALTE_INDEX ? CLUSTER_COLORS.transit.line : CLUSTER_COLORS.cluster2.line,
                                }}>
                                    {getClusterLabel(bus2Pos.halteIdx)}
                                </span>
                            </div>
                        ) : (
                            <div style={{ minWidth: 180, textAlign: 'left' }}>
                                <strong style={{ color: "#DC143C" }}>🚌 Bus TransJogja</strong>
                                <br />
                                <span style={{ fontSize: 11, color: "#3f4945" }}>
                                    Sedang dalam perjalanan
                                </span>
                                <br />
                                <span style={{
                                    display: "inline-block",
                                    marginTop: 4,
                                    fontSize: 10,
                                    fontWeight: 700,
                                    padding: "2px 8px",
                                    borderRadius: 6,
                                    background: "#DC143C22",
                                    color: "#DC143C",
                                }}>
                                    Arah: Simpang Jangkang
                                </span>
                            </div>
                        )}
                    </Popup>
                </Marker>
            )}

            {!isDetail && <LocateControl />}
        </MapContainer>
    );
}
