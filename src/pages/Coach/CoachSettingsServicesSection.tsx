import type { ClassType, ClassMode } from '@/services/coachSettingsService';

export interface ServiceRow {
  classType: ClassType;
  mode: ClassMode;
  price: string;
  maxStudents: string;
}

const CLASS_TYPE_LABELS: Record<ClassType, string> = {
  HOURLY: 'Hourly',
  HALF_DAY: 'Half day',
  FULL_DAY: 'Full day',
};

const CLASS_TYPES: ClassType[] = ['HOURLY', 'HALF_DAY', 'FULL_DAY'];

interface CoachSettingsServicesSectionProps {
  services: ServiceRow[];
  onUpdate: (index: number, field: keyof ServiceRow, value: string) => void;
  onAdd: () => void;
  onRemove: (index: number) => void;
}

export function CoachSettingsServicesSection({
  services,
  onUpdate,
  onAdd,
  onRemove,
}: CoachSettingsServicesSectionProps) {
  return (
    <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h2 className="text-white font-semibold text-lg">Services & rates</h2>
          <p className="text-gray-500 text-sm mt-1">
            Define how you teach and your prices. Each type/mode pair must be unique.
          </p>
        </div>
        <button
          type="button"
          onClick={onAdd}
          className="shrink-0 text-orange-400 hover:text-orange-300 text-sm font-semibold transition-colors"
        >
          + Add service
        </button>
      </div>

      {services.length === 0 && (
        <p className="text-gray-500 text-sm">Add at least one service so riders can book you.</p>
      )}

      <div className="space-y-4">
        {services.map((svc, idx) => (
          <div
            key={idx}
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-end bg-gray-900/40 border border-gray-700/60 rounded-xl p-4"
          >
            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Class type <span className="text-orange-400">*</span>
              </label>
              <select
                value={svc.classType}
                onChange={(e) => onUpdate(idx, 'classType', e.target.value)}
                className={selectClass}
              >
                {CLASS_TYPES.map((ct) => (
                  <option key={ct} value={ct}>
                    {CLASS_TYPE_LABELS[ct]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Mode <span className="text-orange-400">*</span>
              </label>
              <select
                value={svc.mode}
                onChange={(e) => onUpdate(idx, 'mode', e.target.value)}
                className={selectClass}
              >
                <option value="ONE_TO_ONE">One-to-one</option>
                <option value="GROUP">Group</option>
              </select>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">
                Price (AUD) <span className="text-orange-400">*</span>
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                required
                value={svc.price}
                onChange={(e) => onUpdate(idx, 'price', e.target.value)}
                className={selectClass}
                placeholder="0.00"
              />
            </div>

            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-xs text-gray-400 mb-1">
                  {svc.mode === 'GROUP' ? 'Max students' : 'Students'}
                </label>
                <input
                  type="number"
                  min={svc.mode === 'GROUP' ? 2 : 1}
                  max={svc.mode === 'ONE_TO_ONE' ? 1 : undefined}
                  required
                  value={svc.mode === 'ONE_TO_ONE' ? '1' : svc.maxStudents}
                  disabled={svc.mode === 'ONE_TO_ONE'}
                  onChange={(e) => onUpdate(idx, 'maxStudents', e.target.value)}
                  className={`${selectClass} disabled:opacity-50`}
                />
              </div>
              {services.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="pb-2 text-red-400 hover:text-red-300 text-sm font-medium"
                  title="Remove service"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const selectClass =
  'w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50';
