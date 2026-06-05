import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Button } from '@/components/ui/Button';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER: [number, number] = [-33.4489, -70.6693];

interface TrackLocationPickerProps {
  latitude: string;
  longitude: string;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  error?: string;
}

export function TrackLocationPicker({
  latitude,
  longitude,
  onLatitudeChange,
  onLongitudeChange,
  error,
}: TrackLocationPickerProps) {
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'denied'>('idle');

  const latNum = parseFloat(latitude);
  const lngNum = parseFloat(longitude);
  const hasCoords = !isNaN(latNum) && !isNaN(lngNum);
  const center: [number, number] = hasCoords ? [latNum, lngNum] : DEFAULT_CENTER;

  function setCoords(lat: number, lng: number) {
    onLatitudeChange(lat.toFixed(6));
    onLongitudeChange(lng.toFixed(6));
  }

  function useMyLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }

    setGeoStatus('loading');
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setCoords(coords.latitude, coords.longitude);
        setGeoStatus('idle');
      },
      () => setGeoStatus('denied'),
      { timeout: 10000, maximumAge: 60_000 },
    );
  }

  const googleMapsUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${latNum},${lngNum}`
    : null;

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-slate-800 dark:text-gray-200">
            Track location <span className="text-orange-400">*</span>
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-gray-500">
            Click the map, use GPS, or enter coordinates. Verify on Google Maps.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" onClick={useMyLocation}>
          {geoStatus === 'loading' ? 'Locating...' : 'Use my GPS'}
        </Button>
      </div>

      {geoStatus === 'denied' && (
        <p className="text-xs text-amber-600 dark:text-amber-300/90">
          GPS unavailable. Click the map or enter latitude and longitude manually.
        </p>
      )}

      <div className="h-56 overflow-hidden rounded-xl border border-slate-300 dark:border-gray-700 sm:h-64">
        <MapContainer
          center={center}
          zoom={hasCoords ? 14 : 6}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onSelect={setCoords} />
          {hasCoords && <Marker position={[latNum, lngNum]} />}
          <RecenterWhenCoords lat={latNum} lng={lngNum} hasCoords={hasCoords} />
        </MapContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-gray-400">Latitude</label>
          <input
            type="number"
            step="any"
            value={latitude}
            onChange={(e) => onLatitudeChange(e.target.value)}
            placeholder="e.g. -33.8688"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs text-slate-500 dark:text-gray-400">Longitude</label>
          <input
            type="number"
            step="any"
            value={longitude}
            onChange={(e) => onLongitudeChange(e.target.value)}
            placeholder="e.g. -70.6693"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500/50 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          />
        </div>
      </div>

      {googleMapsUrl && (
        <a
          href={googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex text-sm text-orange-400 hover:text-orange-300 transition-colors"
        >
          Open in Google Maps →
        </a>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}

function MapClickHandler({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function RecenterWhenCoords({
  lat,
  lng,
  hasCoords,
}: {
  lat: number;
  lng: number;
  hasCoords: boolean;
}) {
  const map = useMap();
  useEffect(() => {
    if (hasCoords) {
      map.setView([lat, lng], 14, { animate: true });
    }
  }, [lat, lng, hasCoords, map]);
  return null;
}
