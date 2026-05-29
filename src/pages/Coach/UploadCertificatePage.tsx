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
        'Certificate uploaded. Your profile is under review — we will notify you when approved.'
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
            <label className="block text-sm font-medium text-gray-200 mb-1">
              Certificate file <span className="text-orange-400">*</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">PDF or image from your computer · max {MAX_SIZE_MB} MB</p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || !!successMessage}
              className="w-full border-2 border-dashed border-gray-600 rounded-xl p-8 text-center hover:border-orange-500/50 transition-colors disabled:opacity-50"
            >
              {selectedFile ? (
                <div>
                  <p className="text-white font-medium text-sm">{selectedFile.name}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                  <span className="text-orange-400 text-xs mt-2 inline-block">Change file</span>
                </div>
              ) : (
                <div className="text-gray-500">
                  <p className="text-white font-medium text-sm mb-1">Click to choose file</p>
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

      <p className="text-center text-gray-500 text-sm mt-6">
        <Link to={ROUTES.LOGIN} className="text-orange-400 hover:text-orange-300">
          Back to sign in
        </Link>
      </p>
    </AuthLayout>
  );
}
