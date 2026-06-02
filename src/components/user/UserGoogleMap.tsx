"use client";
import { useState, useCallback, useRef, useEffect } from "react";
import {
    GoogleMap,
    useJsApiLoader,
    DirectionsRenderer,
    Marker,
    InfoWindow,
} from "@react-google-maps/api";
import { busLocationService, BusLocation } from "@/services/busLocationService";

// ── Route 14 — 4 Segments as per Google Maps URLs ──────────────────────────────

const ROUTE_SEGMENTS: {
    origin: string;
    destination: string;
    waypoints: string[];
}[] = [
    {
        // Segment 1 — Halte 1–9
        origin: "Halte TJ Bandara Adisucipto",
        destination: "SMA Budi Mulia Dua",
        waypoints: [
            "Kantor Kesehatan Pelabuhan Yogya",
            "TJ RRU Disnaker",
            "Disnakertrans DI Yogyakarta",
            "SMKN 1 Depok Sleman",
            "SDN 1 Depok Sleman",
            "Kantor Urusan Agama Depok Sleman",
            "MAN 2 Sleman",
        ],
    },
    {
        // Segment 2 — Halte 9–18
        origin: "SMA Internasional Budi Mulia Dua Yogyakarta",
        destination: "Simpang Pasar Jangkang Widodomartani Ngemplak Sleman",
        waypoints: [
            "Indomaret Pokoh Sambiroto Wedomartani Ngemplak Sleman",
            "Kantor Kalurahan Wedomartani Ngemplak Sleman",
            "Simpang Babadan Wedomartani Ngemplak Sleman",
            "Simpang Selomartani Wedomartani Ngemplak Sleman",
            "Simpang Kabunan Wedomartani Ngemplak Sleman",
            "Raya Kabunan Widodomartani Ngemplak Sleman",
            "Rumah Sakit Mitra Paramedika Widodomartani Ngemplak Sleman",
            "Dusun Kenthi Kemasan Widodomartani Ngemplak Sleman",
        ],
    },
    {
        // Segment 3 — Halte 18–27
        origin: "Simpang Pasar Jangkang",
        destination: "Simpang Besi Jangkang",
        waypoints: [
            "Tugu Batas Desa Yapah",
            "Timur Jembatan Yapah",
            "SMA Negeri 2 Ngaglik",
            "Simpang Losari Cozy",
            "SPBU Mindi",
            "Lapangan Klidon",
            "SDN Selomulyo",
            "RSU Gramedika",
        ],
    },
    {
        // Segment 4 — Halte 27–34
        origin: "Simpang Besi Jangkang",
        destination: "Terminal Pakem",
        waypoints: [
            "Pusat Rehabilitasi YAKKUM",
            "Boulevard UII",
            "Simpang Degolan",
            "Dusun Kledokan Soto Brakot",
            "RS Panti Nugroho",
            "SMPN 4 Pakem",
        ],
    },
];

const ROUTE_LINE_COLOR = "#006c49";
const ROUTE_LINE_WEIGHT = 5;

const mapContainerStyle = { width: "100%", height: "100%" };
const defaultCenter = { lat: -7.7432, lng: 110.4211 }; // Center of route
const libraries: ("places" | "geometry")[] = ["places", "geometry"];

interface UserGoogleMapProps {
    isDetail?: boolean;
}

