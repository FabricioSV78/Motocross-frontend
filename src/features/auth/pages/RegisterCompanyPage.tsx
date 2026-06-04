import { Link } from 'react-router-dom';
import { RegisterCompanyForm } from '../components/RegisterCompanyForm';
import { AuthLayout, AuthCard } from '../components/AuthLayout';
import { AuthAlert } from '../components/AuthAlert';
import { ROUTES } from '@/router/routes';

export function RegisterCompanyPage() {
  return (
    <AuthLayout
      title="Register your company"
      subtitle="List your motocross tracks and receive bookings from riders."
      backLink={{ to: ROUTES.REGISTER, label: 'Back to account types' }}
      footer={
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            to={ROUTES.LOGIN}
            className="font-semibold text-orange-600 hover:text-orange-500 dark:text-orange-300 dark:hover:text-orange-200"
          >
            Sign in
          </Link>
        </p>
      }
    >
      <AuthCard>
        <RegisterCompanyForm />
      </AuthCard>

      <AuthAlert variant="info" title="Approval required">
        Company accounts are reviewed by an administrator. You will receive access after approval.
      </AuthAlert>
    </AuthLayout>
  );
}
