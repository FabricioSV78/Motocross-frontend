import type { UserProfile } from '@/types/profile.types';
import { USER_LEVEL_LABELS, USER_LEVEL_COLORS } from '@/types/profile.types';
import { getMediaUrl } from '@/utils/media';

interface ProfileCardProps {
  profile: UserProfile;
}

/**
 * Tarjeta de perfil de usuario
 * Muestra la información del piloto de forma visual
 */
export function ProfileCard({ profile }: ProfileCardProps) {
  const motoUrl = getMediaUrl(profile.foto_moto);
  const avatarUrl = getMediaUrl(profile.foto);

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-700 overflow-hidden flex flex-col sm:flex-row min-h-[320px]">

      {/* ── Columna izquierda: identidad + stats ── */}
      <div className="flex flex-col justify-between p-8 sm:w-[45%] sm:border-r border-gray-700">

        {/* Avatar + nombre + email */}
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={profile.nombre}
                className="w-24 h-24 rounded-full object-cover border-2 border-orange-500/50 shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-2 border-orange-500/30 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center shadow-lg">
                <span className="text-3xl font-black text-orange-400">
                  {profile.nombre.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-orange-500 border-2 border-gray-900" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold text-white truncate">{profile.nombre}</h2>
            <p className="text-sm text-gray-400 truncate mt-0.5">{profile.email}</p>
            <span className={`inline-flex mt-2 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${USER_LEVEL_COLORS[profile.nivel]}`}>
              {USER_LEVEL_LABELS[profile.nivel]}
            </span>
          </div>
        </div>

        {/* Moto nombre */}
        <div className="mt-5 flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg">
          <span className="text-xl">🏍️</span>
          <div>
            <p className="text-[11px] uppercase tracking-widest text-gray-500">Bike</p>
            <p className="text-white font-semibold text-sm">
              {profile.moto || <span className="text-gray-600 italic">Not specified</span>}
            </p>
          </div>
        </div>

        {/* Level summary — sin stats vacíos que confunden */}
        <div className="mt-5 p-3 rounded-lg bg-gray-900/40 border border-gray-700/50">
          <p className="text-[11px] uppercase tracking-widest text-gray-500 mb-1">Experience</p>
          <p className="text-white text-sm">
            Your level is shown to coaches when you book a lesson.
          </p>
        </div>
      </div>

      {/* ── Columna derecha: foto moto ── */}
      <div className="relative sm:flex-1 min-h-[240px]">
        {motoUrl ? (
          <>
            <img
              src={motoUrl}
              alt="My bike"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 px-5 py-3 bg-gradient-to-t from-black/70 to-transparent">
              <p className="text-sm text-white/80 font-medium">🏍️ My bike</p>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 border-l border-dashed border-gray-700 text-gray-600">
            <span className="text-5xl">🏍️</span>
            <span className="text-sm">No bike photo</span>
          </div>
        )}
      </div>

    </div>
  );
}

