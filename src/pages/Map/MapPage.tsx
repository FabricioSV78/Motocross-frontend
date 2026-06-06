import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MapContainer, Marker, Popup, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useNavigate } from 'react-router-dom';
import { useThemeMode } from 'flowbite-react/hooks/use-theme-mode';
import L from 'leaflet';
import { clsx } from 'clsx';
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { getPublicTracks, type TrackMapItem } from '@/services/trackService';
import { ROUTES } from '@/router/routes';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const MAP_TILES = {
  light: {
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
};

const LEVEL_META: Record<string, { label: string; pin: string; badge: string; dot: string }> = {
  BEGINNER: {
    label: 'Beginner',
    pin: '#16a34a',
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  INTERMEDIATE: {
    label: 'Intermediate',
    pin: '#d97706',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/25',
    dot: 'bg-amber-500',
  },
  ADVANCED: {
    label: 'Advanced',
    pin: '#dc2626',
    badge: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-500/10 dark:text-red-300 dark:ring-red-500/25',
    dot: 'bg-red-500',
  },
};

const DIFFICULTY_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
] as const;

const DEFAULT_CENTER: [number, number] = [-33.4489, -70.6693];
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: true,
  timeout: 15_000,
  maximumAge: 30_000,
};

function getLevelMeta(level: string) {
  return LEVEL_META[level] ?? LEVEL_META.BEGINNER;
}

function createTrackIcon(track: TrackMapItem, selected: boolean, isDark: boolean) {
  const level = getLevelMeta(track.difficulty_level);
  const ring = selected ? '#f97316' : isDark ? '#0f172a' : '#ffffff';
  const size = selected ? 64 : 56;
  const price = formatTrackPrice(track.price);
  const priceFontSize = price.length > 5 ? 14 : 16;

  return L.divIcon({
    className: '',
    html: `
      <div style="display:flex;flex-direction:column;align-items:center;">
        <div style="
          width:${size}px;height:${size}px;border-radius:18px;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          background:linear-gradient(145deg,#f97316,#c2410c);
          color:#fff;font-family:Inter,Arial,sans-serif;font-weight:900;
          box-shadow:0 16px 34px rgba(15,23,42,.34);
          border:3px solid ${ring};
          transform:${selected ? 'translateY(-4px) scale(1.04)' : 'none'};
        ">
          <span style="font-size:11px;line-height:1;opacity:.9;">FROM</span>
          <span style="font-size:${priceFontSize}px;line-height:1.1;margin-top:3px;">$${price}</span>
        </div>
        <div style="
          width:14px;height:14px;border-radius:999px;background:${level.pin};
          border:3px solid ${ring};margin-top:-7px;
          box-shadow:0 8px 16px rgba(15,23,42,.28);
        "></div>
      </div>
    `,
    iconSize: [size, size + 16],
    iconAnchor: [size / 2, size + 12],
    popupAnchor: [0, -size - 8],
  });
}

