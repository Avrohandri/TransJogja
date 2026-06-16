/**
 * Fetches the actual road-following route geometry from OSRM public API.
 * Accepts an array of [lat, lon] waypoints and returns a list of [lat, lon]
 * coordinates that follow actual roads (not straight lines).
 */
export async function fetchRoadPolyline(
    waypoints: [number, number][]
): Promise<[number, number][]> {
    // OSRM expects lon,lat order
    const coordStr = waypoints.map(([lat, lon]) => `${lon},${lat}`).join(";");
    const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("OSRM fetch failed");
        const json = await res.json();
        if (json.code !== "Ok" || !json.routes?.[0]) throw new Error("No route returned");

        // GeoJSON returns [lon, lat], we need to flip to [lat, lon] for Leaflet
        const coords: [number, number][] = json.routes[0].geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon]
        );
        return coords;
    } catch (e) {
        console.warn("OSRM routing failed, falling back to GeoJSON polyline:", e);
        return RUTE_14_GEOJSON_POLYLINE; // fallback: GeoJSON LineString geometry
    }
}

// ── Rute 14 — Halte TJ Bandara Adisucipto → Terminal Pakem ──────────────────
// Exact coordinates from OSM (node IDs matched), used as OSRM waypoints.
// Order: [latitude, longitude]
export const RUTE_14_HALTE_COORDS: [number, number][] = [
    [-7.7845212, 110.4357106],  //  1. Halte TJ Bandara Adisucipto
    [-7.7820541, 110.4297658],  //  2. Kantor Kesehatan Pelabuhan Yogya
    [-7.7693853, 110.4310562],  //  3. TJ RRU Disnaker
    [-7.7678861, 110.4315421],  //  4. Disnakertrans DI Yogyakarta
    [-7.765633,  110.4307000],  //  5. SMKN 1 Depok
    [-7.7607143, 110.4328691],  //  6. SDN 1 Depok
    [-7.7554682, 110.433896 ],  //  7. Kantor Urusan Agama Depok
    [-7.7504724, 110.4345757],  //  8. MAN 2 Sleman
    [-7.7428221, 110.4341572],  //  9. SMA Budi Mulia Dua
    [-7.7353784, 110.4345841],  // 10. Indomaret Pokoh Sambiroto
    [-7.7314029, 110.4347942],  // 11. Kantor Kalurahan Wedomartani
    [-7.723242,  110.4354068],  // 12. Simpang Babadan
    [-7.7223016, 110.4381609],  // 13. Simpang Selomartani
    [-7.7189712, 110.438211 ],  // 14. Simpang Kabunan
    [-7.7131712, 110.442979 ],  // 15. Raya Kabunan
    [-7.7135459, 110.4478741],  // 16. RS Mitra Paramedika
    [-7.7115009, 110.4487153],  // 17. Dusun Kenthi Kemasan
    [-7.7021127, 110.4474261],  // 18. Simpang Pasar Jangkang
    [-7.7041259, 110.442111 ],  // 19. Tugu Batas Desa Yapah
    [-7.7050782, 110.4393649],  // 20. Timur Jembatan Yapah
    [-7.7049142, 110.4349713],  // 21. SMA Negeri 2 Ngaglik
    [-7.7048027, 110.4331509],  // 22. Simpang Losari (Cozy)
    [-7.7048608, 110.4310374],  // 23. SPBU Mindi
    [-7.7042049, 110.4264208],  // 24. Lapangan Klidon
    [-7.7023223, 110.4205566],  // 25. SDN Selomulyo
    [-7.7011276, 110.4169564],  // 26. RSU Gramedika
    [-7.6998515, 110.4155216],  // 27. Simpang Besi Jangkang
    [-7.6955859, 110.4179513],  // 28. Pusat Rehabilitasi YAKKUM
    [-7.6872834, 110.4187258],  // 29. Boulevard UII
    [-7.6840524, 110.4191124],  // 30. Simpang Degolan
    [-7.6725689, 110.4173174],  // 31. Dusun Kledokan (Soto Brakot)
    [-7.669172,  110.4175705],  // 32. RS Panti Nugroho
    [-7.669071,  110.4176697],  // 33. SMPN 4 Pakem
    [-7.6668401, 110.4201971],  // 34. Terminal Pakem
];

// ── Static GeoJSON LineString geometry for Rute 14 (one-way) ────────────────
// Source: rute_14_adisucipto_ke_terminal_pakem_bersih.geojson
// Used as fallback when OSRM is unreachable. [lat, lon] format for Leaflet.
export const RUTE_14_GEOJSON_POLYLINE: [number, number][] = [
    [-7.7845212, 110.4357106],
    [-7.7820541, 110.4297658],
    [-7.7693853, 110.4310562],
    [-7.7678861, 110.4315421],
    [-7.7833639, 110.4310201],
    [-7.765633,  110.4315206],
    [-7.7607143, 110.4328691],
    [-7.7554682, 110.433896 ],
    [-7.7504724, 110.4345757],
    [-7.7428221, 110.4341572],
    [-7.7353784, 110.4345841],
    [-7.7314029, 110.4347942],
    [-7.723242,  110.4354068],
    [-7.7223016, 110.4381609],
    [-7.7189712, 110.438211 ],
    [-7.7131712, 110.442979 ],
    [-7.7135459, 110.4478741],
    [-7.7115009, 110.4487153],
    [-7.7021127, 110.4474261],
    [-7.7041259, 110.442111 ],
    [-7.7050782, 110.4393649],
    [-7.7049142, 110.4349713],
    [-7.7048027, 110.4331509],
    [-7.7048608, 110.4310374],
    [-7.7042049, 110.4264208],
    [-7.7023223, 110.4205566],
    [-7.7011276, 110.4169564],
    [-7.6998515, 110.4155216],
    [-7.6955859, 110.4179513],
    [-7.6872834, 110.4187258],
    [-7.6840524, 110.4191124],
    [-7.6725689, 110.4173174],
    [-7.669172,  110.4175705],
    [-7.669071,  110.4176697],
    [-7.6668401, 110.4201971],
];
