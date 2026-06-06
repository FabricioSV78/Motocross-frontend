import { useState, useRef } from 'react';
import { useProfile } from '@/features/profile';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { useAuth } from '@/providers/useAuth';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userService } from '@/services/userService';
import { getMediaUrl } from '@/utils/media';
import { USER_LEVEL_LABELS, USER_LEVEL_COLORS } from '@/types/profile.types';
import { authApi } from '@/features/auth/api/authApi';

const ROLE_LABELS: Record<string, string> = {
  COMPANY: 'Company',
  COACH: 'Coach',
  ADMIN: 'Administrator',
  PILOT: 'Rider',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:   'bg-green-500/15 border-green-500/30 text-green-400',
  APPROVED: 'bg-green-500/15 border-green-500/30 text-green-400',
  PENDING:  'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  REJECTED: 'bg-red-500/15 border-red-500/30 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:   'Active',
  APPROVED: 'Approved',
  PENDING:  'Pending Approval',
  REJECTED: 'Rejected',
};

/**
 * User Profile Page (HU-05 / HU-09)
 * Renders a simple, unified, and highly professional layout for both Riders and Coaches.
 * Automatically adapts to light and dark theme modes.
 */
export function ProfilePage() {
  const { user } = useAuth();

  if (user?.role === 'PILOT' || user?.role === 'COACH') {
    return <UnifiedProfileView role={user.role} />;
  }
  return <BasicProfileView />;
}

