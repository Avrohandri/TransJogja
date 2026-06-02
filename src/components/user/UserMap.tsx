"use client";
import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { halteService, Halte } from "@/services/halteService";
import { busLocationService, BusLocation } from "@/services/busLocationService";
import { demandService } from "@/services/demandService";
import { fetchRoadPolyline, RUTE_14_HALTE_COORDS, RUTE_14_GEOJSON_POLYLINE } from "@/utils/roadRoute";

// Fix Leaflet marker icons
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom Icons
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [36, 36],
  iconAnchor: [18, 18],
  popupAnchor: [0, -18]
});

const getHalteIcon = (demandVal: number) => {
    let colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-grey.png';
    if (demandVal > 30) colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png';
    else if (demandVal > 15) colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-gold.png';
    else if (demandVal > 0) colorUrl = 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png';

    return new L.Icon({
        iconUrl: colorUrl,
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });
};

function LocateControl() {
    const map = useMap();
    useEffect(() => {
        const locateBtn = L.control({ position: 'bottomright' });
        locateBtn.onAdd = function () {
            const div = L.DomUtil.create('div', 'leaflet-bar leaflet-control leaflet-control-custom');
            div.innerHTML = `<button style="background:white; border:none; padding:10px; border-radius:8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); cursor:pointer; margin-bottom:8px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00342b" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
            </button>`;
            div.onclick = () => {
                map.locate({setView: true, maxZoom: 16});
            };
            return div;
        };
        locateBtn.addTo(map);
        return () => { locateBtn.remove(); };
    }, [map]);
    return null;
}

export default function UserMap({ isDetail = false }: { isDetail?: boolean }) {
    const [haltes, setHaltes] = useState<Halte[]>([]);
    const [buses, setBuses] = useState<BusLocation[]>([]);
    const [demandData, setDemandData] = useState<number[]>([]);
    // Road-following polyline coordinates fetched from OSRM
    const [roadPolyline, setRoadPolyline] = useState<[number, number][]>([]);
    const [routeLoading, setRouteLoading] = useState(true);

    useEffect(() => {
        halteService.getHaltesByRoute("RUTE_14").then(setHaltes);

        const today = new Date();
        demandService.getDemandByMonth(today.getMonth() + 1, today.getFullYear()).then(setDemandData);

        const unsub = busLocationService.subscribeLiveBuses("RUTE_14", setBuses);

        // Fetch actual road geometry from OSRM using all 35 halte coordinates
        setRouteLoading(true);
        fetchRoadPolyline(RUTE_14_HALTE_COORDS).then(coords => {
            setRoadPolyline(coords);
            setRouteLoading(false);
        });

        return () => unsub();
    }, []);

    // Center on first halte (Bandara Adisucipto)
    const mapCenter: [number, number] = [-7.7881, 110.4312];

    return (
        <MapContainer
            center={mapCenter}
            zoom={13}
            style={{ height: "100%", width: "100%", zIndex: 0 }}
            zoomControl={false}
        >
            <TileLayer
                url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            />

            {/* Road-following polyline (from OSRM) — renders after fetch */}
            {roadPolyline.length > 0 && (
                <>
                    {/* Outer glow / shadow line */}
                    <Polyline
                        positions={roadPolyline}
                        color="#004d40"
                        weight={10}
                        opacity={0.2}
                    />
                    {/* Main route line */}
                    <Polyline
                        positions={roadPolyline}
                        color="#006c49"
                        weight={5}
                        opacity={0.9}
                        dashArray={undefined}
                    />
                </>
            )}

            {/* Fallback while OSRM loading: use static GeoJSON geometry */}
            {routeLoading && (
                <Polyline
                    positions={RUTE_14_GEOJSON_POLYLINE}
                    color="#006c49"
                    weight={4}
                    opacity={0.5}
                    dashArray="8 6"
                />
            )}

            {/* Halte Markers */}
            {haltes.map((halte, idx) => (
                <Marker
                    key={halte.halteId}
                    position={[halte.latitude, halte.longitude]}
                    icon={getHalteIcon(demandData[idx] || 0)}
                >
                    <Popup>
                        <div style={{ minWidth: 160 }}>
                            <strong style={{ color: "#00342b" }}>{halte.namaHalte}</strong>
                            <br />
                            <span style={{ fontSize: 12, color: "#3f4945" }}>Halte #{halte.urutan} — Rute 14</span>
                        </div>
                    </Popup>
                </Marker>
            ))}

            {/* Bus Markers (real-time from Firestore) */}
            {buses.map(bus => (
                <Marker key={bus.busId} position={[bus.latitude, bus.longitude]} icon={busIcon}>
                    <Popup>
                        <strong>Bus {bus.busId}</strong><br />
                        Kecepatan: {bus.speed} km/h
                    </Popup>
                </Marker>
            ))}

            {!isDetail && <LocateControl />}
        </MapContainer>
    );
}
