import { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, TileLayer, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Marker } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { useNavigate } from 'react-router-dom';
import { getPublicTracks } from '@/services/trackService';
import type { TrackMapItem } from '@/services/trackService';
import { LoadingSpinner } from '@/components/common';
import { ROUTES } from '@/router/routes';

// Fix leaflet default icon path (Vite/webpack bundler issue)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom pin marker: circle with motorbike + price, and a downward tail
function createTrackIcon(price: number) {
  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          background:linear-gradient(145deg,#f97316,#c2410c);
          color:#fff;font-weight:800;
          width:58px;height:58px;border-radius:50%;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          box-shadow:0 4px 14px rgba(0,0,0,.55);border:3px solid #fff;
          line-height:1;
        ">
          <span style="font-size:22px;">&#x1F3CD;&#xFE0F;</span>
          <span style="font-size:11px;margin-top:2px;letter-spacing:-0.5px">$${price}</span>
        </div>
        <div style="
          width:0;height:0;
          border-left:9px solid transparent;
          border-right:9px solid transparent;
          border-top:14px solid #c2410c;
          margin-top:-2px;
          filter:drop-shadow(0 3px 3px rgba(0,0,0,.4));
        "></div>
      </div>
    `,
    iconSize: [58, 76],
    iconAnchor: [29, 76],
    popupAnchor: [0, -80],
  });
}

const LEVEL_LABELS: Record<string, { label: string; color: string }> = {
  BEGINNER:     { label: 'Beginner', color: '#16a34a' },
  INTERMEDIATE: { label: 'Intermediate',   color: '#d97706' },
  ADVANCED:     { label: 'Advanced',     color: '#dc2626' },
};

// Marcador azul para la ubicación del usuario
const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:24px;height:24px;">
      <div style="
        position:absolute;inset:-6px;border-radius:50%;
        background:rgba(59,130,246,0.25);border:2px solid rgba(59,130,246,0.5);
      "></div>
      <div style="
        position:absolute;inset:3px;border-radius:50%;
        background:#3b82f6;border:3px solid #fff;
        box-shadow:0 2px 8px rgba(59,130,246,.7);
      "></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
  popupAnchor: [0, -16],
});

// Centra el mapa en una posición (se usa cuando no hay pistas)
function CenterOnUser({ pos }: { pos: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(pos, 13);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos[0], pos[1]]);
  return null;
}

// Auto-fit map bounds when tracks first load (runs ONCE on mount)
function FitBounds({ tracks }: { tracks: TrackMapItem[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || tracks.length === 0) return;
    fitted.current = true;
    const bounds = L.latLngBounds(tracks.map((t) => [t.lat, t.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

// Clustered markers layer
function TrackMarkers({ tracks }: { tracks: TrackMapItem[] }) {
  const navigate = useNavigate();

  return (
    <MarkerClusterGroup chunkedLoading>
      {tracks.map((track) => (
        <Marker
          key={track.id}
          position={[track.lat, track.lng]}
          icon={createTrackIcon(track.price)}
        >
          <Popup minWidth={200}>
            <div style={{ fontFamily: '-apple-system,sans-serif', padding: '2px 0' }}>
              <p style={{ fontWeight: 700, fontSize: 14, margin: '0 0 8px', lineHeight: 1.3 }}>
                {track.name}
              </p>
              <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>
                💲 <strong>${track.price} USD</strong>
              </p>
              <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>
                ⭐ {track.rating.toFixed(1)}
              </p>
              <p style={{ margin: '4px 0', fontSize: 13 }}>
                🏍️{' '}
                <span style={{
                  fontWeight: 600,
                  color: (LEVEL_LABELS[track.difficulty_level] ?? LEVEL_LABELS.BEGINNER).color,
                }}>
                  {(LEVEL_LABELS[track.difficulty_level] ?? LEVEL_LABELS.BEGINNER).label}
                </span>
              </p>
              <button
                onClick={() => navigate(ROUTES.TRACK_DETAIL(String(track.id)))}
                style={{
                  marginTop: 10, padding: '7px 16px',
                  background: '#f97316', color: '#fff',
                  border: 'none', borderRadius: 8,
                  fontSize: 12, fontWeight: 600, cursor: 'pointer', width: '100%',
                }}
              >
                View track →
              </button>
            </div>
          </Popup>
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}

const DIFFICULTY_FILTERS = [
  { value: 'ALL', label: 'All levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
] as const;

// MapPage component
export function MapPage() {
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'granted' | 'denied'>('pending');
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('ALL');
  const [panelOpen, setPanelOpen] = useState(true);

  useEffect(() => {
    if (!navigator.geolocation) {
      setTimeout(() => setGeoStatus('denied'), 0);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPos([coords.latitude, coords.longitude]);
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  const { data: tracks, isLoading, isError } = useQuery({
    queryKey: ['tracks', 'map'],
    queryFn: getPublicTracks,
  });

  const filteredTracks = useMemo(() => {
    if (!tracks) return [];
    const q = search.trim().toLowerCase();
    return tracks.filter((t) => {
      const matchesSearch = !q || t.name.toLowerCase().includes(q);
      const matchesDifficulty =
        difficulty === 'ALL' || t.difficulty_level === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [tracks, search, difficulty]);

  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-8 flex flex-col h-[calc(100vh-4rem)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-gray-900/95 border-b border-gray-800 shrink-0">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-white">Find a track</h1>
          {!isLoading && !isError && (
            <p className="text-gray-400 text-sm">
              {filteredTracks.length} of {tracks?.length ?? 0} shown · tap a pin to book
            </p>
          )}
        </div>
        <div className="hidden sm:flex items-center gap-3 text-xs text-gray-500">
          {geoStatus === 'granted' && (
            <span className="flex items-center gap-1 text-blue-400">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
              Your location
            </span>
          )}
          <span className="flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />
            Track
          </span>
        </div>
      </div>

      {/* Map area */}
      <div className="relative flex-1">
        {/* Search panel */}
        {!isLoading && !isError && (tracks?.length ?? 0) > 0 && (
          <div className="absolute top-3 left-3 z-[1000] max-w-xs w-[calc(100%-1.5rem)] sm:w-72">
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              className="sm:hidden mb-2 w-full py-2 px-3 rounded-lg bg-gray-900/95 border border-gray-700 text-sm text-white font-medium"
            >
              {panelOpen ? 'Hide filters' : 'Show filters'}
            </button>
            {panelOpen && (
              <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl p-4 shadow-xl space-y-3">
                <input
                  type="search"
                  placeholder="Search tracks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  aria-label="Filter by difficulty"
                >
                  {DIFFICULTY_FILTERS.map(({ value, label }) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {filteredTracks.length === 0 && (
                  <p className="text-amber-300/90 text-xs">No tracks match your filters.</p>
                )}
              </div>
            )}
          </div>
        )}
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-gray-950/70 gap-3">
            <LoadingSpinner size="lg" />
            <p className="text-gray-300 text-sm">Loading tracks...</p>
          </div>
        )}

        {/* Error overlay */}
        {isError && (
          <div className="absolute inset-0 z-[1000] flex flex-col items-center justify-center bg-gray-950/80 gap-3">
            <div className="text-4xl">⚠️</div>
            <p className="text-red-400 font-semibold">Map could not be loaded</p>
            <p className="text-gray-400 text-sm">Check your connection and try again</p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !isError && tracks?.length === 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-gray-900/90 border border-gray-700 rounded-xl px-6 py-4 text-center shadow-xl">
            <p className="text-2xl mb-1">🏁</p>
            <p className="text-white font-semibold">No tracks available</p>
            <p className="text-gray-400 text-xs mt-1">No approved company tracks yet</p>
          </div>
        )}

        {/* Leaflet map - always mounted so the container div exists */}
        <MapContainer
          center={[-33.4489, -70.6693]}
          zoom={7}
          style={{ width: '100%', height: '100%' }}
          zoomControl
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Centra en pistas si existen, si no en la ubicación del usuario */}
          {filteredTracks.length > 0 && <FitBounds tracks={filteredTracks} />}
          {filteredTracks.length === 0 && userPos && <CenterOnUser pos={userPos} />}
          {filteredTracks.length > 0 && <TrackMarkers tracks={filteredTracks} />}
          {/* Marcador de ubicación del usuario */}
          {userPos && (
            <Marker position={userPos} icon={userLocationIcon}>
              <Popup>📍 <strong>Your current location</strong></Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}
