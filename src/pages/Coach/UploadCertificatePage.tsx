import { useState, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authApi } from '@/features/auth/api/authApi';
import { AuthLayout, AuthCard } from '@/features/auth/components/AuthLayout';
import { AuthAlert } from '@/features/auth/components/AuthAlert';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/router/routes';

const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export function UploadCertificatePage() {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const infoMessage = (location.state as { message?: string } | null)?.message;

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Use PDF, JPG, PNG, or WebP only.';
    }
    if (file.size > MAX_SIZE_BYTES) {
      return `File must be under ${MAX_SIZE_MB} MB.`;
    }
    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateFile(file);
    if (err) {
      setApiError(err);
      setSelectedFile(null);
      return;
    }
    setApiError(null);
    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setApiError('Select a certificate file from your computer.');
      return;
    }

    try {
      setIsLoading(true);
      setApiError(null);
      await authApi.uploadCertificate(selectedFile);
      setSuccessMessage(
        'Certificate uploaded. Your profile is under review - we will notify you when approved.'
      );
      setTimeout(() => {
        navigate(ROUTES.LOGIN, {
          state: { message: 'Certificate submitted. Sign in after admin approval.' },
        });
      }, 3500);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Upload certificate"
      subtitle="Required to verify your coaching credentials."
      maxWidth="md"
      footer={null}
    >
      {infoMessage && (
        <AuthAlert variant="success" title="Account created">
          {infoMessage}
        </AuthAlert>
      )}

      <AuthCard className="mt-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          {apiError && (
            <AuthAlert variant="error" title="Upload error">
              {apiError}
            </AuthAlert>
          )}
          {successMessage && (
            <AuthAlert variant="success" title="Submitted">
              {successMessage}
            </AuthAlert>
          )}

          <div>
            <label className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              Certificate file <span className="text-orange-400">*</span>
            </label>
            <p className="mb-3 text-xs text-slate-500 dark:text-slate-400">
              PDF or image from your computer - max {MAX_SIZE_MB} MB
            </p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !!successMessage}
              className="w-full rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/70 p-8 text-center transition-colors hover:border-orange-400 hover:bg-orange-50/60 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10"
            >
              {selectedFile ? (
                <div>
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">{selectedFile.name}</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <span className="mt-2 inline-block text-xs font-semibold text-orange-600 dark:text-orange-300">
                    Change file
                  </span>
                </div>
              ) : (
                <div className="text-slate-500 dark:text-slate-400">
                  <p className="mb-1 text-sm font-semibold text-slate-950 dark:text-white">Click to choose file</p>
                  <p className="text-xs">or drag and drop here</p>
                </div>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileChange}
              className="hidden"
              disabled={isLoading || !!successMessage}
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
            disabled={isLoading || !selectedFile || !!successMessage}
          >
            {isLoading ? 'Uploading...' : 'Submit certificate'}
          </Button>
        </form>
      </AuthCard>

      <div className="mt-4">
        <AuthAlert variant="info" title="What happens next?">
          An administrator reviews your certificate. Once approved, you can set availability and
          receive lesson bookings.
        </AuthAlert>
      </div>

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        <Link
          to={ROUTES.LOGIN}
          className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200"
        >
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
