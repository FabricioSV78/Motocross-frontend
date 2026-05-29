import type { AllTracksItem } from '@/services/coachSettingsService';

interface CoachSettingsTracksSectionProps {
  allTracks: AllTracksItem[];
  trackSearch: string;
  onTrackSearchChange: (value: string) => void;
  selectedTrackIds: number[];
  onToggleTrack: (id: number) => void;
}

export function CoachSettingsTracksSection({
  allTracks,
  trackSearch,
  onTrackSearchChange,
  selectedTrackIds,
  onToggleTrack,
}: CoachSettingsTracksSectionProps) {
  const query = trackSearch.toLowerCase().trim();
  const visible = query
    ? allTracks.filter((t) => t.name.toLowerCase().includes(query))
    : allTracks;

  return (
    <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6">
      <h2 className="text-white font-semibold text-lg mb-1">Enabled tracks</h2>
      <p className="text-gray-500 text-sm mb-4">
        Select tracks where you offer coaching. Riders will see you on these locations.
      </p>

      {allTracks.length > 0 && (
        <input
          type="search"
          value={trackSearch}
          onChange={(e) => onTrackSearchChange(e.target.value)}
          placeholder="Search by track name..."
          className="w-full mb-4 bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      )}

      {allTracks.length === 0 ? (
        <p className="text-gray-500 text-sm">No tracks available on the platform yet.</p>
      ) : visible.length === 0 ? (
        <p className="text-gray-500 text-sm">No tracks match your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {visible.map((track) => {
            const checked = selectedTrackIds.includes(track.id);
            return (
              <label
                key={track.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  checked
                    ? 'border-orange-500/50 bg-orange-500/10 text-white'
                    : 'border-gray-600/80 bg-gray-900/40 text-gray-300 hover:border-gray-500'
                }`}
              >
                <input
                  type="checkbox"
                  className="accent-orange-500"
                  checked={checked}
                  onChange={() => onToggleTrack(track.id)}
                />
                <span className="text-sm font-medium">{track.name}</span>
              </label>
            );
          })}
        </div>
      )}

      {selectedTrackIds.length > 0 && (
        <p className="text-xs text-orange-400 mt-3">
          {selectedTrackIds.length} track{selectedTrackIds.length !== 1 ? 's' : ''} selected
        </p>
      )}
    </section>
  );
}