export default function UserGoogleMap({ isDetail = false }: UserGoogleMapProps) {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

    const { isLoaded, loadError } = useJsApiLoader({
        googleMapsApiKey: apiKey,
        libraries,
    });

    const [directions, setDirections] = useState<(google.maps.DirectionsResult | null)[]>([
        null, null, null, null,
    ]);
    const [buses, setBuses] = useState<BusLocation[]>([]);
    const [selectedBus, setSelectedBus] = useState<BusLocation | null>(null);
    const mapRef = useRef<google.maps.Map | null>(null);

    // Subscribe to live bus locations
    useEffect(() => {
        const unsub = busLocationService.subscribeLiveBuses("RUTE_14", setBuses);
        return () => unsub();
    }, []);

    // Fetch directions for all 4 segments after Google Maps loads
    useEffect(() => {
        if (!isLoaded) return;

        const directionsService = new google.maps.DirectionsService();

        ROUTE_SEGMENTS.forEach((seg, idx) => {
            directionsService.route(
                {
                    origin: seg.origin,
                    destination: seg.destination,
                    waypoints: seg.waypoints.map((loc) => ({
                        location: loc,
                        stopover: true,
                    })),
                    travelMode: google.maps.TravelMode.DRIVING,
                    region: "id", // Indonesia region hint
                },
                (result, status) => {
                    if (status === google.maps.DirectionsStatus.OK && result) {
                        setDirections((prev) => {
                            const next = [...prev];
                            next[idx] = result;
                            return next;
                        });
                    } else {
                        console.error(`Directions segment ${idx + 1} error:`, status);
                    }
                }
            );
        });
    }, [isLoaded]);

    const onMapLoad = useCallback((map: google.maps.Map) => {
        mapRef.current = map;
    }, []);

    const handleLocate = () => {
        if (navigator.geolocation && mapRef.current) {
            navigator.geolocation.getCurrentPosition((pos) => {
                mapRef.current?.panTo({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                });
                mapRef.current?.setZoom(16);
            });
        }
    };

    // DirectionsRenderer options — green route, hide default markers (we'll show our own)
    const directionsRenderOptions: google.maps.DirectionsRendererOptions = {
        polylineOptions: {
            strokeColor: ROUTE_LINE_COLOR,
            strokeWeight: ROUTE_LINE_WEIGHT,
            strokeOpacity: 0.9,
        },
        suppressMarkers: false, // show waypoint markers (A, B, C…)
        suppressInfoWindows: true,
    };

    if (loadError) {
        return (
            <div className="w-full h-full flex items-center justify-center bg-[#f2f4f6] text-[#ba1a1a] text-sm font-semibold p-4 text-center">
                ⚠️ Google Maps gagal dimuat. Periksa NEXT_PUBLIC_GOOGLE_MAPS_API_KEY di .env.local
            </div>
        );
    }

    if (!isLoaded) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#f2f4f6] gap-2">
                <div className="w-8 h-8 rounded-full border-4 border-[#006c49] border-t-transparent animate-spin" />
                <span className="text-sm text-[#3f4945]">Memuat peta…</span>
            </div>
        );
    }

    return (
        <div className="relative w-full h-full">
            <GoogleMap
                mapContainerStyle={mapContainerStyle}
                center={defaultCenter}
                zoom={13}
                onLoad={onMapLoad}
                options={{
                    zoomControl: false,
                    mapTypeControl: false,
                    streetViewControl: false,
                    fullscreenControl: false,
                    styles: [
                        { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] },
                    ],
                }}
            >
                {/* Route segments */}
                {directions.map((result, idx) =>
                    result ? (
                        <DirectionsRenderer
                            key={idx}
                            directions={result}
                            options={directionsRenderOptions}
                        />
                    ) : null
                )}

                {/* Live Bus Markers */}
                {buses.map((bus) => (
                    <Marker
                        key={bus.busId}
                        position={{ lat: bus.latitude, lng: bus.longitude }}
                        icon={{
                            url: "https://cdn-icons-png.flaticon.com/512/3448/3448339.png",
                            scaledSize: new google.maps.Size(36, 36),
                            anchor: new google.maps.Point(18, 18),
                        }}
                        onClick={() => setSelectedBus(bus)}
                    />
                ))}

                {/* Bus InfoWindow */}
                {selectedBus && (
                    <InfoWindow
                        position={{ lat: selectedBus.latitude, lng: selectedBus.longitude }}
                        onCloseClick={() => setSelectedBus(null)}
                    >
                        <div className="text-xs font-semibold text-[#00342b]">
                            <p>🚌 {selectedBus.busId}</p>
                            <p>Kecepatan: {selectedBus.speed} km/h</p>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>

            {/* Locate button */}
            {!isDetail && (
                <button
                    onClick={handleLocate}
                    className="absolute bottom-40 right-4 z-10 bg-white w-11 h-11 rounded-full shadow-md flex items-center justify-center text-[#00342b] border border-[#e0e3e5] hover:bg-[#f2f4f6]"
                    title="Lokasi saya"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="3" />
                    </svg>
                </button>
            )}

            {/* Loading indicator while segments load */}
            {directions.some((d) => d === null) && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full shadow text-[11px] font-semibold text-[#3f4945] flex items-center gap-2 border border-[#e0e3e5]">
                    <div className="w-3 h-3 rounded-full border-2 border-[#006c49] border-t-transparent animate-spin" />
                    Memuat rute {directions.filter(Boolean).length + 1} / 4…
                </div>
            )}
        </div>
    );
}