const userLocationIcon = L.divIcon({
  className: '',
  html: `
    <div style="position:relative;width:28px;height:28px;">
      <div style="position:absolute;inset:-7px;border-radius:999px;background:rgba(37,99,235,.20);border:2px solid rgba(37,99,235,.36);"></div>
      <div style="position:absolute;inset:4px;border-radius:999px;background:#2563eb;border:3px solid #fff;box-shadow:0 8px 20px rgba(37,99,235,.45);"></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

function MapViewport({
  tracks,
  selectedTrack,
  userPos,
}: {
  tracks: TrackMapItem[];
  selectedTrack: TrackMapItem | null;
  userPos: [number, number] | null;
}) {
  const map = useMap();
  const trackKey = tracks.map((track) => track.id).join(',');

  useEffect(() => {
    if (selectedTrack) {
      map.flyTo([selectedTrack.lat, selectedTrack.lng], Math.max(map.getZoom(), 13), {
        animate: true,
        duration: 0.8,
      });
      return;
    }

    if (tracks.length > 0) {
      const bounds = L.latLngBounds(tracks.map((track) => [track.lat, track.lng]));
      map.fitBounds(bounds, { padding: [70, 70], maxZoom: 13 });
      return;
    }

    if (userPos) {
      map.setView(userPos, 13);
    }
  }, [map, selectedTrack, trackKey, tracks, userPos]);

  return null;
}

function TrackMarkers({
  tracks,
  selectedTrackId,
  isDark,
  distanceByTrackId,
  onSelect,
}: {
  tracks: TrackMapItem[];
  selectedTrackId: number | null;
  isDark: boolean;
  distanceByTrackId: Record<number, number>;
  onSelect: (track: TrackMapItem) => void;
}) {
  const navigate = useNavigate();

  return (
    <MarkerClusterGroup chunkedLoading>
      {tracks.map((track) => {
        const level = getLevelMeta(track.difficulty_level);
        const selected = selectedTrackId === track.id;

        return (
          <Marker
            key={track.id}
            position={[track.lat, track.lng]}
            icon={createTrackIcon(track, selected, isDark)}
            eventHandlers={{ click: () => onSelect(track) }}
          >
            <Popup minWidth={252} className="track-map-popup">
              <div className="space-y-2 rounded-[18px] border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-950">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-bold leading-tight text-slate-950 dark:text-white">
                      {track.name}
                    </p>
                  </div>
                  <span
                    className={clsx(
                      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ring-1',
                      level.badge,
                    )}
                  >
                    <span className={clsx('h-1.5 w-1.5 rounded-full', level.dot)} />
                    {level.label}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5">
                  <PopupMetric label="From" value={`$${formatTrackPrice(track.price)}`} />
                  <PopupMetric
                    label={distanceByTrackId[track.id] != null ? 'Distance' : 'Level'}
                    value={
                      distanceByTrackId[track.id] != null
                        ? formatDistance(distanceByTrackId[track.id])
                        : level.label
                    }
                  />
                </div>

                <Button
                  type="button"
                  size="sm"
                  fullWidth
                  onClick={() => navigate(ROUTES.TRACK_DETAIL(String(track.id)))}
                >
                  View track
                </Button>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MarkerClusterGroup>
  );
}

function PopupMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-700 dark:bg-slate-900/80">
      <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-[13px] font-black leading-tight text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

export function MapPage() {
  const navigate = useNavigate();
  const { computedMode } = useThemeMode();
  const isDark = computedMode === 'dark';
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [geoStatus, setGeoStatus] = useState<'pending' | 'granted' | 'denied'>(
    () => (typeof navigator !== 'undefined' && navigator.geolocation ? 'pending' : 'denied')
  );
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState<string>('ALL');
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);

  const requestUserLocation = useCallback(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }

    setGeoStatus('pending');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPos([coords.latitude, coords.longitude]);
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      GEOLOCATION_OPTIONS,
    );
  }, []);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      return;
    }

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserPos([coords.latitude, coords.longitude]);
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      GEOLOCATION_OPTIONS,
    );
  }, []);

  const {
    data: tracks = [],
    isLoading,
    isError,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['tracks', 'map'],
    queryFn: getPublicTracks,
  });

  const filteredTracks = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tracks.filter((track) => {
      const matchesSearch = !q || track.name.toLowerCase().includes(q);
      const matchesDifficulty =
        difficulty === 'ALL' || track.difficulty_level === difficulty;
      return matchesSearch && matchesDifficulty;
    });
  }, [tracks, search, difficulty]);

  const distanceByTrackId = useMemo(() => {
    if (!userPos) return {};

    return filteredTracks.reduce<Record<number, number>>((acc, track) => {
      acc[track.id] = calculateDistanceKm(userPos, [track.lat, track.lng]);
      return acc;
    }, {});
  }, [filteredTracks, userPos]);

  const visibleTracks = useMemo(() => {
    if (!userPos) return filteredTracks;

    return [...filteredTracks].sort(
      (a, b) => distanceByTrackId[a.id] - distanceByTrackId[b.id],
    );
  }, [distanceByTrackId, filteredTracks, userPos]);

  const effectiveSelectedTrackId =
    selectedTrackId != null && visibleTracks.some((track) => track.id === selectedTrackId)
      ? selectedTrackId
      : null;

  const selectedTrack = useMemo(
    () => visibleTracks.find((track) => track.id === effectiveSelectedTrackId) ?? null,
    [effectiveSelectedTrackId, visibleTracks],
  );

  const lowestPrice = useMemo(() => {
    if (filteredTracks.length === 0) return null;
    return Math.min(...filteredTracks.map((track) => track.price));
  }, [filteredTracks]);

  const nearestDistance = useMemo(() => {
    if (!userPos || visibleTracks.length === 0) return null;
    return distanceByTrackId[visibleTracks[0].id] ?? null;
  }, [distanceByTrackId, userPos, visibleTracks]);

  const difficultyCounts = useMemo(
    () =>
      DIFFICULTY_FILTERS.reduce<Record<string, number>>((acc, filter) => {
        acc[filter.value] =
          filter.value === 'ALL'
            ? tracks.length
            : tracks.filter((track) => track.difficulty_level === filter.value).length;
        return acc;
      }, {}),
    [tracks],
  );

  const clearFilters = () => {
    setSearch('');
    setDifficulty('ALL');
    setSelectedTrackId(null);
  };

  const selectedTile = isDark ? MAP_TILES.dark : MAP_TILES.light;

  return (
    <div className="relative h-full min-h-0 w-full overflow-hidden bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white">
      <div className="grid h-full min-h-0 grid-rows-[minmax(320px,52svh)_minmax(0,1fr)] md:grid-cols-[minmax(320px,360px)_minmax(0,1fr)] md:grid-rows-1 xl:grid-cols-[400px_minmax(0,1fr)] 2xl:grid-cols-[430px_minmax(0,1fr)]">
        <aside className="order-2 flex min-h-0 flex-col border-t border-slate-200 bg-white/94 shadow-2xl shadow-slate-200/60 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/94 dark:shadow-black/30 md:order-1 md:border-r md:border-t-0">
          <header className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-800 xl:px-5 xl:py-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-400">
                  Track explorer
                </p>
                <h1 className="mt-2 text-xl font-black tracking-tight text-slate-950 dark:text-white xl:text-2xl">
                  Find a track
                </h1>
                <p className="mt-1 text-sm leading-5 text-slate-500 dark:text-slate-400 max-sm:hidden">
                  Search, filter, preview, then open the track to book.
                </p>
              </div>
              {isFetching && !isLoading && (
                <span className="rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300">
                  Syncing
                </span>
              )}
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2 xl:mt-5">
              <StatCard label="Shown" value={`${filteredTracks.length}/${tracks.length}`} />
              <StatCard label="Nearest" value={nearestDistance != null ? formatDistance(nearestDistance) : '-'} />
              <StatCard label="Lowest price" value={lowestPrice != null ? `$${formatTrackPrice(lowestPrice)}` : '-'} />
            </div>
          </header>

          <div className="shrink-0 border-b border-slate-200 px-4 py-3 dark:border-slate-800 xl:px-5 xl:py-4">
            <label className="sr-only" htmlFor="track-search">
              Search tracks
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                /
              </span>
              <input
                id="track-search"
                type="search"
                placeholder="Search by track name"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-medium text-slate-950 placeholder-slate-400 shadow-sm outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 dark:border-slate-700 dark:bg-slate-900/80 dark:text-white dark:placeholder-slate-500"
              />
            </div>

            <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {DIFFICULTY_FILTERS.map((filter) => {
                const active = difficulty === filter.value;
                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() => setDifficulty(filter.value)}
                    className={clsx(
                      'shrink-0 rounded-full border px-3 py-2 text-xs font-bold transition',
                      active
                        ? 'border-orange-500 bg-orange-500 text-white shadow-lg shadow-orange-200/60 dark:shadow-orange-950/30'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-orange-500/50 dark:hover:text-orange-300',
                    )}
                  >
                    {filter.label}
                    <span className={clsx('ml-1', active ? 'text-white/80' : 'text-slate-400')}>
                      {difficultyCounts[filter.value] ?? 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-3 xl:px-5 xl:py-4">
            {isLoading && <TrackListSkeleton />}

            {isError && (
              <PanelMessage
                title="Tracks could not load"
                description="Check your connection and try again."
                action={<Button size="sm" onClick={() => refetch()}>Retry</Button>}
              />
            )}

            {!isLoading && !isError && tracks.length === 0 && (
              <PanelMessage
                title="No tracks yet"
                description="Approved company tracks will appear here and on the map."
              />
            )}

            {!isLoading && !isError && tracks.length > 0 && filteredTracks.length === 0 && (
              <PanelMessage
                title="No matches"
                description="Try another name or level filter."
                action={<Button size="sm" variant="outline" onClick={clearFilters}>Clear filters</Button>}
              />
            )}

            {!isLoading && !isError && visibleTracks.length > 0 && (
              <div className="space-y-3">
                {visibleTracks.map((track) => (
                  <TrackResultCard
                    key={track.id}
                    track={track}
                    selected={track.id === effectiveSelectedTrackId}
                    distanceKm={distanceByTrackId[track.id]}
                    onFocus={() => setSelectedTrackId(track.id)}
                    onOpen={() => navigate(ROUTES.TRACK_DETAIL(String(track.id)))}
                  />
                ))}
              </div>
            )}
          </div>
        </aside>

        <section className="relative order-1 min-h-0 overflow-hidden bg-slate-200 dark:bg-slate-900 md:order-2">
          <div className="absolute left-3 right-3 top-3 z-[1000] flex flex-wrap items-center justify-between gap-2 xl:left-5 xl:right-5 xl:top-4">
            <div className="max-w-full rounded-2xl border border-white/70 bg-white/88 px-3 py-2 shadow-xl shadow-slate-300/40 backdrop-blur-xl dark:border-slate-700/80 dark:bg-slate-950/86 dark:shadow-black/30 sm:px-4 sm:py-3">
              <p className="text-sm font-bold text-slate-950 dark:text-white">
                {filteredTracks.length} tracks visible
              </p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 sm:gap-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-orange-500" />
                  Lowest-price pins
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-blue-600" />
                  {geoStatus === 'granted'
                    ? 'GPS active'
                    : geoStatus === 'pending'
                      ? 'Finding GPS'
                      : 'GPS optional'}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={requestUserLocation}
                className="rounded-full border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 shadow-lg shadow-slate-300/30 backdrop-blur-xl transition hover:border-blue-300 hover:bg-blue-100 hover:text-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:border-blue-400/30 dark:bg-blue-500/15 dark:text-blue-200 dark:shadow-black/30 dark:hover:border-blue-300/50 dark:hover:bg-blue-500/25 dark:hover:text-blue-100"
              >
                {geoStatus === 'granted' ? 'Update GPS' : 'Use my GPS'}
              </button>
              {(search || difficulty !== 'ALL') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-slate-200 bg-white/90 px-3 py-2 text-xs font-bold text-slate-700 shadow-lg shadow-slate-300/30 backdrop-blur-xl transition hover:border-orange-300 hover:text-orange-600 dark:border-slate-700 dark:bg-slate-950/88 dark:text-slate-300 dark:shadow-black/30 dark:hover:border-orange-500/50 dark:hover:text-orange-300"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {isLoading && (
            <MapOverlay>
              <LoadingSpinner size="lg" />
              <p className="mt-3 text-sm font-semibold text-slate-700 dark:text-slate-300">
                Loading tracks...
              </p>
            </MapOverlay>
          )}

          {isError && (
            <MapOverlay>
              <p className="text-lg font-bold text-slate-950 dark:text-white">Map could not be loaded</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Check your connection and try again.
              </p>
              <Button className="mt-4" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </MapOverlay>
          )}

          {!isLoading && !isError && tracks.length > 0 && filteredTracks.length === 0 && (
            <MapOverlay>
              <p className="text-lg font-bold text-slate-950 dark:text-white">No tracks match</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Clear the filters to see all available tracks.
              </p>
              <Button className="mt-4" size="sm" variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            </MapOverlay>
          )}

          <MapContainer
            center={DEFAULT_CENTER}
            zoom={7}
            zoomControl={false}
            className="track-map h-full w-full"
            style={{ width: '100%', height: '100%' }}
          >
            <TileLayer
              key={computedMode}
              attribution={selectedTile.attribution}
              url={selectedTile.url}
            />
            <ZoomControl position="bottomright" />
            <MapViewport
              tracks={visibleTracks}
              selectedTrack={selectedTrack}
              userPos={userPos}
            />
            {visibleTracks.length > 0 && (
              <TrackMarkers
                tracks={visibleTracks}
                selectedTrackId={effectiveSelectedTrackId}
                isDark={isDark}
                distanceByTrackId={distanceByTrackId}
                onSelect={(track) => setSelectedTrackId(track.id)}
              />
            )}
            {userPos && (
              <Marker position={userPos} icon={userLocationIcon}>
                <Popup className="track-map-popup">
                  <div className="space-y-1 text-sm">
                    <strong>Your current location</strong>
                  </div>
                </Popup>
              </Marker>
            )}
          </MapContainer>
        </section>
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-900/70">
      <p className="text-[10px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function TrackResultCard({
  track,
  selected,
  distanceKm,
  onFocus,
  onOpen,
}: {
  track: TrackMapItem;
  selected: boolean;
  distanceKm?: number;
  onFocus: () => void;
  onOpen: () => void;
}) {
  const level = getLevelMeta(track.difficulty_level);

  return (
    <article
      className={clsx(
        'rounded-2xl border p-4 transition-all',
        selected
          ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-200/60 dark:bg-orange-500/10 dark:shadow-orange-950/20'
          : 'border-slate-200 bg-white hover:border-orange-300 hover:shadow-lg hover:shadow-slate-200/70 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-orange-500/40 dark:hover:shadow-black/20',
      )}
    >
      <button type="button" onClick={onFocus} className="w-full text-left">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="truncate text-base font-bold text-slate-950 dark:text-white">
              {track.name}
            </h2>
            <p className="mt-1 text-sm font-medium text-slate-500 dark:text-slate-400">
              From <span className="font-bold text-slate-800 dark:text-slate-200">${formatTrackPrice(track.price)}</span> USD
              {distanceKm != null && (
                <span className="ml-2 font-bold text-blue-600 dark:text-blue-300">
                  {formatDistance(distanceKm)}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className={clsx('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ring-1', level.badge)}>
            <span className={clsx('h-1.5 w-1.5 rounded-full', level.dot)} />
            {level.label}
          </span>
          {selected && (
            <span className="rounded-full bg-slate-950 px-2.5 py-1 text-xs font-bold text-white dark:bg-white dark:text-slate-950">
              Selected
            </span>
          )}
        </div>
      </button>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={onFocus}>
          Focus map
        </Button>
        <Button type="button" size="sm" onClick={onOpen}>
          View track
        </Button>
      </div>
    </article>
  );
}

function PanelMessage({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-center dark:border-slate-700 dark:bg-slate-900/50">
      <p className="text-base font-bold text-slate-950 dark:text-white">{title}</p>
      <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500 dark:text-slate-400">
        {description}
      </p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

function MapOverlay({ children }: { children: ReactNode }) {
  return (
    <div className="absolute inset-0 z-[1100] flex items-center justify-center bg-white/62 p-6 backdrop-blur-sm dark:bg-slate-950/62">
      <div className="max-w-sm rounded-2xl border border-slate-200 bg-white/94 p-6 text-center shadow-2xl shadow-slate-300/60 dark:border-slate-700 dark:bg-slate-950/94 dark:shadow-black/30">
        {children}
      </div>
    </div>
  );
}

function TrackListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div
          key={index}
          className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900"
        />
      ))}
    </div>
  );
}

function formatTrackPrice(price: number) {
  if (Number.isInteger(price)) return String(price);
  return price.toFixed(2).replace(/\.?0+$/, '');
}

function calculateDistanceKm(from: [number, number], to: [number, number]) {
  const earthRadiusKm = 6371;
  const lat1 = toRadians(from[0]);
  const lat2 = toRadians(to[0]);
  const deltaLat = toRadians(to[0] - from[0]);
  const deltaLng = toRadians(to[1] - from[1]);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;

  return earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function formatDistance(distanceKm: number) {
  if (distanceKm < 1) return `${Math.round(distanceKm * 1000)} m`;
  if (distanceKm < 10) return `${distanceKm.toFixed(1)} km`;
  return `${Math.round(distanceKm)} km`;
}
