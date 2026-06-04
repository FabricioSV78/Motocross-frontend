import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useProfile } from '@/features/profile';
import { EditProfileForm } from '@/features/profile/components/EditProfileForm';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { userService } from '@/services/userService';
import type { UpdateProfileData } from '@/types/profile.types';
import { ROUTES } from '@/router/routes';
import { useAuth } from '@/providers/useAuth';

/**
 * Página de edición de perfil del piloto y coach
 */
export function EditProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { profile, isLoading: isLoadingProfile, error: profileError } = useProfile();
  const { user, updateUser } = useAuth();

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (data: UpdateProfileData) => {
    setSaveError(null);
    setSaved(false);
    setIsSaving(true);

    try {
      const updatedProfile = await userService.updateProfile(data);

      // Actualizar la caché de React Query con los datos frescos del servidor
      queryClient.setQueryData(['profile', 'me'], updatedProfile);

      // Sincronizar el nombre en el contexto de autenticación
      if (user) {
        updateUser({
          ...user,
          name: updatedProfile.nombre,
        });
      }

      setSaved(true);
      setTimeout(() => navigate(ROUTES.PROFILE), 1200);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  // ── Estado de carga del perfil ──────────────────────────────────────────────
  if (isLoadingProfile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── Error al cargar ─────────────────────────────────────────────────────────
  if (profileError || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Could not load profile
          </h2>
          <p className="text-gray-400 mb-6">
            {profileError instanceof Error
              ? profileError.message
              : 'An unexpected error occurred'}
          </p>
          <Link to={ROUTES.PROFILE}>
            <Button variant="outline">Back to profile</Button>
          </Link>
        </div>
      </div>
    );
  }

  // ── Formulario ──────────────────────────────────────────────────────────────
  return (
    <div className="mx-auto max-w-5xl px-4">
      {/* Header */}
      <div className="mb-6">
        <h1 className="mb-1.5 text-2xl font-bold text-slate-950 sm:text-3xl dark:text-white">Edit profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Update your information below</p>
      </div>

      {/* Feedback de éxito */}
      {saved && (
        <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30">
          <p className="text-green-400 font-medium">✅ Profile updated successfully</p>
        </div>
      )}

      {/* Formulario */}
      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
        <EditProfileForm
          profile={profile}
          onSubmit={handleSubmit}
          isLoading={isSaving}
          errorMessage={saveError ?? undefined}
        />
      </div>
    </div>
  );
}