// ---------------------------------------------------------------------------
// Unified Professional View (Rider & Coach)
// ---------------------------------------------------------------------------
function UnifiedProfileView({ role }: { role: 'PILOT' | 'COACH' }) {
  const { profile, isLoading, error, refetch } = useProfile();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [certFile, setCertFile] = useState<File | null>(null);
  const [isUploadingCert, setIsUploadingCert] = useState(false);
  const [certError, setCertError] = useState<string | null>(null);
  const [certSuccess, setCertSuccess] = useState<string | null>(null);

  const dashboardRoute =
    role === 'COACH' ? ROUTES.COACH_DASHBOARD : ROUTES.DASHBOARD;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Failed to load profile</h2>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => refetch()} variant="primary">
              Try again
            </Button>
            <Link to={dashboardRoute}>
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const avatarUrl = getMediaUrl(profile.foto);
  const bikePhotoUrl = getMediaUrl(profile.foto_moto);
  const initials = profile.nombre.charAt(0).toUpperCase();
  const badgeClass = STATUS_BADGE[profile.status ?? 'ACTIVE'] ?? 'bg-gray-700/30 border-gray-600 text-gray-400';
  const statusLabel = STATUS_LABELS[profile.status ?? 'ACTIVE'] ?? (profile.status ?? 'Active');
  const roleLabel = ROLE_LABELS[role] ?? role;

  const handleCertificateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setCertError('File must be under 5 MB.');
      setCertFile(null);
      return;
    }

    setCertError(null);
    setCertSuccess(null);
    setCertFile(file);
  };

  const handleCertificateSubmit = async () => {
    if (!certFile) return;
    setIsUploadingCert(true);
    setCertError(null);
    setCertSuccess(null);

    try {
      await authApi.uploadCertificate(certFile);
      setCertSuccess('Certificate submitted successfully for review.');
      setCertFile(null);
      
      // Update local profile queries to show pending review state
      queryClient.invalidateQueries({ queryKey: ['profile', 'me'] });
      setTimeout(() => refetch(), 1000);
    } catch (err) {
      setCertError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploadingCert(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Profile Settings</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your account details and options</p>
        </div>
        <Link to={dashboardRoute}>
          <Button variant="outline" size="sm">Back to Dashboard</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── Left Column: Identity Sidebar ── */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 flex flex-col items-center text-center shadow-xl">
            
            {/* Avatar Container */}
            <div className="relative shrink-0 mt-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={profile.nombre}
                  className="w-28 h-28 rounded-full object-cover border-4 border-orange-500/30 dark:border-orange-500/20 shadow-2xl"
                />
              ) : (
                <div className="w-28 h-28 rounded-full border-4 border-orange-500/20 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-gray-800 dark:to-gray-900 flex items-center justify-center shadow-2xl">
                  <span className="text-4xl font-black text-orange-500 dark:text-orange-400">
                    {initials}
                  </span>
                </div>
              )}
              <span className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-green-500 border-4 border-white dark:border-gray-800 shadow-md" />
            </div>

            {/* Basic Info */}
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-5 truncate w-full px-2">{profile.nombre}</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5 truncate w-full px-2">{profile.email}</p>
            {profile.telefono && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 bg-slate-100 dark:bg-gray-900/40 px-3 py-1 rounded-full font-medium">
                📞 {profile.telefono}
              </p>
            )}

            {/* Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-orange-500/10 text-orange-500 dark:text-orange-400 border border-orange-500/25">
                {roleLabel}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeClass}`}>
                {statusLabel}
              </span>
            </div>

            <div className="w-full border-t border-gray-100 dark:border-gray-700/40 my-6" />

            {/* Edit Action Button */}
            <Link to={ROUTES.EDIT_PROFILE} className="w-full">
              <Button variant="primary" fullWidth className="py-2.5 shadow-lg hover:shadow-orange-500/10">
                Edit Profile Info
              </Button>
            </Link>
          </div>
        </div>

        {/* ── Right Column: Specific Profile Content ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* PILOT SPECIFIC VIEW */}
          {role === 'PILOT' && (
            <>
              {/* Rider Experience Card */}
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Rider Experience</h3>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700/50">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Current Skill Level</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Coaches use this level to customize your track session safely.
                    </p>
                  </div>
                  <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${USER_LEVEL_COLORS[profile.nivel ?? 'BEGINNER']}`}>
                    {USER_LEVEL_LABELS[profile.nivel ?? 'BEGINNER']}
                  </span>
                </div>
              </div>

              {/* Bike Details Card */}
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xl overflow-hidden">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">My Motorcycle</h3>
                
                {profile.moto || bikePhotoUrl ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700/50 rounded-xl">
                      <span className="text-2xl">🏍️</span>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold">Motorcycle model</p>
                        <p className="text-slate-800 dark:text-white font-bold">
                          {profile.moto || 'Not specified'}
                        </p>
                      </div>
                    </div>

                    <div className="relative h-64 w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {bikePhotoUrl ? (
                        <img
                          src={bikePhotoUrl}
                          alt="Bike"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-100 dark:bg-gray-900/40 flex flex-col items-center justify-center gap-2 text-slate-400 dark:text-slate-600">
                          <span className="text-5xl">🏍️</span>
                          <p className="text-sm font-medium">No bike photo uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center">
                    <span className="text-5xl block mb-2">🏍️</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">No motorcycle registered</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Registering your bike model and photo helps coaches prepare.</p>
                    <Link to={ROUTES.EDIT_PROFILE}>
                      <Button variant="outline" size="sm">Register Bike</Button>
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}

          {/* COACH SPECIFIC VIEW */}
          {role === 'COACH' && (
            <>
              {/* Bio & Experience Cards */}
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">About Me</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-1.5">Biography</h4>
                    {profile.bio ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-gray-900/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 whitespace-pre-wrap">
                        {profile.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic bg-slate-50/50 dark:bg-gray-900/10 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700/30">
                        No biography provided yet. Fill this in the edit profile form to introduce yourself.
                      </p>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs uppercase tracking-widest text-slate-400 dark:text-slate-500 font-bold mb-1.5">Teaching Experience</h4>
                    {profile.experience ? (
                      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-gray-900/20 p-4 rounded-xl border border-gray-100 dark:border-gray-700/30 whitespace-pre-wrap">
                        {profile.experience}
                      </p>
                    ) : (
                      <p className="text-sm text-slate-400 dark:text-slate-500 italic bg-slate-50/50 dark:bg-gray-900/10 p-4 rounded-xl border border-dashed border-gray-200 dark:border-gray-700/30">
                        No experience details specified yet. Update your profile to showcase your credentials.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Coach Certificate Verification */}
              <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700/80 p-6 shadow-xl">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Coaching Certificate</h3>

                {/* Status Notice Banners */}
                {profile.status === 'APPROVED' && (
                  <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex gap-3 text-emerald-600 dark:text-emerald-400 text-sm">
                    <span className="text-xl">✅</span>
                    <div>
                      <p className="font-bold">Verified Coach</p>
                      <p className="mt-0.5">Your certificate is verified. You are approved to open track slots and accept lesson bookings.</p>
                    </div>
                  </div>
                )}

                {profile.status === 'PENDING' && (
                  <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/25 flex gap-3 text-yellow-600 dark:text-yellow-400 text-sm">
                    <span className="text-xl">⏳</span>
                    <div>
                      <p className="font-bold">Under Review</p>
                      <p className="mt-0.5">Your certificate is currently under review by our administrators. We will verify your profile shortly.</p>
                    </div>
                  </div>
                )}

                {profile.status === 'REJECTED' && (
                  <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex gap-3 text-red-600 dark:text-red-400 text-sm">
                    <span className="text-xl">❌</span>
                    <div>
                      <p className="font-bold">Verification Failed</p>
                      <p className="mt-0.5">Your certificate was rejected. Please review the requirements and upload a valid license document.</p>
                    </div>
                  </div>
                )}

                {/* Certificate Preview and File Actions */}
                {profile.certificate_url ? (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-gray-900/30 border border-gray-100 dark:border-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">📄</span>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-slate-800 dark:text-white truncate">Submitted License Certificate</p>
                          <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Verification document</p>
                        </div>
                      </div>
                      <a
                        href={getMediaUrl(profile.certificate_url) ?? undefined}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-semibold px-4 py-2 border border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 rounded-lg transition-colors text-slate-600 dark:text-slate-300 bg-white dark:bg-gray-800 shrink-0"
                      >
                        Open Certificate
                      </a>
                    </div>

                    {/* Quick upload trigger to update it */}
                    <div className="pt-2">
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-semibold mb-2">Want to replace or update your certificate?</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploadingCert}
                          className="px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-orange-500 dark:hover:border-orange-400 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-colors"
                        >
                          {certFile ? 'Change Selected File' : 'Choose Certificate File'}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={handleCertificateChange}
                        />

                        {certFile && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-orange-500 dark:text-orange-400 truncate max-w-[200px]">
                              {certFile.name}
                            </span>
                            <Button
                              onClick={handleCertificateSubmit}
                              isLoading={isUploadingCert}
                              disabled={isUploadingCert}
                              variant="primary"
                              size="sm"
                              className="py-1 px-3 text-xs"
                            >
                              Submit Update
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center">
                    <span className="text-5xl block mb-2">📄</span>
                    <p className="text-slate-700 dark:text-slate-300 font-semibold mb-1">No certificate uploaded</p>
                    <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Please submit your credentials certificate to get approved by admin.</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingCert}
                      className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-semibold tracking-wider transition-colors"
                    >
                      {certFile ? 'Change File' : 'Select Certificate File'}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={handleCertificateChange}
                    />

                    {certFile && (
                      <div className="mt-4 flex flex-col items-center justify-center gap-2">
                        <span className="text-xs text-slate-600 dark:text-slate-300">
                          Selected: <strong>{certFile.name}</strong>
                        </span>
                        <Button
                          onClick={handleCertificateSubmit}
                          isLoading={isUploadingCert}
                          disabled={isUploadingCert}
                          variant="primary"
                          size="sm"
                          className="mt-1"
                        >
                          Submit Certificate
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Messages feedback */}
                {certError && (
                  <p className="text-xs text-red-500 font-medium mt-3 bg-red-500/10 p-2.5 rounded-lg border border-red-500/20">
                    ❌ {certError}
                  </p>
                )}
                {certSuccess && (
                  <p className="text-xs text-green-500 font-medium mt-3 bg-green-500/10 p-2.5 rounded-lg border border-green-500/20">
                    ✅ {certSuccess}
                  </p>
                )}
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Basic View (Company, Admin, etc.)
// ---------------------------------------------------------------------------
function BasicProfileView() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: userService.getMe,
    staleTime: 1000 * 60 * 5,
  });

  const dashboardRoute =
    user?.role === 'COMPANY' ? ROUTES.COMPANY_DASHBOARD : ROUTES.ADMIN_DASHBOARD;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Failed to load profile</h2>
          <Link to={dashboardRoute}>
            <Button variant="outline" className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE[data.status] ?? 'bg-gray-700/30 border-gray-600 text-gray-400';
  const statusLabel = STATUS_LABELS[data.status] ?? data.status;
  const roleLabel = ROLE_LABELS[data.role] ?? data.role;
  const initials = data.nombre.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Your account details</p>
      </div>

      <div className="bg-white dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 p-8 shadow-xl">
        {/* Avatar + name */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 border-2 border-orange-500/30 flex items-center justify-center shrink-0 shadow-lg">
            <span className="text-3xl font-black text-orange-500 dark:text-orange-400">{initials}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{data.nombre}</h2>
            <p className="text-sm text-slate-400 dark:text-slate-500">{data.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-bold text-orange-500 uppercase tracking-widest bg-orange-500/10 px-2.5 py-0.5 rounded-full border border-orange-500/25">{roleLabel}</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Data Rows */}
        <div className="grid gap-4">
          <InfoRow label="Email" value={data.email} />
          {data.nombre_empresa && <InfoRow label="Company name" value={data.nombre_empresa} />}
          {data.telefono && <InfoRow label="Phone" value={data.telefono} />}
          <InfoRow label="Role" value={roleLabel} />
          <InfoRow label="Status" value={statusLabel} />
        </div>
      </div>

      <div className="mt-6">
        <Link to={dashboardRoute}>
          <Button variant="outline" fullWidth>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3.5 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</span>
      <span className="text-sm font-bold text-slate-800 dark:text-white">{value}</span>
    </div>
  );
}
