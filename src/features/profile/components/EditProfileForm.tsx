import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import type { UserProfile, UpdateProfileData, UserLevel } from '@/types/profile.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImageUploadField } from './ImageUploadField';
import { userService } from '@/services/userService';
import { getMediaUrl } from '@/utils/media';

interface EditProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: UpdateProfileData) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string;
}

/** Form fields managed by React Hook Form — photo URLs are resolved at submit time */
type FormValues = {
  nombre: string;
  nivel: UserLevel;
  moto: string;
};

const NIVEL_OPTIONS: { value: UserLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'PRO', label: 'Pro' },
];

/**
 * Formulario de edición de perfil de piloto
 * HU-06: Editar perfil
 */
export function EditProfileForm({
  profile,
  onSubmit,
  isLoading,
  errorMessage,
}: EditProfileFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: profile.nombre,
      nivel: profile.nivel,
      moto: profile.moto ?? '',
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [motoFile, setMotoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Keep URL refs so we can pass the latest saved URLs to ImageUploadField after saves
  const avatarUrlRef = useRef<string | null>(profile.foto);
  const motoUrlRef = useRef<string | null>(profile.foto_moto);

  // Sync when parent profile changes (after a successful save)
  useEffect(() => {
    reset({
      nombre: profile.nombre,
      nivel: profile.nivel,
      moto: profile.moto ?? '',
    });
    avatarUrlRef.current = profile.foto;
    motoUrlRef.current = profile.foto_moto;
    setAvatarFile(null);
    setMotoFile(null);
  }, [profile, reset]);

  const handleFormSubmit = async (values: FormValues) => {
    setUploadError(null);
    let fotoUrl: string | null = profile.foto;
    let fotoMotoUrl: string | null = profile.foto_moto;

    try {
      if (avatarFile) {
        fotoUrl = await userService.uploadPhoto('avatar', avatarFile);
      }
      if (motoFile) {
        fotoMotoUrl = await userService.uploadPhoto('moto', motoFile);
      }
    } catch (err) {
      setUploadError('Failed to upload the image. Check format and size (max 5 MB).');
      return;
    }

    await onSubmit({
      nombre: values.nombre,
      nivel: values.nivel,
      moto: values.moto.trim() || null,
      foto: fotoUrl,
      foto_moto: fotoMotoUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="space-y-8">

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Photos
        </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Foto de perfil */}
        <ImageUploadField
          label="Profile photo"
          currentUrl={getMediaUrl(profile.foto)}
          onFileSelect={setAvatarFile}
          placeholder="🧑‍🏍"
          disabled={isLoading}
        />

        {/* Foto de la moto */}
        <ImageUploadField
          label="Your bike photo"
          currentUrl={getMediaUrl(profile.foto_moto)}
          onFileSelect={setMotoFile}
          placeholder="🏍️"
          disabled={isLoading}
        />
      </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
          Rider details
        </legend>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Nombre */}
        <Input
          label="Name"
          fullWidth
          required
          placeholder="Your name"
          error={errors.nombre?.message}
          disabled={isLoading}
          {...register('nombre', {
            required: 'Name is required',
            minLength: { value: 1, message: 'Name cannot be empty' },
          })}
        />

        {/* Moto */}
        <Input
          label="Bike"
          fullWidth
          placeholder="e.g., Honda CRF 450R"
          helperText="Your bike model"
          error={errors.moto?.message}
          disabled={isLoading}
          {...register('moto')}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label className="text-sm font-semibold text-gray-200">
          Experience level <span className="text-orange-400">*</span>
        </label>
        <p className="text-xs text-gray-500 mb-1">Used to match you with suitable tracks and coaches</p>
        <select
          className="px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white
                     focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500
                     disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
          {...register('nivel')}
        >
          {NIVEL_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value} className="bg-gray-900">
              {label}
            </option>
          ))}
        </select>
        {errors.nivel && (
          <span className="text-sm text-red-400">{errors.nivel.message}</span>
        )}
      </div>
      </fieldset>

      {/* Errores */}
      {(uploadError || errorMessage) && (
        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
          <p className="text-sm text-red-400">{uploadError || errorMessage}</p>
        </div>
      )}

      {/* Botón submit */}
      <Button
        type="submit"
        variant="primary"
        fullWidth
        isLoading={isLoading}
        disabled={isLoading}
      >
        {isLoading ? 'Saving...' : 'Save changes'}
      </Button>
    </form>
  );
}
