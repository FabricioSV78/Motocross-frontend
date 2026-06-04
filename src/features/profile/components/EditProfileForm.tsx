import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import type { UpdateProfileData, UserLevel, UserProfile } from '@/types/profile.types';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui';
import { useAuth } from '@/providers/useAuth';
import { ROUTES } from '@/router/routes';
import { userService } from '@/services/userService';
import { getMediaUrl } from '@/utils/media';
import { ImageUploadField } from './ImageUploadField';

interface EditProfileFormProps {
  profile: UserProfile;
  onSubmit: (data: UpdateProfileData) => Promise<void>;
  isLoading: boolean;
  errorMessage?: string;
}

type FormValues = {
  nombre: string;
  nivel?: UserLevel;
  moto?: string;
  telefono?: string;
  bio?: string;
  experience?: string;
};

const NIVEL_OPTIONS: { value: UserLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'PRO', label: 'Pro' },
];

export function EditProfileForm({
  profile,
  onSubmit,
  isLoading,
  errorMessage,
}: EditProfileFormProps) {
  const { user } = useAuth();
  const isCoach = user?.role === 'COACH';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      nombre: profile.nombre,
      nivel: profile.nivel ?? 'BEGINNER',
      moto: profile.moto ?? '',
      telefono: profile.telefono ?? '',
      bio: profile.bio ?? '',
      experience: profile.experience ?? '',
    },
  });

  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [motoFile, setMotoFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const selectedLevel = watch('nivel');

  useEffect(() => {
    reset({
      nombre: profile.nombre,
      nivel: profile.nivel ?? 'BEGINNER',
      moto: profile.moto ?? '',
      telefono: profile.telefono ?? '',
      bio: profile.bio ?? '',
      experience: profile.experience ?? '',
    });
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

      if (!isCoach && motoFile) {
        fotoMotoUrl = await userService.uploadPhoto('moto', motoFile);
      }
    } catch {
      setUploadError('Failed to upload the image. Check format and size (max 5 MB).');
      return;
    }

    if (isCoach) {
      await onSubmit({
        nombre: values.nombre,
        foto: fotoUrl,
        telefono: values.telefono?.trim() || null,
        bio: values.bio?.trim() || null,
        experience: values.experience?.trim() || null,
      });
      return;
    }

    await onSubmit({
      nombre: values.nombre,
      nivel: values.nivel,
      moto: values.moto?.trim() || null,
      foto: fotoUrl,
      foto_moto: fotoMotoUrl,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} noValidate className="grid grid-cols-1 gap-8 lg:grid-cols-12">
      <div className="flex flex-col justify-between gap-6 lg:col-span-5">
        <div className="space-y-4">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Profile photos
          </p>

          <div className={`grid grid-cols-1 ${isCoach ? 'mx-auto max-w-[320px]' : 'grid-cols-2 gap-4'}`}>
            <ImageUploadField
              label={isCoach ? 'Coach photo' : 'Rider photo'}
              currentUrl={getMediaUrl(profile.foto)}
              onFileSelect={setAvatarFile}
              placeholder={isCoach ? 'Coach photo' : 'Rider photo'}
              heightClassName={isCoach ? 'h-64' : 'h-48'}
              disabled={isLoading}
            />

            {!isCoach && (
              <ImageUploadField
                label="Bike photo"
                currentUrl={getMediaUrl(profile.foto_moto)}
                onFileSelect={setMotoFile}
                placeholder="Bike photo"
                heightClassName="h-48"
                disabled={isLoading}
              />
            )}
          </div>
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-6 dark:border-gray-700/40">
          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading}
            className="py-2.5 font-bold shadow-lg hover:shadow-orange-500/10"
          >
            {isLoading ? 'Saving...' : 'Save changes'}
          </Button>

          <Link to={ROUTES.PROFILE} className="block w-full">
            <Button type="button" variant="outline" fullWidth className="py-2.5">
              Cancel
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col gap-5 rounded-2xl border border-gray-100 bg-slate-50/50 p-5 dark:border-gray-700/30 dark:bg-gray-900/10 lg:col-span-7">
        <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500">
          {isCoach ? 'Coach details' : 'Rider details'}
        </p>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

          {isCoach ? (
            <Input
              label="Phone number"
              fullWidth
              placeholder="e.g., +34 600 000 000"
              error={errors.telefono?.message}
              disabled={isLoading}
              {...register('telefono')}
            />
          ) : (
            <Input
              label="Bike model"
              fullWidth
              placeholder="e.g., Honda CRF 450R"
              error={errors.moto?.message}
              disabled={isLoading}
              {...register('moto')}
            />
          )}
        </div>

        {isCoach ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Experience details
              </label>
              <textarea
                id="experience"
                placeholder="Describe your racing or coaching experience..."
                rows={2}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs leading-relaxed text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white"
                {...register('experience')}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Biography / About me
              </label>
              <textarea
                id="bio"
                placeholder="Introduce yourself to pilots..."
                rows={3}
                disabled={isLoading}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2 text-xs leading-relaxed text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white"
                {...register('bio')}
              />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Experience level <span className="text-orange-400">*</span>
            </label>
            <SelectField
              value={selectedLevel ?? 'BEGINNER'}
              onChange={(value) => setValue('nivel', value as UserLevel, { shouldDirty: true, shouldValidate: true })}
              options={NIVEL_OPTIONS}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm text-slate-900 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:bg-gray-900/50 dark:text-white"
              disabled={isLoading}
              ariaLabel="Experience level"
            />
            {errors.nivel && (
              <span className="text-xs text-red-400">{errors.nivel.message}</span>
            )}
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Used to match you with suitable tracks and coaches
            </p>
          </div>
        )}
      </div>

      {(uploadError || errorMessage) && (
        <div className="lg:col-span-12 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-center">
          <p className="text-xs text-red-400">{uploadError || errorMessage}</p>
        </div>
      )}
    </form>
  );
}
